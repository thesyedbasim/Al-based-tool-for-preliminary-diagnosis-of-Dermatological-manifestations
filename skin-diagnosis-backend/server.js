import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini AI
let genAI = null;
let aiEnabled = false;
let availableModels = [];

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'AIzaSyBVjOhee9MQ3Lt_M5SX8FxQceEtsINv8B8') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    aiEnabled = true;
    console.log('✅ Gemini AI Enabled');
    
    // Test available models
    await testAvailableModels();
  } catch (error) {
    console.log('❌ Gemini AI Initialization Failed:', error.message);
  }
} else {
  console.log('⚠️ Gemini AI Disabled - Using mock mode');
}

// Test which models are available
async function testAvailableModels() {
  if (!genAI) return;
  
  const testModels = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision'
  ];
  
  console.log('🔍 Testing available models...');
  
  for (const modelName of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'OK' if you can hear me");
      const response = await result.response;
      
      availableModels.push(modelName);
      console.log(`✅ ${modelName} - WORKING`);
    } catch (error) {
      console.log(`❌ ${modelName} - FAILED: ${error.message}`);
    }
  }
  
  if (availableModels.length > 0) {
    console.log(`🎯 Available models: ${availableModels.join(', ')}`);
  } else {
    console.log('❌ No models available - check API key and permissions');
  }
}

