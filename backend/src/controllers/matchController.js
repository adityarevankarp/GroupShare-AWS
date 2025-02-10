import AWS from "aws-sdk";
import { getFaceprint } from "../models/faceModel.js";

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1' // e.g., 'us-east-1'
});
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();
const getS3KeyFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        // Remove the leading '/' from pathname
        return urlObj.pathname.substring(1);
    } catch (error) {
        console.error("Error parsing S3 URL:", error);
        return url; // Return original string if parsing fails
    }
};
export const matchFace = async (req, res) => {
    try {
        const { userId, groupKey } = req.body;
        if (!userId || !groupKey) {
            return res.status(400).json({ message: "User ID and Group Key are required." });
        }

        // Fetch stored face data from DynamoDB
        const faceData = await getFaceprint(userId);
        if (!faceData || !faceData.s3Url) {
            return res.status(404).json({ message: "No face data found for the user." });
        }

        // Extract the key from the full S3 URL
        const sourceImageKey = getS3KeyFromUrl(faceData.s3Url);
        console.log("Source Image Key:", sourceImageKey);

        // Get images from S3 bucket under the groupKey
        const listParams = {
            Bucket: "groupshare-image-bucket",
            Prefix: `${groupKey}/`
        };

        const s3Objects = await s3.listObjectsV2(listParams).promise();
        if (!s3Objects.Contents || s3Objects.Contents.length === 0) {
            return res.status(404).json({ message: "No images found in the group." });
        }

        // Process each image in the group
        const matchedImages = [];
        for (const obj of s3Objects.Contents) {
            try {
                // Skip if not an image
                if (!obj.Key.match(/\.(jpg|jpeg|png)$/i)) continue;

                // Log the comparison attempt
                console.log(`Comparing source image: ${sourceImageKey} with target image: ${obj.Key}`);

                const compareParams = {
                    SourceImage: {
                        S3Object: {
                            Bucket: "groupshare-image-bucket",
                            Name: sourceImageKey
                        }
                    },
                    TargetImage: {
                        S3Object: {
                            Bucket: "groupshare-image-bucket",
                            Name: obj.Key
                        }
                    },
                    SimilarityThreshold: 90.0
                };

                // Compare faces
                const compareResponse = await rekognition.compareFaces(compareParams).promise();

                if (compareResponse.FaceMatches && compareResponse.FaceMatches.length > 0) {
                    // Sort matches by similarity
                    const bestMatch = compareResponse.FaceMatches.sort((a, b) => 
                        b.Similarity - a.Similarity
                    )[0];

                    matchedImages.push({
                        imageUrl: `https://groupshare-image-bucket.s3.amazonaws.com/${obj.Key}`,
                        similarity: bestMatch.Similarity
                    });

                    console.log(`Match found for image ${obj.Key} with similarity ${bestMatch.Similarity}`);
                }
            } catch (error) {
                console.log(`Skipping image ${obj.Key} due to error:`, error.message);
                continue; // Continue with next image if current one fails
            }
        }

        // Return results
        if (matchedImages.length === 0) {
            return res.status(404).json({ 
                message: "No matching faces found in the group images." 
            });
        }

        return res.status(200).json({
            success: true,
            matches: matchedImages.sort((a, b) => b.similarity - a.similarity)
        });

    } catch (error) {
        console.error("❌ Match Face Error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error matching face", 
            error: error.message 
        });
    }
};


