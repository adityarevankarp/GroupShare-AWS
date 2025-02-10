// import AWS from "aws-sdk";
// import { v4 as uuidv4 } from "uuid";
// import { saveImages } from "../models/imageModel.js";

// AWS.config.update({ region: "us-east-1" });
// const s3 = new AWS.S3();

// export const uploadImagesToS3 = async (files, groupKey) => {
//     const uploadPromises = files.map((file) => {
//         const uniqueFileName = `${uuidv4()}_${file.originalname}`; // Unique key for S3
//         const params = {
//             Bucket: "groupshare-image-bucket",
//             Key: `${groupKey}/${uniqueFileName}`,  // Ensure uniqueness
//             Body: file.buffer,
//             ContentType: file.mimetype,
//         };
        
//         return s3.upload(params).promise().then((data) => {
//             console.log("Uploaded Image URL:", data.Location); // 🔍 Log URL
//             return String(data.Location); // 🔴 Ensure it's a string
//         });
//     });

//     return Promise.all(uploadPromises);
// };


// export const saveImageMetadata = async (imageUrls, groupKey) => {
//     console.log("Before Saving - groupKey:", groupKey); // 🔍 Debugging
//     console.log("Before Saving - imageUrls:", imageUrls);
//     // return saveImages(groupKey, imageUrls);

//     const formattedGroupKey = Array.isArray(groupKey) ? groupKey[0] : groupKey; // 🔴 Convert array to string if needed

//     return saveImages(formattedGroupKey, imageUrls.map(url => String(url)));
// };
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { saveFaceprint } from "../models/faceModel.js"
AWS.config.update({ region: "us-east-1" });
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
export const uploadImagesToS3 = async (files, groupKey) => {
    const uploadPromises = files.map((file) => {
        const uniqueFileName = `${uuidv4()}_${file.originalname}`; // Unique key for S3
        const params = {
            Bucket: "groupshare-image-bucket",
            Key: `${groupKey}/${uniqueFileName}`, // Ensure uniqueness
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        return s3.upload(params).promise().then((data) => {
            console.log("Uploaded Image URL:", data.Location); // 🔍 Log URL
            return data.Location;
        });
    });

    return Promise.all(uploadPromises);
};
// the below code only extrancts face print and uploads in s3 the image
export const extractFaceprint = async (file, userId) => {
    // Step 1: Upload image to S3
    
    // const uniqueFileName = `${uuidv4()}_${file.originalname}`;
    // const s3Params = {
    //     Bucket: "groupshare-image-bucket",
    //     Key: `faceprints/${userId}/${uniqueFileName}`,
    //     Body: file.buffer,
    //     ContentType: file.mimetype,
    // };

    // const s3UploadResult = await s3.upload(s3Params).promise();
    // console.log("Reference image uploaded to S3:", s3UploadResult.Location);

    // // Step 2: Extract face embedding using Rekognition
    // const rekognitionParams = {
    //     Image: { S3Object: { Bucket: "groupshare-image-bucket", Name: `faceprints/${userId}/${uniqueFileName}` } },
    //     CollectionId: "FaceCollection", // Rekognition collection where we store faces
    //     ExternalImageId: userId, // Associates face with user ID
    //     DetectionAttributes: ["DEFAULT"],
    // };

    // const rekognitionResult = await rekognition.indexFaces(rekognitionParams).promise();

    // if (!rekognitionResult.FaceRecords || rekognitionResult.FaceRecords.length === 0) {
    //     throw new Error("No faces detected in image.");
    // }

    // // Extract the face ID (used later for comparisons)
    // const faceId = rekognitionResult.FaceRecords[0].Face.FaceId;
    // console.log(`Face indexed successfully for user ${userId}, FaceId: ${faceId}`);

    // return { faceId, s3Url: s3UploadResult.Location };
    return null
};
const BUCKET_NAME = "groupshare-image-bucket";
export const extractAndStoreFace = async (userId, imageBuffer, imageType) => {
    try {
        // Step 1️⃣: Detect Faces in the Image
        if (!userId) {
            throw new Error('userId is required');
        }
        
        if (!imageBuffer) {
            throw new Error('imageBuffer is required');
        }
        const detectParams = {
            Image: { Bytes: imageBuffer },
            Attributes: ["DEFAULT"],
        };
        const detectResponse = await rekognition.detectFaces(detectParams).promise();

        if (!detectResponse.FaceDetails || detectResponse.FaceDetails.length === 0) {
            throw new Error("No faces detected.");
        }

        // Step 2️⃣: Index the Face to get `faceId`
        const indexParams = {
            CollectionId: "FaceCollection",
            Image: { Bytes: imageBuffer },
            ExternalImageId: uuidv4(), // Unique ID for face
        };
        const indexResponse = await rekognition.indexFaces(indexParams).promise();

        if (!indexResponse.FaceRecords || indexResponse.FaceRecords.length === 0) {
            throw new Error("Face indexing failed.");
        }

        const faceId = indexResponse.FaceRecords[0].Face.FaceId;
        console.log("✅ Face Indexed, FaceId:", faceId);

        // Step 3️⃣: Upload Cropped Face to S3
        const fileName = `faces/${userId}/${faceId}.jpg`;
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: imageBuffer,
            ContentType: imageType,
        };

        const s3UploadResponse = await s3.upload(s3Params).promise();
        const s3Url = s3UploadResponse.Location;
        console.log("✅ Face uploaded to S3:", s3Url);

        // Step 4️⃣: Save Face Metadata to DynamoDB
        await saveFaceprint(userId, faceId, s3Url);

        return { faceId, s3Url };
    } catch (error) {
        console.error("❌ Face Processing Error:", error);
        throw error;
    }
};