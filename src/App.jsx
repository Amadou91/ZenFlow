import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import WebsiteLayout from './layouts/WebsiteLayout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import About from './pages/About';
import ZenFlowApp from './pages/ZenFlowApp';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Website Routes */}
          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* ZenFlow Application Route (Fullscreen, no website nav) */}
          <Route path="/tools/zenflow" element={<ZenFlowApp />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}