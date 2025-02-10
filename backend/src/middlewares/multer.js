import multer from "multer";

// Set storage to memory for direct upload to S3 (or use disk storage for local storage)
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB per file
});

export default upload;
