
import express from "express";
import upload from "../middlewares/multer.js"; // Multer for file handling
import { uploadDump } from "../controllers/imageController.js";
import { uploadReferenceImage } from "../controllers/imageController.js";
import { extractAndStoreFace } from "../services/imageService.js";
import { matchFace } from "../controllers/matchController.js";
const router = express.Router();

// Route for first person to upload group photos
router.post("/upload-dump", upload.array("images", 10), (req, res) => {
    console.log("POST /upload-dump hit");
    uploadDump(req, res);
});

router.post("/upload-reference", upload.single("image"), uploadReferenceImage);
router.post("/upload-face", upload.single("image"), async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(userId);
        // Add stricter validation
        if (!userId || userId.trim() === '') {
            return res.status(400).json({ 
                message: "Invalid user ID. Please provide a valid user ID." 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                message: "No image file provided." 
            });
        }

        const imageBuffer = req.file.buffer;
        const imageType = req.file.mimetype;
        const result = await extractAndStoreFace(userId, imageBuffer, imageType);
        res.status(200).json({ message: "Face uploaded successfully", result });
    } catch (error) {
        console.error('Route error:', error);  // Add logging
        res.status(500).json({ 
            message: "Error processing face", 
            error: error.message 
        });
    }
});

router.post("/match-face", upload.single("image"), (req, res) => {
    console.log("POST /match-face hit");
    matchFace(req, res);
});

export default router;
