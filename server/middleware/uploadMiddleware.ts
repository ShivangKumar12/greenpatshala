// server/middleware/uploadMiddleware.ts - WITH THUMBNAIL DIRECTORY
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  'uploads/courses/videos',
  'uploads/courses/pdfs',
  'uploads/courses/assets',
  'uploads/courses/thumbnails',    // ✅ ADD THIS FOR COURSE THUMBNAILS
  'uploads/study-materials',
  'uploads/thumbnails',             // General thumbnails
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`); // ✅ ADDED LOG
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/courses/assets';
    
    // Check if this is a study material upload
    if (req.baseUrl?.includes('study-materials')) {
      folder = 'uploads/study-materials';
    }
    // ✅ ADD THUMBNAIL DETECTION
    else if (req.path?.includes('upload-thumbnail')) {
      folder = 'uploads/courses/thumbnails';
    }
    // Course uploads
    else if (file.mimetype.startsWith('video/')) {
      folder = 'uploads/courses/videos';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'uploads/courses/pdfs';
    } else if (file.mimetype.startsWith('image/')) {
      folder = 'uploads/courses/assets';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Only videos, PDFs, and images are accepted.`));
  }
};

// Multer instance for course files
export const uploadCourseFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

// Multer instance for study materials (PDFs only)
const studyMaterialFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for study materials'));
  }
};

export const uploadStudyMaterial = multer({
  storage,
  fileFilter: studyMaterialFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max for study materials
  },
});

// Export single file upload middleware
export const uploadSingle = uploadStudyMaterial.single('file');
