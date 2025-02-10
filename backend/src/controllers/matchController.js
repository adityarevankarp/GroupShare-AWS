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


// export const matchFace = async (req, res) => {
//     try {
//         const { userId, groupKey } = req.body;
//         if (!userId || !groupKey) {
//             return res.status(400).json({ message: "User ID and Group Key are required." });
//         }

//         // Fetch stored face data from DynamoDB
//         const faceData = await getFaceprint(userId);
//         if (!faceData || !faceData.s3Url) {
//             return res.status(404).json({ message: "No face data found for the user." });
//         }

//         // Extract the key from the full S3 URL
//         const sourceImageKey = faceData.s3Url;

//         // Get images from S3 bucket under the groupKey
//         const listParams = {
//             Bucket: "groupshare-image-bucket",
//             Prefix: `${groupKey}/`
//         };

//         const s3Objects = await s3.listObjectsV2(listParams).promise();
//         if (!s3Objects.Contents || s3Objects.Contents.length === 0) {
//             return res.status(404).json({ message: "No images found in the group." });
//         }

//         // Process each image in the group
//         const matchedImages = [];
//         for (const obj of s3Objects.Contents) {
//             try {
//                 // Skip if not an image
//                 if (!obj.Key.match(/\.(jpg|jpeg|png)$/i)) continue;

//                 const compareParams = {
//                     SourceImage: {
//                         S3Object: {
//                             Bucket: "groupshare-image-bucket",
//                             Name: sourceImageKey
//                         }
//                     },
//                     TargetImage: {
//                         S3Object: {
//                             Bucket: "groupshare-image-bucket",
//                             Name: obj.Key
//                         }
//                     },
//                     SimilarityThreshold: 90.0
//                 };

//                 // Compare faces
//                 const compareResponse = await rekognition.compareFaces(compareParams).promise();

//                 if (compareResponse.FaceMatches && compareResponse.FaceMatches.length > 0) {
//                     // Sort matches by similarity
//                     const bestMatch = compareResponse.FaceMatches.sort((a, b) => 
//                         b.Similarity - a.Similarity
//                     )[0];

//                     matchedImages.push({
//                         imageUrl: `https://${listParams.Bucket}.s3.amazonaws.com/${obj.Key}`,
//                         similarity: bestMatch.Similarity
//                     });
//                 }
//             } catch (error) {
//                 console.log(`Skipping image ${obj.Key} due to error:`, error.message);
//                 continue; // Continue with next image if current one fails
//             }
//         }

//         // Return results
//         if (matchedImages.length === 0) {
//             return res.status(404).json({ 
//                 message: "No matching faces found in the group images." 
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             matches: matchedImages.sort((a, b) => b.similarity - a.similarity)
//         });

//     } catch (error) {
//         console.error("❌ Match Face Error:", error);
//         return res.status(500).json({ 
//             success: false,
//             message: "Error matching face", 
//             error: error.message 
//         });
//     }
// };

// export const matchFace = async (req, res) => {
//     try {
//         const { userId, groupKey } = req.body;
//         if (!userId || !groupKey) {
//             return res.status(400).json({ message: "User ID and Group Key are required." });
//         }

//         // Fetch stored face data from DynamoDB
//         const faceData = await getFaceprint(userId);
//         if (!faceData || !faceData.faceId) {
//             return res.status(404).json({ message: "No face data found for the user." });
//         }

//         // Get images from S3 bucket under the groupKey
//         const listParams = {
//             Bucket: "groupshare-image-bucket",
//             Prefix: `${groupKey}/`
//         };

//         const s3Objects = await s3.listObjectsV2(listParams).promise();
//         if (!s3Objects.Contents || s3Objects.Contents.length === 0) {
//             return res.status(404).json({ message: "No images found in the group." });
//         }

//         // Process each image in the group
//         const matchedImages = [];
//         for (const obj of s3Objects.Contents) {
//             try {
//                 // Skip if not an image
//                 if (!obj.Key.match(/\.(jpg|jpeg|png)$/i)) continue;

//                 const compareParams = {
//                     SourceFaceId: faceData.faceId,
//                     CollectionId: "FaceCollection", // Your Rekognition collection name
//                     Image: {
//                         S3Object: {
//                             Bucket: "groupshare-image-bucket",
//                             Name: obj.Key
//                         }
//                     },
//                     FaceMatchThreshold: 90.0
//                 };

//                 // Search for face matches
//                 const searchResponse = await rekognition.searchFacesByImage(compareParams).promise();