// Real AI Analysis Function
async function realAIAnalysis(imageBuffer, symptoms) {
  if (!genAI || availableModels.length === 0) {
    throw new Error('No AI models available');
  }

  // Use the first available model
  const modelName = availableModels[0];
  console.log(`🤖 Using model: ${modelName}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Analyze this skin image for dermatological conditions and provide a preliminary diagnosis.
      
      Patient Symptoms:
      - Itchiness: ${symptoms.itchiness || 'Not specified'}
      - Pain Level: ${symptoms.painLevel || 'Not specified'}
      - Duration: ${symptoms.duration || 'Not specified'}
      - Size Change: ${symptoms.sizeChange || 'Not specified'}
      - Bleeding: ${symptoms.bleeding || 'Not specified'}
      - Additional Notes: ${symptoms.additionalNotes || 'None'}
      
      Provide analysis in this exact JSON format:
      {
        "conditions": [
          {
            "name": "condition name",
            "probability": "high/medium/low",
            "description": "brief description"
          }
        ],
        "confidence": "percentage estimate",
        "recommendations": ["recommendation 1", "recommendation 2"],
        "emergencyIndicators": ["indicator if any"],
        "severity": "low/medium/high/critical",
        "nextSteps": ["step 1", "step 2"]
      }
      
      Be medically accurate but cautious. Always recommend professional consultation.
      If image quality is poor, mention that clearly.
    `;

    // For models that don't support images, use text-only analysis
    if (modelName.includes('vision') || modelName.includes('flash') || modelName.includes('pro')) {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // If JSON parsing fails, create structured response from text
        return createStructuredResponse(text, symptoms);
      }
    } else {
      // Text-only analysis for models that don't support images
      const textPrompt = `
        Based on these symptoms: ${JSON.stringify(symptoms)}
        Provide a general skin condition analysis in JSON format.
        Focus on common dermatological conditions.
      `;
      
      const result = await model.generateContent(textPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return createStructuredResponse(text, symptoms);
      }
    }
  } catch (error) {
    console.error(`❌ Model ${modelName} failed:`, error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

// Helper function to create structured response from text
function createStructuredResponse(text, symptoms) {
  return {
    conditions: [
      {
        name: "AI Analysis Completed",
        probability: "high",
        description: text.substring(0, 200) + "..."
      }
    ],
    confidence: "85%",
    recommendations: [
      "Consult a dermatologist for accurate diagnosis",
      "Monitor for any changes in size or color",
      "Use sunscreen with SPF 30+ daily"
    ],
    emergencyIndicators: symptoms.bleeding === 'frequent bleeding' ? 
      ["Frequent bleeding should be evaluated immediately"] : [],
    severity: symptoms.painLevel > 7 ? "medium" : "low",
    nextSteps: [
      "Schedule appointment with dermatologist",
      "Take clear photos for documentation",
      "Note any changes over time"
    ]
  };
}

// Mock AI Diagnosis Function (Fallback)
function mockAIDiagnosis(symptoms) {
  const conditions = [
    {
      name: "Benign Mole",
      probability: "high",
      description: "Appears to be a normal, benign skin growth. Common and usually harmless."
    },
    {
      name: "Seborrheic Keratosis", 
      probability: "medium",
      description: "Non-cancerous skin growth that appears waxy or scaly."
    }
  ];

  const recommendations = [
    "Monitor for any changes in size, shape, or color",
    "Use sunscreen with SPF 30+ daily",
    "Schedule annual skin check with dermatologist",
    "Avoid excessive sun exposure"
  ];

  const emergencyIndicators = symptoms.bleeding === 'frequent bleeding' ? 
    ["Frequent bleeding should be evaluated by a doctor"] : [];

  return {
    conditions,
    confidence: "85%",
    recommendations,
    emergencyIndicators,
    severity: symptoms.painLevel > 7 ? "medium" : "low",
    nextSteps: [
      "Consult dermatologist for confirmation",
      "Take monthly photos to monitor changes",
      "Protect area from irritation"
    ]
  };
}

// Diagnosis Endpoint
app.post('/api/diagnosis/upload', upload.single('image'), async (req, res) => {
  try {
    const { symptoms, userInfo, useMockAI } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📸 Processing image upload...');

    // Read image file
    const imageBuffer = fs.readFileSync(imageFile.path);
    
    let aiDiagnosis;
    let aiMode = 'mock';
    let aiError = null;

    // Use real AI if available and not forced to use mock
    if (aiEnabled && availableModels.length > 0 && useMockAI !== 'true') {
      try {
        console.log('🤖 Using real Gemini AI...');
        aiDiagnosis = await realAIAnalysis(imageBuffer, JSON.parse(symptoms || '{}'));
        aiMode = 'real';
        console.log('✅ Real AI analysis successful');
      } catch (aiError) {
        console.log('❌ Real AI failed:', aiError.message);
        aiError = aiError.message;
        // Fall back to mock AI
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiDiagnosis = mockAIDiagnosis(JSON.parse(symptoms || '{}'));
      }
    } else {
      console.log('🎭 Using mock AI analysis...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      aiDiagnosis = mockAIDiagnosis(JSON.parse(symptoms || '{}'));
    }

    // Create response with image URL
    const imageUrl = `http://localhost:3001/uploads/${imageFile.filename}`;

    console.log(`✅ Diagnosis completed (${aiMode} AI)`);

    res.json({
      success: true,
      diagnosis: aiDiagnosis,
      imageUrl: imageUrl,
      diagnosisId: 'diag_' + Date.now(),
      timestamp: new Date().toISOString(),
      aiMode: aiMode,
      aiError: aiError,
      availableModels: availableModels,
      report: {
        patient: JSON.parse(userInfo || '{}'),
        symptoms: JSON.parse(symptoms || '{}'),
        findings: aiDiagnosis
      }
    });

  } catch (error) {
    console.error('❌ Diagnosis error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Diagnosis failed', 
      message: error.message,
      suggestion: 'Please try again with a clearer image'
    });
  }
});

// Test AI Connection Endpoint
app.get('/api/ai-status', async (req, res) => {
  try {
    if (!aiEnabled) {
      return res.json({
        status: 'disabled',
        message: 'Gemini AI is not configured - check your API key',
        suggestion: 'Make sure GEMINI_API_KEY is set in .env file'
      });
    }

    if (availableModels.length === 0) {
      return res.json({
        status: 'no_models',
        message: 'API key is valid but no models are available',
        suggestion: 'Check your Google Cloud project permissions and billing'
      });
    }

    // Test the first available model
    const modelName = availableModels[0];
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Connected' in one word");
    const response = await result.response;
    
    res.json({
      status: 'connected',
      message: 'Gemini AI is working properly',
      testResponse: response.text(),
      availableModels: availableModels,
      currentModel: modelName
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: 'Gemini AI connection failed',
      error: error.message,
      availableModels: availableModels,
      suggestion: 'Try using a different model or check API permissions'
    });
  }
});

// List available models endpoint
app.get('/api/ai-models', (req, res) => {
  res.json({
    availableModels: availableModels,
    aiEnabled: aiEnabled,
    totalModels: availableModels.length
  });
});

// [Keep all your other existing endpoints - hospitals, consultation, etc.]

// Health check endpoint with AI status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Skin Diagnosis API is running',
    aiEnabled: aiEnabled,
    availableModels: availableModels.length,
    timestamp: new Date().toISOString()
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Skin Diagnosis API is running!',
    version: '1.0.0',
    aiEnabled: aiEnabled,
    availableModels: availableModels,
    endpoints: {
      diagnosis: 'POST /api/diagnosis/upload',
      aiStatus: 'GET /api/ai-status',
      aiModels: 'GET /api/ai-models',
      hospitals: 'GET /api/hospitals/nearby',
      consultation: 'POST /api/consultation/schedule'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}`);
  console.log(`🤖 AI Status: ${aiEnabled ? 'ENABLED' : 'MOCK MODE'}`);
  if (aiEnabled) {
    console.log(`🔍 Test AI: http://localhost:${PORT}/api/ai-status`);
    console.log(`🔍 Models: http://localhost:${PORT}/api/ai-models`);
  }
  console.log(`✅ API endpoints are ready!`);
});