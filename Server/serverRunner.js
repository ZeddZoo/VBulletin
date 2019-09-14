const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const fs = require('fs');

var clientCount = 0;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  // Read Request
  if (req.method === 'GET') {
    const requestedBoard =
  // Write Request
  } else if (req.method === 'POST') {

  }
  // res.setHeader('Content-Type', 'text/plain');
  // res.write("Welcome to the VBulletin server!\n");
  // res.write("" + clientCount);
  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  clientCount++;

});

// const getBulletin = (bulletinId) =>