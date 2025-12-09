import React, { useState } from 'react';
import { MapPin, Phone, Star, Navigation, Clock } from 'lucide-react';

const Hospitals = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  const findNearbyHospitals = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Mock hospital data
          const mockHospitals = [
            {
              id: '1',
              name: 'City Dermatology Center',
              address: '123 Medical Drive, Cityville, State 12345',
              rating: 4.5,
              totalRatings: 128,
              location: { lat: latitude + 0.01, lng: longitude + 0.01 },
              openNow: true,
              distance: '2.3 km',
              specialty: 'Dermatology',
              phone: '+1-555-0123',
              hours: 'Mon-Fri: 8:00 AM - 6:00 PM'
            },
            {
              id: '2',
              name: 'Skin Care Specialists',
              address: '456 Health Avenue, Townsville, State 12345',
              rating: 4.8,
              totalRatings: 95,
              location: { lat: latitude - 0.02, lng: longitude + 0.015 },
              openNow: true,
              distance: '3.1 km',
              specialty: 'Skin Cancer Center',
              phone: '+1-555-0124',
              hours: 'Mon-Sat: 7:00 AM - 7:00 PM'
            },
            {
              id: '3',
              name: 'University Medical Hospital',
              address: '789 College Road, University District, State 12345',
              rating: 4.3,
              totalRatings: 256,
              location: { lat: latitude + 0.015, lng: longitude - 0.01 },
              openNow: true,
              distance: '1.8 km',
              specialty: 'General Dermatology',
              phone: '+1-555-0125',
              hours: '24/7 Emergency Services'
            }
          ];
          
          setHospitals(mockHospitals);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const getDirections = (hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Skin Hospitals</h1>
        <p className="text-gray-600">Locate nearby dermatology clinics and specialists</p>
      </div>

      {/* Location Button */}
      <div className="text-center mb-8">
        <button
          onClick={findNearbyHospitals}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Find Nearby Skin Hospitals
        </button>
        {userLocation && (
          <p className="text-sm text-gray-600 mt-2">
            Location found: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
      </div>

      {/* Hospitals List */}
      <div className="space-y-6">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {hospital.openNow ? 'Open Now' : 'Closed'}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{hospital.address}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{hospital.phone}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <span className="text-sm">{hospital.hours}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-semibold">{hospital.rating}</span>
                    <span className="text-gray-500 ml-1">({hospital.totalRatings} reviews)</span>
                  </div>
                  <div className="text-gray-500">•</div>
                  <div className="text-gray-600">{hospital.distance} away</div>
                  <div className="text-gray-500">•</div>
                  <div className="text-blue-600 font-semibold">{hospital.specialty}</div>
                </div>
              </div>

              <div className="lg:ml-6 mt-4 lg:mt-0 flex space-x-2">
                <button
                  onClick={() => getDirections(hospital)}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </button>
                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {hospitals.length === 0 && userLocation && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Hospitals Found</h3>
          <p className="text-gray-500">Try searching in a different area or check your location settings.</p>
        </div>
      )}

      {/* Instructions */}
      {hospitals.length === 0 && !userLocation && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Find Dermatology Care Near You</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Click the button above to find skin hospitals and dermatology clinics in your area. 
            We'll use your current location to show the nearest facilities.
          </p>
        </div>
      )}
    </div>
  );
};

export default Hospitals;