//                 if (searchResponse.FaceMatches && searchResponse.FaceMatches.length > 0) {
//                     // Sort matches by similarity
//                     const bestMatch = searchResponse.FaceMatches.sort((a, b) => 
//                         b.Similarity - a.Similarity
//                     )[0];

//                     if (bestMatch.Similarity >= 90) {
//                         matchedImages.push({
//                             imageUrl: `https://${listParams.Bucket}.s3.amazonaws.com/${obj.Key}`,
//                             similarity: bestMatch.Similarity
//                         });
//                     }
//                 }
//             } catch (error) {
//                 console.log(`Skipping image ${obj.Key} due to error:`, error.message);
//                 continue; // Continue with next image if current one fails
//             }
//         }

//         // Return results
//         if (matchedImages.length === 0) {
//             return res.status(404).json({ 
//                 message: "No matching faces found in the group images." 
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             matches: matchedImages.sort((a, b) => b.similarity - a.similarity)
//         });

//     } catch (error) {
//         console.error("❌ Match Face Error:", error);
//         return res.status(500).json({ 
//             success: false,
//             message: "Error matching face", 
//             error: error.message 
//         });
//     }
// };


// export const matchFace = async (req, res) => {
//     try {
//         const { userId, groupKey } = req.body;
//         if (!userId || !groupKey) {
//             return res.status(400).json({ message: "User ID and Group Key are required." });
//         }

//         // Fetch stored faceId from DynamoDB
//         const faceData = await getFaceprint(userId);
//         if (!faceData || !faceData.s3Url) {
//             return res.status(404).json({ message: "No face image found for the user." });
//         }
//         const faceImageUrl = faceData.s3Url;

//         // List images in the S3 groupKey folder
//         const listParams = {
//             Bucket: "groupshare-image-bucket",
//             Prefix: `${groupKey}/`,
//         };
//         const s3Objects = await s3.listObjectsV2(listParams).promise();
//         if (!s3Objects.Contents || s3Objects.Contents.length === 0) {
//             return res.status(404).json({ message: "No images found in the group." });
//         }

//         let matchedImages = [];
//         for (const obj of s3Objects.Contents) {
//             const imageKey = obj.Key;
//             const imageParams = { Bucket: "groupshare-image-bucket", Key: imageKey };
//             const imageData = await s3.getObject(imageParams).promise();

//             const compareParams = {
//                 SourceImage: { S3Object: { Bucket: "groupshare-image-bucket", Name: imageKey } },
//                 TargetImage: { S3Object: { Bucket: "groupshare-image-bucket", Name: faceImageUrl } },
//                 SimilarityThreshold: 80,
//             };
//             const compareResponse = await rekognition.compareFaces(compareParams).promise();
//             if (compareResponse.FaceMatches && compareResponse.FaceMatches.length > 0) {
//                 matchedImages.push(`https://${listParams.Bucket}.s3.amazonaws.com/${imageKey}`);
//             }
//         }

//         res.status(200).json({ matchedImages });
//     } catch (error) {
//         console.error("❌ Match Face Error:", error);
//         res.status(500).json({ message: "Error matching face", error: error.message });
//     }
// };

// export const matchFace = async (req, res) => {
//     try {
//         const { userId, groupKey } = req.body;  // Only userId and groupKey are needed

//         if (!userId || !groupKey) {
//             return res.status(400).json({ message: "User ID and Group Key are required." });
//         }

//         // Fetch stored faceId from DynamoDB
//         const faceData = await getFaceprint(userId);
//         if (!faceData || !faceData.faceId) {
//             return res.status(404).json({ message: "No faceId found for the user." });
//         }

//         const faceId = faceData.faceId;
//         console.log("✅ Retrieved faceId:", faceId);

//         // Search for matching faces in the collection
//         const searchParams = {
//             CollectionId: "FaceCollection",
//             FaceId: faceId,
//             MaxFaces: 10,
//         };

//         const searchResponse = await rekognition.searchFaces(searchParams).promise();
//         if (!searchResponse.FaceMatches || searchResponse.FaceMatches.length === 0) {
//             return res.status(404).json({ message: "No matching faces found." });
//         }

//         const matchedFaceIds = searchResponse.FaceMatches.map(match => match.Face.FaceId);
//         console.log("✅ Matched faceIds:", matchedFaceIds);

//         res.status(200).json({ matchedFaceIds });
//     } catch (error) {
//         console.error("❌ Match Face Error:", error);
//         res.status(500).json({ message: "Error matching face", error: error.message });
//     }
// };
