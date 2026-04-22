import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const uploadsRootDir = path.resolve(__dirname, '..', '..', 'uploads');
const emergencyUploadsDir = path.join(uploadsRootDir, 'emergencies');

fs.mkdirSync(emergencyUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, emergencyUploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeBaseName = path
      .parse(file.originalname || 'evidence')
      .name
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 60) || 'evidence';
    const extension = file.mimetype.startsWith('image/')
      ? path.extname(file.originalname || '') || '.jpg'
      : '.mp4';
    cb(null, `${Date.now()}-${safeBaseName}${extension}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image and video uploads are allowed.'));
};

export const emergencyMediaUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 2,
  },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);
