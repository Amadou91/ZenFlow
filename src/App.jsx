import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import WebsiteLayout from './layouts/WebsiteLayout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import About from './pages/About';
import ZenFlowApp from './pages/ZenFlowApp';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Retreats from './pages/Retreats';
import Contact from './pages/Contact';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Website Routes */}
            <Route element={<WebsiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/retreats" element={<Retreats />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* ZenFlow Application Route */}
            <Route path="/tools/zenflow" element={<ZenFlowApp />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}