import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import SignUp from './components/signup';
import Dashboard from './components/Dashboard/Dashboard';
import PolygonMarker from './components/PolygonMarker/PolygonMarker.js';  
import CreateProjectPane from './components/CreateProjectPane/CreateProject';  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/polygon-marker" element={<PolygonMarker />} />  
        <Route path="/create-project-pane" element={<CreateProjectPane />} />
      </Routes>
    </Router>
  );
}

export default App;
