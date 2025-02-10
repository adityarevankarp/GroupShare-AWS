// import { uploadImagesToS3, saveImageMetadata } from "../services/imageService.js";

// export const uploadDump = async (req, res) => {
//     try {
//         const { groupKey } = req.body;
//         const files = req.files;
//         console.log("Received request");

//         console.log("BODY:", req.body);
//         console.log("FILES:", req.files);
//         if (!groupKey || !files || files.length === 0) {
//             return res.status(400).json({ message: "Group key and images are required." });
//         }

//         const imageUrls = await uploadImagesToS3(files, groupKey);
//         await saveImageMetadata(imageUrls, groupKey);

//         res.status(200).json({ message: "Images uploaded successfully", imageUrls });
//     } catch (error) {
//         res.status(500).json({ message: "Error uploading images", error: error.message });
//     }
// };
import { uploadImagesToS3 } from "../services/imageService.js";
import { extractFaceprint } from "../services/imageService.js";
import { getFaceprint } from "../models/faceModel.js";
export const uploadDump = async (req, res) => {
    try {
        const { groupKey } = req.body;
        const files = req.files;
        console.log("Received request");

        console.log("BODY:", req.body);
        console.log("FILES:", req.files);
        if (!groupKey || !files || files.length === 0) {
            return res.status(400).json({ message: "Group key and images are required." });
        }

        const imageUrls = await uploadImagesToS3(files, groupKey);

        res.status(200).json({ message: "Images uploaded successfully", imageUrls });
    } catch (error) {
        res.status(500).json({ message: "Error uploading images", error: error.message });
    }
};

export const uploadReferenceImage = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(userId); // Assuming each user has a unique ID
        const file = req.file;

        if (!userId || !file) {
            return res.status(400).json({ message: "User ID and image are required." });
        }

        const faceprint = await extractFaceprint(file, userId);

        res.status(200).json({ 
            message: "Faceprint extracted successfully", 
            faceprint 
        });
    } catch (error) {
        res.status(500).json({ message: "Error extracting faceprint", error: error.message });
    }
};

