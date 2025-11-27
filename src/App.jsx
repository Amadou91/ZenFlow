import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import WebsiteLayout from './layouts/WebsiteLayout';
import Home from './pages/Home';
import ZenFlowApp from './pages/ZenFlowApp'; // The renamed old App.jsx

// Placeholder pages for structure
const About = () => <div className="p-20 text-center font-serif text-2xl">About Page Placeholder</div>;
const Classes = () => <div className="p-20 text-center font-serif text-2xl">Classes Page Placeholder</div>;

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing Website Routes */}
          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/classes" element={<Classes />} />
          </Route>

          {/* Application Route - No WebsiteLayout (Fullscreen) */}
          <Route path="/app" element={<ZenFlowApp />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}