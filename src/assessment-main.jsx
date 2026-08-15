import React from 'react';
import { createRoot } from 'react-dom/client';
import { AssessmentDemo } from './AssessmentDemo.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AssessmentDemo />
  </React.StrictMode>,
);
