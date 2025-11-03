import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // tailwind or custom

createRoot(document.getElementById('root')).render(<App />);
