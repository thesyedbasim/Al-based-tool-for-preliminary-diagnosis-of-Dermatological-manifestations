import React, { useState } from 'react';
import { Video, Calendar, Clock, User, Star } from 'lucide-react';

const VideoConsultation = ({ diagnosis }) => {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Dermatology',
      rating: 4.8,
      experience: '10 years',
      image: '/doctor1.jpg'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Skin Cancer Specialist',
      rating: 4.7,
      experience: '8 years',
      image: '/doctor2.jpg'
    }
  ];

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch('/api/consultation/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnosisId: diagnosis?.diagnosisId,
          preferredDateTime: `2024-01-15T${selectedSlot}`,
          patientInfo: diagnosis?.report?.patient
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Consultation booked with ${result.doctor.name} at ${selectedSlot}`);
        // Here you would typically redirect to video call or show meeting details
      }
    } catch (error) {
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Video className="h-5 w-5 mr-2 text-blue-600" />
        Video Consultation
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Doctors */}
        <div>
          <h4 className="font-semibold mb-3">Available Dermatologists</h4>
          <div className="space-y-3">
            {doctors.map(doctor => (
              <div key={doctor.id} className="border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{doctor.name}</div>
                    <div className="text-sm text-gray-600">{doctor.specialty}</div>
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                      {doctor.rating} • {doctor.experience}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="font-semibold mb-3">Available Time Slots</h4>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`p-2 border rounded text-sm ${
                  selectedSlot === slot 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-3 w-3 inline mr-1" />
                {slot}
              </button>
            ))}
          </div>

          <button
            onClick={handleBooking}
            disabled={isBooking || !selectedSlot}
            className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isBooking ? 'Booking...' : 'Book Video Consultation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;