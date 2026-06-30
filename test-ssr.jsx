import fs from 'fs';
import { renderToString } from 'react-dom/server';
import React from 'react';
import App from './src/App.jsx';
import KOL from './src/pages/KOL.jsx';
import { BrowserRouter } from 'react-router-dom';

try {
  console.log("Rendering KOL...");
  const html = renderToString(React.createElement(KOL));
  console.log("Render successful!");
} catch (e) {
  console.error("CRASH DURING RENDER:", e);
}
