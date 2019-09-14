const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

var clientCount = 0;

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

boardDict.push({
    key: 1,
    value: board1
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  // Read Request
  var requestBody = "";
  // From https://stackoverflow.com/questions/31006711/get-request-body-from-node-jss-http-incomingmessage
  req.on('readable', () => {
    requestBody += req.read();
  });

  var requestBody = JSON.parse(requestBody);

  if (req.method === 'GET') {
    const reqBoardNum = requestBody["board"];

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
  // Write Request
  } else if (req.method === 'POST') {
    const reqBoardNum = requestBody["board"];
    const username = requestBody["author"];
    var newMessage = requestBody["newMessage"];
    newMessage["author"] = username;


    const result = boardDict[reqBoardNum];

    if (result != null) {
      result["board"].append(newMessage);
      // https://gyandeeps.com/json-file-write/
      res.write("Board Edited successfully :)");
    } else {
      res.statusCode = 418;
      res.write("Board not found :(");
    }
  }

  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  clientCount++;

});