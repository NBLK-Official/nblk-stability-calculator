// server.cjs
const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
const port = process.env.PORT || 8080;
const distPath = path.join(__dirname, "dist");

if (!fs.existsSync(distPath)) {
  console.error("Dist folder not found:", distPath);
  process.exit(1);
}

app.use(
  express.static(distPath, {
    maxAge: "1y",
    etag: true,
  })
);

// Express 5 compatible catch all using regex instead of "*" or "/*"
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Stability Calculator running on port ${port}`);
  console.log(`Serving from: ${distPath}`);
});
