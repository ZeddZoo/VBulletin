const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var app = express();
// var jsonParer = bodyParser.json();
const hostname = '127.0.0.1';
const port = 3000;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(bodyParser.json());
app.use(cors());

app.options('*', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  return res.header('Access-Control-Allow-Headers', 'Content-Type');
});

var boardDict = {};

var board1 = {
  board: 1,
  bulletinList: [
    {
      content: ["hello world"],
      author: "foobar"
    },
    {
      content: ["Wello Horld"],
      author: "barfoo"
    }
  ],
  locationId: [40.444898, -79.945491], // Lat-Lng
  institution: "Marnegie Cellon"
};

boardDict[1] = board1;
// boardDict.push({
//     key: 1,
//     value: board1
// });

app.post('/', (req, res) => {
  console.log("Request body: " + req.body);
  console.log("Previous board state:" + JSON.stringify(board1));

  const reqBoardNum = req.body.board;
  const author = req.body.author;
  var newMessage = req.body.newMessage;
  newMessage["author"] = author;

  const result = boardDict[reqBoardNum];

  if (result != null) {
    result["bulletinList"].push(newMessage);
    res.write(JSON.stringify(result));
  } else {
    res.statusCode = 418;
    res.write("Board not found :(");
  }
  console.log("Current board state:" + JSON.stringify(board1));
  res.end();
});

app.get('/', (req, res) => {
  console.log("Request body: " + req.body);

  const reqBoardNum = req.body.board;

  const result = boardDict[reqBoardNum];

  if (result != null) {
    var replyBody = {
      "boardId": reqBoardNum,
      "board": result
    };
    res.write(JSON.stringify(replyBody));
  } else {
    res.statusCode = 418;
    res.write("Board not found :(");
  }
});

// const server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   // res.setHeader('Content-Type', 'text/html');
//   res.setHeader('Content-Type', 'application/json');
//   res.statusCode = 200;
//   // Read Request
//   var requestBody = [];
//   console.log(req.url);
//   console.log("Incoming req.body: " + req.body);

//   // From https://stackoverflow.com/questions/31006711/get-request-body-from-node-jss-http-incomingmessage
//   // req.on('data', function(chunk) {
//   //   requestBody += chunk;
//   // });
//   // req.on('end', function () {
//   //   console.log(JSON.parse(jsonString));
//   // });

//   if (req.method === 'GET') {

//     req.on('data', (chunk) => {
//       requestBody.push(chunk);
//     }).on('end', () => {
//     requestBody = Buffer.concat(requestBody).toString();
//     // at this point, `body` has the entire request body stored in it as a string
//     });
//     console.log("Request body: " + requestBody);
//     var requestBody = JSON.parse(requestBody);

//     const reqBoardNum = requestBody["board"];

//     const result = boardDict[reqBoardNum];

//     if (result != null) {
//       var replyBody = {
//         "boardId": reqBoardNum,
//         "board": result
//       };
//       res.write(JSON.stringify(replyBody));
//     } else {
//       res.statusCode = 418;
//       res.write("Board not found :(");
//     }
//   // Write Request
//   } else if (req.method === 'POST') {
//     console.log(req);
//     req.on('data', (chunk) => {
//       requestBody.push(chunk);
//     }).on('end', () => {
//     requestBody = Buffer.concat(requestBody).toString();
//     // at this point, `body` has the entire request body stored in it as a string
//     });
//     console.log("Request body: " + requestBody);
//     var requestBody = JSON.parse(requestBody);


//     const reqBoardNum = requestBody["board"];
//     const username = requestBody["author"];
//     var newMessage = requestBody["newMessage"];
//     newMessage["author"] = username;


//     const result = boardDict[reqBoardNum];

//     if (result != null) {
//       result["board"].append(newMessage);
//       // https://gyandeeps.com/json-file-write/
//       res.write("Board Edited successfully :)");
//     } else {
//       res.statusCode = 418;
//       res.write("Board not found :(");
//     }
//   }

//   res.end();
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// });