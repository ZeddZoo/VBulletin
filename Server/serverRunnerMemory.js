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

var authorToMessageMap = new Map();

var board1 = {
  board: 1,
  bulletinList: [
    {
      id: 1,
      content: ["hello world"],
      author: "foobar"
    },
    {
      id: 2,
      content: ["Wello Horld"],
      author: "barfoo"
    }
  ],
  locationId: [40.444898, -79.945491], // Lat-Lng
  institution: "Marnegie Cellon"
};

var messageCountForId = board1["bulletinList"].length + 1;

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
  newMessage["id"] = messageCountForId++;

  const result = boardDict[reqBoardNum];

  if (authorToMessageMap.get(author) != undefined) {
    authorToMessageMap.get(author).append(newMessage);
  } else {
    authorToMessageMap[author] = [newMessage];
  }


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
  res.end();
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
