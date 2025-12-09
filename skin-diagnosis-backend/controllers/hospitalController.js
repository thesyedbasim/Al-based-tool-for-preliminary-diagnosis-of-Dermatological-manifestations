import axios from 'axios';

export const findNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Using Google Places API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: 'hospital',
          keyword: 'dermatology skin',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    const hospitals = response.data.results.map(hospital => ({
      id: hospital.place_id,
      name: hospital.name,
      address: hospital.vicinity,
      rating: hospital.rating,
      totalRatings: hospital.user_ratings_total,
      location: hospital.geometry.location,
      openNow: hospital.opening_hours?.open_now
    }));

    res.json({
      hospitals,
      userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

  } catch (error) {
    console.error('Hospital search error:', error);
    res.status(500).json({ 
      error: 'Failed to find hospitals',
      message: error.message 
    });
  }
};

export const getHospitalDetails = async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get hospital details' });
  }
};