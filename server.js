const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Strip query strings and hash
  let cleanUrl = req.url.split('?')[0].split('#')[0];
  if (cleanUrl === '/' || cleanUrl === '') {
    cleanUrl = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  // Check if file exists within the directory
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>404 - File Not Found</h2>
          <p><a href="/" style="color: #10B981;">Return to Custom Dropdown</a></p>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n  🚀  Custom Dropdown Dev Server Running!');
  console.log(`  ➜   Local:   \x1b[36m${url}\x1b[0m`);
  console.log('  ➜   Press \x1b[33mCtrl+C\x1b[0m to stop\n');

  // Open browser automatically based on platform
  const startCmd =
    process.platform === 'win32'
      ? `start ${url}`
      : process.platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;

  exec(startCmd, (err) => {
    // Ignore error if browser fails to auto-launch
  });
});

