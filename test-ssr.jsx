import React from 'react';
import ReactDOMServer from 'react-dom/server';
import KOL from './src/pages/KOL.jsx';

try {
  // We need to mock window and browser globals because it's SSR
  global.window = {};
  const html = ReactDOMServer.renderToString(<KOL />);
  console.log("RENDER SUCCESS, length:", html.length);
} catch (err) {
  console.error("REACT CRASH ERROR:", err);
}
