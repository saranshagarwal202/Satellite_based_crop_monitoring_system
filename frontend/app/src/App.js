import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import SignUp from './components/signup';
import Dashboard from './components/Dashboard/Dashboard';
import PolygonMarker from './components/PolygonMarker/PolygonMarker';  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/polygon-marker" element={<PolygonMarker />} />  
      </Routes>
    </Router>
  );
}

export default App;
