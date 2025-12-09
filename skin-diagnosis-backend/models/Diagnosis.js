import mongoose from 'mongoose';

const diagnosisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  symptoms: {
    itchiness: String,
    painLevel: Number,
    duration: String,
    sizeChange: String,
    bleeding: String,
    additionalNotes: String
  },
  aiDiagnosis: {
    conditions: [{
      name: String,
      probability: String,
      description: String
    }],
    confidence: String,
    recommendations: [String],
    emergencyIndicators: [String],
    severity: String
  },
  doctorNotes: String,
  status: { type: String, default: 'pending' }, // pending, reviewed, completed
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Diagnosis', diagnosisSchema);