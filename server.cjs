// server.cjs
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Absolute path to the built Vite assets
const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

// Verify dist folder exists
if (!fs.existsSync(distPath)) {
  console.error(`Error: dist folder not found at ${distPath}`);
  console.error('Please run "npm run build" first to create the dist folder.');
  process.exit(1);
}

// Serve all static files from dist
app.use(express.static(distPath, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true
}));

// SPA fallback: any route should return index.html
// Express 5 / path-to-regexp doesn't like '*' or '/*' patterns,
// so we use a regex route to avoid PathError
app.get(/.*/, (req, res) => {
  if (!fs.existsSync(indexHtmlPath)) {
    res.status(500).send('index.html not found. Please rebuild the application.');
    return;
  }
  res.sendFile(indexHtmlPath);
});

app.listen(port, () => {
  console.log(`Stability Calculator listening on port ${port}`);
  console.log(`Serving static files from: ${distPath}`);
});
