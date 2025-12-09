import express from 'express';
import {
  findNearbyHospitals,
  getHospitalDetails
} from '../controllers/hospitalController.js';

const router = express.Router();

router.get('/nearby', findNearbyHospitals);
router.get('/details/:placeId', getHospitalDetails);

export default router;