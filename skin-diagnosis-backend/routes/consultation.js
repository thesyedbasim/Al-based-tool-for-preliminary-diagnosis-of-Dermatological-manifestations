import express from 'express';

const router = express.Router();

// Mock consultation endpoints
router.post('/schedule', (req, res) => {
  const { diagnosisId, preferredDateTime, notes } = req.body;
  
  // In a real app, this would schedule with a doctor
  res.json({
    success: true,
    consultationId: 'cons_' + Date.now(),
    scheduledTime: preferredDateTime,
    message: 'Consultation scheduled successfully'
  });
});

router.get('/available-doctors', (req, res) => {
  // Mock doctor data
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Dermatology',
      experience: '10 years',
      rating: 4.8,
      available: true
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      experience: '8 years',
      rating: 4.7,
      available: true
    }
  ];
  
  res.json(doctors);
});

export default router;