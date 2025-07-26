import multer from "multer";
import path from "path";
import fs from "fs"

// Ensure the upload path exist
const uploadPath = path.join(__dirname, "..", "uploads", "avatars");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

export const uploadAvatar = multer({ storage });