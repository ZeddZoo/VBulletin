const http = require('http');
const fs = require('fs');

const reqDest = '127.0.0.1';
const request = require('request');

request(reqDest, { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.url);
  console.log(body.explanation);
});

function getWriteRequest(boardId, author, newMessage) {
  return '{"board": ' + boardId + ', "author": ' + author + ', "newMessage": ' + JSON.stringify(newMessage) + '}';
}

// This request function needs boardId, author, and the new message to be already defined
request({
  method: 'GET',
  uri: 'reqDest',
  multipart: [
    {
      'content-type': 'application/json',
      body: getWriteRequest(boardId, author)
    }
  ],
},
function (error, response, body) {
  if (error) {
    return console.error('upload failed:', error);
  }
  console.log('Upload successful!  Server responded with:', body);
})