import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import React from 'react'
import ManagementPage from "./pages/ManagementPage";
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div className="bg-white-400 min-h-screen">
        <Routes>
          <Route path='/' element={<ManagementPage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
