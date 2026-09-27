import React from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './Landing';

createRoot(document.getElementById('landing-root')).render(
  <React.StrictMode>
    <Landing />
  </React.StrictMode>
);
