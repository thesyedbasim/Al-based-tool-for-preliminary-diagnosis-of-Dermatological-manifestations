import React, { useState } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, Download } from 'lucide-react';
import axios from 'axios';

const Diagnosis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState({
    itchiness: '',
    painLevel: '',
    duration: '',
    sizeChange: '',
    bleeding: '',
    additionalNotes: ''
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    age: '',
    gender: ''
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSymptomChange = (key, value) => {
    setSymptoms(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUserInfoChange = (key, value) => {
    setUserInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      alert('Please upload an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Convert dataURL to file
    const response = await fetch(selectedImage);
    const blob = await response.blob();
    const file = new File([blob], 'skin-image.jpg', { type: 'image/jpeg' });
    
    formData.append('image', file);
    formData.append('symptoms', JSON.stringify(symptoms));
    formData.append('userInfo', JSON.stringify(userInfo));

    try {
      const result = await axios.post('/api/diagnosis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setDiagnosis(result.data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const downloadReport = () => {
    if (!diagnosis) return;
    
    const report = {
      patient: userInfo,
      symptoms: symptoms,
      diagnosis: diagnosis.diagnosis,
      imageUrl: diagnosis.imageUrl,
      timestamp: diagnosis.timestamp
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skin-diagnosis-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Skin Disease Diagnosis</h1>
        <p className="text-gray-600">Upload a clear image of your skin condition for preliminary analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image Upload & Symptoms */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="border rounded p-2"
                value={userInfo.name}
                onChange={(e) => handleUserInfoChange('name', e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="border rounded p-2"
                value={userInfo.email}
                onChange={(e) => handleUserInfoChange('email', e.target.value)}
              />
              <input
                type="number"
                placeholder="Age"
                className="border rounded p-2"
                value={userInfo.age}
                onChange={(e) => handleUserInfoChange('age', e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={userInfo.gender}
                onChange={(e) => handleUserInfoChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Skin Image</h2>
            <div className="upload-area p-8 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="inline h-4 w-4 mr-2" />
                Choose Image
              </label>
              <p className="text-sm text-gray-500 mt-2">JPEG, PNG, WebP up to 10MB</p>
            </div>
            {selectedImage && (
              <div className="mt-4">
                <img
                  src={selectedImage}
                  alt="Uploaded skin condition"
                  className="max-w-full h-64 object-contain mx-auto rounded border"
                />
              </div>
            )}
          </div>

          {/* Symptoms Questionnaire */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Symptoms</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Is it itchy?</label>
                <select
                  className="border rounded p-2 w-full"
                  value={symptoms.itchiness}
                  onChange={(e) => handleSymptomChange('itchiness', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="not itchy">Not Itchy</option>
                  <option value="mild itch">Mild Itch</option>
                  <option value="moderate itch">Moderate Itch</option>
                  <option value="severe itch">Severe Itch</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Pain Level (1-10)</label>
                <select
                  className="border rounded p-2 w-full"
                  value={symptoms.painLevel}
                  onChange={(e) => handleSymptomChange('painLevel', e.target.value)}
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} - {num <= 3 ? 'Mild' : num <= 7 ? 'Moderate' : 'Severe'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">How long has it been there?</label>
                <select
                  className="border rounded p-2 w-full"
                  value={symptoms.duration}
                  onChange={(e) => handleSymptomChange('duration', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="less than week">Less than a week</option>
                  <option value="1-4 weeks">1-4 weeks</option>
                  <option value="1-6 months">1-6 months</option>
                  <option value="over 6 months">Over 6 months</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Has it changed size?</label>
                <select
                  className="border rounded p-2 w-full"
                  value={symptoms.sizeChange}
                  onChange={(e) => handleSymptomChange('sizeChange', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="no change">No Change</option>
                  <option value="growing slowly">Growing Slowly</option>
                  <option value="growing quickly">Growing Quickly</option>
                  <option value="shrinking">Shrinking</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Any bleeding or discharge?</label>
                <select
                  className="border rounded p-2 w-full"
                  value={symptoms.bleeding}
                  onChange={(e) => handleSymptomChange('bleeding', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="occasional bleeding">Occasional Bleeding</option>
                  <option value="frequent bleeding">Frequent Bleeding</option>
                  <option value="discharge only">Discharge Only</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  className="border rounded p-2 w-full"
                  rows="3"
                  placeholder="Any other symptoms or information..."
                  value={symptoms.additionalNotes}
                  onChange={(e) => handleSymptomChange('additionalNotes', e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={analyzeImage}
            disabled={loading || !selectedImage}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing with AI...
              </span>
            ) : (
              'Analyze with AI'
            )}
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {diagnosis && (
            <div className="bg-white rounded-lg shadow-md p-6 diagnosis-card">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">AI Diagnosis Results</h2>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
              
              {/* Severity Alert */}
              {diagnosis.diagnosis?.severity && (
                <div className={`p-4 rounded-lg mb-6 border ${getSeverityColor(diagnosis.diagnosis.severity)}`}>
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Severity: {diagnosis.diagnosis.severity.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Possible Conditions</h3>
                <div className="space-y-3">
                  {diagnosis.diagnosis?.conditions?.map((condition, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{condition.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          condition.probability === 'high' ? 'bg-red-100 text-red-800' :
                          condition.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {condition.probability} probability
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence */}
              {diagnosis.diagnosis?.confidence && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Confidence Level</h3>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{diagnosis.diagnosis.confidence}</span>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {diagnosis.diagnosis?.recommendations && diagnosis.diagnosis.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {diagnosis.diagnosis.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emergency Indicators */}
              {diagnosis.diagnosis?.emergencyIndicators && diagnosis.diagnosis.emergencyIndicators.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-red-600">⚠️ Emergency Indicators</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {diagnosis.diagnosis.emergencyIndicators.map((indicator, index) => (
                      <li key={index} className="text-red-700">{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {diagnosis.diagnosis?.nextSteps && diagnosis.diagnosis.nextSteps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {diagnosis.diagnosis.nextSteps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                  Consult Doctor
                </button>
                <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                  Find Hospitals
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!diagnosis && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Analysis Yet</h3>
              <p className="text-gray-500">Upload a skin image and click "Analyze with AI" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;