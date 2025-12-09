import express from 'express';
import multer from 'multer';
import {
  uploadAndDiagnose,
  getFollowUpQuestions,
  getDiagnosisHistory
} from '../controllers/diagnosisController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', upload.single('image'), uploadAndDiagnose);
router.post('/questions', getFollowUpQuestions);
router.get('/history/:userId', getDiagnosisHistory);

export default router;