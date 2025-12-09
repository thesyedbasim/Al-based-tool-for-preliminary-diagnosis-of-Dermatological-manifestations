import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Stethoscope, MapPin, FileText, TrendingUp, Users, Shield } from 'lucide-react';

const Dashboard = () => {
  const features = [
    {
      icon: Camera,
      title: 'AI Skin Diagnosis',
      description: 'Upload skin images for instant AI-powered analysis',
      path: '/diagnosis',
      color: 'bg-blue-500'
    },
    {
      icon: Stethoscope,
      title: 'Consult Dermatologist',
      description: 'Video consultation with certified skin specialists',
      path: '/consultation',
      color: 'bg-green-500'
    },
    {
      icon: MapPin,
      title: 'Find Hospitals',
      description: 'Locate nearby dermatology clinics and hospitals',
      path: '/hospitals',
      color: 'bg-purple-500'
    },
    {
      icon: FileText,
      title: 'Health Records',
      description: 'Access your diagnosis history and reports',
      path: '/records',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    { label: 'AI Accuracy', value: '95%', icon: TrendingUp },
    { label: 'Users Helped', value: '10K+', icon: Users },
    { label: 'Doctors Available', value: '50+', icon: Shield }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          AI-Powered Skin Disease Diagnosis
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get instant preliminary analysis of skin conditions using advanced AI technology. 
          Connect with dermatologists and find the best care near you.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link
              key={index}
              to={feature.path}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Start Section */}
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">
          Upload a skin image now for instant AI analysis or schedule a consultation with a dermatologist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/diagnosis"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start AI Diagnosis
          </Link>
          <Link
            to="/consultation"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;