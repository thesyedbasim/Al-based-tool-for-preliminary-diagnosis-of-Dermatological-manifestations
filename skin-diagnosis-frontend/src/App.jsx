import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import Consultation from './pages/Consultation';
import HealthRecords from './pages/HealthRecords';
import Hospitals from './pages/Hospitals';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/hospitals" element={<Hospitals />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;