import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import { AssessmentDemo } from './AssessmentDemo.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/assessment" element={<AssessmentDemo />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
