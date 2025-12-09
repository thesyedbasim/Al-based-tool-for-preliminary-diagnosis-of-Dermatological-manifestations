import React, { useState } from 'react';
import { Calendar, Clock, Video, Star, MapPin, Phone } from 'lucide-react';

const Consultation = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState('');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Dermatology',
      experience: '10 years',
      rating: 4.8,
      available: true,
      nextAvailable: '2 hours',
      languages: ['English', 'Spanish'],
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      experience: '8 years',
      rating: 4.7,
      available: true,
      nextAvailable: '1 hour',
      languages: ['English', 'Mandarin'],
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      name: 'Dr. Priya Sharma',
      specialty: 'Skin Cancer Specialist',
      experience: '12 years',
      rating: 4.9,
      available: false,
      nextAvailable: 'Tomorrow',
      languages: ['English', 'Hindi'],
      image: '/api/placeholder/100/100'
    }
  ];

  const scheduleConsultation = () => {
    if (!selectedDoctor || !selectedDateTime) {
      alert('Please select a doctor and date/time');
      return;
    }
    alert(`Consultation scheduled with ${selectedDoctor.name} for ${selectedDateTime}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Consult a Dermatologist</h1>
        <p className="text-gray-600">Book video consultations with certified skin specialists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctors List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Dermatologists</h2>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                  selectedDoctor?.id === doctor.id ? 'border-2 border-blue-500' : 'border border-gray-200'
                } ${!doctor.available ? 'opacity-60' : ''}`}
                onClick={() => doctor.available && setSelectedDoctor(doctor)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-semibold">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-700 ml-1">{doctor.rating}</span>
                        <span className="text-sm text-gray-500 ml-2">•</span>
                        <span className={`text-sm ml-2 ${
                          doctor.available ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {doctor.available ? 'Available now' : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Next available:</div>
                    <div className="text-sm font-semibold text-gray-700">{doctor.nextAvailable}</div>
                  </div>
                </div>
                {!doctor.available && (
                  <div className="mt-3 p-2 bg-yellow-50 text-yellow-700 rounded text-sm">
                    Currently unavailable for new consultations
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Schedule Consultation</h2>
          
          {selectedDoctor ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Selected Doctor</h3>
                <p className="text-blue-700">{selectedDoctor.name}</p>
                <p className="text-sm text-blue-600">{selectedDoctor.specialty}</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  className="border rounded p-2 w-full"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Consultation Type</label>
                <select className="border rounded p-2 w-full">
                  <option value="video">Video Consultation (30 min)</option>
                  <option value="followup">Follow-up (15 min)</option>
                  <option value="extended">Extended Consultation (45 min)</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Consultation Fee</span>
                  <span className="font-semibold">$99</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Insurance</span>
                  <span>May cover</span>
                </div>
              </div>

              <button
                onClick={scheduleConsultation}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Video className="h-4 w-4 mr-2" />
                Schedule Video Consultation
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Select a doctor to schedule consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consultation;