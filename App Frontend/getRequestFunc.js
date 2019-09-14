const http = require('http');
const fs = require('fs');

const reqDest = '127.0.0.1';
const request = require('request');

// request(reqDest, { json: true }, (err, res, body) => {
//   if (err) { return console.log(err); }
//   console.log(body.url);
//   console.log(body.explanation);
// });

function getReadRequest(boardId, author) {
  return '{"board": ' + boardId + ', "author": ' + author + '}';
}

// This request function needs boardId and author to be already defined
request({
  json: true,
  method: 'GET',
  uri: 'reqDest',
  multipart: [
    {
      'content-type': 'application/json',
      body: getReadRequest(boardId, author)
    }
  ],
},
function (error, response, body) {
  if (error) {
    return console.error('download failed:', error);
  }
  console.log('Upload successful!  Server responded with:', body);
});