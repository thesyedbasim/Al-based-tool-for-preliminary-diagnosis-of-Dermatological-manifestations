import { GeminiService } from '../services/geminiService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import Diagnosis from '../models/Diagnosis.js';
import User from '../models/User.js';

export const uploadAndDiagnose = async (req, res) => {
  try {
    const { symptoms, userInfo } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload image to Cloudinary
    const uploadResult = await CloudinaryService.uploadImage(imageFile.path);
    
    // Get or create user
    let user = await User.findOne({ email: userInfo?.email });
    if (!user && userInfo) {
      user = new User(userInfo);
      await user.save();
    }

    // Analyze with Gemini AI
    const aiDiagnosis = await GeminiService.analyzeSkinImage(uploadResult.secure_url, symptoms);

    // Save diagnosis to database
    const diagnosis = new Diagnosis({
      userId: user?._id,
      imageUrl: uploadResult.secure_url,
      symptoms: symptoms,
      aiDiagnosis: aiDiagnosis
    });
    await diagnosis.save();

    res.json({
      success: true,
      diagnosis: aiDiagnosis,
      imageUrl: uploadResult.secure_url,
      diagnosisId: diagnosis._id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ 
      error: 'Diagnosis failed', 
      message: error.message 
    });
  }
};

export const getFollowUpQuestions = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    const questions = await GeminiService.generateQuestions(symptoms);
    res.json(questions);
  } catch (error) {
    console.error('Questions error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

export const getDiagnosisHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const diagnoses = await Diagnosis.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    
    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagnosis history' });
  }
};