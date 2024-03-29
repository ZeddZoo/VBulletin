const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const fs = require('fs');

var clientCount = 0;

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
    const username = requestBody["author"];

    const jsonRequest = "Boards/" + "board" + reqBoardNum + ".json";

    // var result = $.getJSON(jsonRequest, () => {
    //   console.log("Getting board: " + jsonRequest);
    // })();

    const result = fs.readFile(jsonRequest, (err, data) => {
      if (err) throw err;
      let student = JSON.parse(data);
      console.log(student);
    })();

    if (result != null) {
      var replyBody = {
        "boardId": reqBoardNum,
        "board": JSON.stringify(result)
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
    const newMessage = requestBody["newMessage"];

    const jsonRequest = "Boards/" + "board" + reqBoardNum + ".json";

    // var result = $.getJSON(jsonRequest, () => {
    //   console.log("Getting board: " + jsonRequest);
    // })();

    const result = fs.readFile(jsonRequest, (err, data) => {
      if (err) throw err;
      let student = JSON.parse(data);
      console.log(student);
    })();

    if (result != null) {
      result["board"].append(newMessage);
      // https://gyandeeps.com/json-file-write/
      fs.writeFile(jsonRequest, JSON.stringify(result), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
      });
      res.write("Board Edited successfully :)");
    } else {
      res.statusCode = 418;
      res.write("Board not found :(");
    }
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