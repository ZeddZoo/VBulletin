"use strict"

// connect to server
var messageObj = {
    board: 1, //TODO: get board number variable
    author: "Ben",
    newMessage: "Test pasdfnjkopijofadshuibjoaerwhpuiofeasuiofsdahbjkweafhi"
}

// const request = new Request("http://128.237.175.221:80/", {
//     method: 'POST',
//     body: JSON.stringify(messageObj),
//     credentials: "include"
// });

// fetch(request)
//     .then(response => {
//         console.log("request sent")
//         if (response.status === 200) {
//             return response.json();
//         } else {
//             throw new Error('Something went wrong on api server!');
//         }
//     })
//     .then(response => {
//         console.log("response:", response);
//     }).catch(error => {
//         console.log(error);
//     });

// function a() {
// var xhr = new XMLHttpRequest();
// xhr.open("POST", "https://128.237.175.221:8443", true);
// xhr.send(messageObj);}

// setTimeout(a, 100);

// hardcode demo bulletins
let bulletins = [
    {x:100, y:190, value:"Food Club\n- free food\n- life skill"},
    {x:500, y:900, value:"Concert\n- 9:00 pm\n- Friday 13th"},
    {x:650, y:450, value:"Test note\ntest test test\n\ntest test test\n\ntest test test"}
];

// throw error
function error(message) {
    while (true) alert(message);
}

// compile shaders
function compileShader(id, type) {
    let code = document.getElementById(id).firstChild.nodeValue;
    let shader = gl.createShader(type);
  
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
      console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

// build shaders
function buildShaderProgram(shaderInfo) {
    let program = gl.createProgram();
  
    shaderInfo.forEach(desc => {
        let shader = compileShader(desc.id, desc.type);

        if (shader) {
            gl.attachShader(program, shader);
        }
    });

    gl.linkProgram(program)
  
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Error linking shader program:");
        console.log(gl.getProgramInfoLog(program));
    }
  
    return program;
}

// load texture
function loadTexture(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return texture;
}

// filter
function filter(prev, cur) {
    return {
        x: (prev.x + cur.x * 2) / 3,
        y: (prev.y + cur.y * 2) / 3
    };
}

// create video stream
let video = document.getElementById("video");
navigator.mediaDevices.getUserMedia({
        video: {facingMode: "environment"},
        audio: false
    })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        error("error while opening camera: " + err)
    });
let videoBufferCanvas = document.getElementById("videoBuffer");
let videoBuffer = videoBufferCanvas.getContext("2d");

// create aruco detector
let detector = new AR.Detector();

// setup graphics
let canvas = document.getElementById("canvas");
let bulletinBoardCanvas = document.getElementById("bulletinBoard");
let bulletinBoard = bulletinBoardCanvas.getContext("2d");
var gl = canvas.getContext("webgl");
if (gl === null) error("Unable to initialise WebGL");
gl.clearColor(0, 0, 0, 0);
let background = document.getElementById("background");
let pin = document.getElementById("pin");

// setup inputs
var clicked = false;
var clickedPos = {x:0, y:0};
var clickedChanged = false;
canvas.addEventListener("mousedown", e => {
    clicked = true;
    clickedPos.x = e.clientX;
    clickedPos.y = e.clientY;
});
canvas.addEventListener("mouseup", e => {
    clicked = false;
});
canvas.addEventListener("touchstart", e => {
    clicked = true;
    clickedPos.x = e.touches[0].clientX;
    clickedPos.y = e.touches[0].clientY;
})
canvas.addEventListener("touchend", e => {
    clicked = false;
})

// setup shaders
let shaderProgram = buildShaderProgram([
    {type: gl.VERTEX_SHADER, id: "vertexShader"},
    {type: gl.FRAGMENT_SHADER, id: "fragmentShader"}
]);
gl.useProgram(shaderProgram);
let vertexPositions = gl.getAttribLocation(shaderProgram, "vertexPositions");
let textureCoordinates = gl.getAttribLocation(shaderProgram, "textureCoordinates");
let uTexture = gl.getUniformLocation(shaderProgram, "uTexture");

// setup texture coordinates
let textureCoordinateBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 1
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(textureCoordinates);
gl.vertexAttribPointer(textureCoordinates, 2, gl.FLOAT, false, 0, 0);
gl.activeTexture(gl.TEXTURE0);
gl.uniform1i(uTexture, 0);

// setup vertex buffer
let vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.enableVertexAttribArray(vertexPositions);
gl.vertexAttribPointer(vertexPositions, 2, gl.FLOAT, false, 0, 0);

// keep track of previous positions
let maxCount = 2;
var curCount = 0;
var g0 = {x:0, y:0}, g1 = {x:0, y:0}, g2 = {x:0, y:0}, g3 = {x:0, y:0};

// setup function
function setup() {
    // if the video hasn't been setup yet, wait 10 and try again
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    videoBufferCanvas.width = video.videoWidth;
    videoBufferCanvas.height = video.videoHeight;
    if (canvas.width == 0) {
        setTimeout(setup, 10);
        return;
    }
    setTimeout(main, 1);
}

function drawBoard() {
    // buffer
    let vertexArray = new Float32Array([
        // 0
        g0.x, g0.y,
        // 1
        g1.x, g1.y,
        // 2
        g2.x, g2.y,
        // 0
        g0.x, g0.y,
        // 2
        g2.x, g2.y,
        // 3
        g3.x, g3.y,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.DYNAMIC_DRAW);

    // create bulletin board texture
    bulletinBoard.font="bold 31px Courier New";
    bulletinBoard.drawImage(background, 0, 0);
    bulletins.forEach(bulletin => {
        bulletinBoard.fillStyle = "white";
        bulletinBoard.shadowColor = "black";
        bulletinBoard.shadowBlur = 15;
        bulletinBoard.fillRect(
            bulletin.x,
            bulletin.y,
            300,
            300
        );
        bulletinBoard.drawImage(pin,
            bulletin.x + 25,
            bulletin.y - 75
        );
        bulletinBoard.shadowBlur = 0;
        bulletinBoard.fillStyle = "black";
        var col = 0;
        let lines = [];
        var line = "";
        for (var ptr = 0; ptr < bulletin.value.length; ptr++) {
            line += bulletin.value[ptr];
            if (col > 13 || bulletin.value[ptr] == "\n") {
                col = 0;
                lines.push(line);
                line = "";
            }
            col += 1;
        }
        lines.push(line);

        var row = 80;
        lines.forEach(line => {
            bulletinBoard.fillText(line,
                10 + bulletin.x,
                row + bulletin.y
            );
            row += 30;
        });
    });
}

// augmentedReality function
var state = "AR";
function main() {
    // clean up previous time
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // move video to buffer canvas
    videoBuffer.drawImage(video, 0, 0, canvas.width, canvas.height);

    // find the markers
    let imageData = videoBuffer.getImageData(0, 0, canvas.width, canvas.height);
    
    // AR
    if (state == "AR") {
        let markers = detector.detect(imageData);
        if (markers.length > 0) {
            /* Format:
            * 0---1
            * |   |
            * 3---2
            */
            // retrieve marker positions
            let marker = markers[0];
            let c0 = marker.corners[0];
            let c1 = marker.corners[1];
            let c2 = marker.corners[2];
            let c3 = marker.corners[3];

            let center = {
                x: (c0.x + c1.x + c2.x + c3.x) / 4,
                y: (c0.y + c1.y + c2.y + c3.y) / 4
            };

            // calculate deltas
            let d0 = {x: c0.x - center.x, y: c0.y - center.y};
            let d1 = {x: c1.x - center.x, y: c1.y - center.y};
            let d2 = {x: c2.x - center.x, y: c2.y - center.y};
            let d3 = {x: c3.x - center.x, y: c3.y - center.y};

            // convert to gl positions
            let scale = {x:7, y:7};
            g0 = filter(g0, {
                x: 2 * (scale.x * d0.x + center.x) / canvas.width - 1,
                y: -2 * (scale.y * d0.y + center.y) / canvas.height + 1,
            });
            g1 = filter(g1, {
                x: 2 * (scale.x * d1.x + center.x) / canvas.width - 1,
                y: -2 * (scale.y * d1.y + center.y) / canvas.height + 1,
            });
            g2 = filter(g2, {
                x: 2 * (scale.x * d2.x + center.x) / canvas.width - 1,
                y: -2 * (scale.y * d2.y + center.y) / canvas.height + 1,
            });
            g3 = filter(g3, {
                x: 2 * (scale.x * d3.x + center.x) / canvas.width - 1,
                y: -2 * (scale.y * d3.y + center.y) / canvas.height + 1,
            });

            // set sustained count
            curCount = maxCount;
        }

        //render
        if (curCount > 0) {
            drawBoard();
            
            // bind texture
            const texture = loadTexture(bulletinBoardCanvas);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // render
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            curCount -= 1;

            // check switch
            if (clicked) {
                if (!clickedChanged) {
                    state = "BOARD";
                    clickedChanged = true;
                }
            }
            else clickedChanged = false;
        }
    }
    // BOARD
    else {
        g0 = filter(g0, {x:-1, y: 1});
        g1 = filter(g1, {x: 1, y: 1});
        g2 = filter(g2, {x: 1, y:-1});
        g3 = filter(g3, {x:-1, y:-1});
        drawBoard();

        // add buttons
        bulletinBoard.shadowBlur = 15;
        // bulletinBoard.fillStyle = "green";
        // bulletinBoard.fillRect(50, 1400, 250, 150);
        bulletinBoard.fillStyle = "red";
        bulletinBoard.fillRect(780, 1400, 250, 150);

        // add button text
        bulletinBoard.shadowBlur = 0;
        bulletinBoard.fillStyle = "black"
        bulletinBoard.font="bold 100px Courier New";
        // bulletinBoard.fillText("ADD", 78, 1505);
        bulletinBoard.fillText("EXIT", 783, 1505);

        // bind texture
        const texture = loadTexture(bulletinBoardCanvas);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // render
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        curCount -= 1;

        // check switch
        if (clicked) {
            if (!clickedChanged) {
                if (clickedPos.x > 50 && clickedPos.x < 50 + 250 &&
                    clickedPos.y > 1400 && clickedPos.y < 1400 + 150) {
                    // bulletins.push({
                    //     x: Math.random() * 800 + 50,
                    //     y: Math.random() * 800 + 150,
                    //     value: ""
                    // });
                } else if (clickedPos.x > 780 && clickedPos.x < 780 + 250 &&
                    clickedPos.y > 1400 && clickedPos.y < 1400 + 150) {
                    state = "AR";
                }
                else {
                    bulletins.forEach(bulletin => {
                        if (clickedPos.x > bulletin.x && clickedPos.x < bulletin.x + 300 &&
                            clickedPos.y > bulletin.y && clickedPos.y < bulletin.y + 300) {
                            console.log(bulletin.value);
                        }
                    });
                }
                clickedChanged = true;
            }
        }
        else clickedChanged = false;
    }
    setTimeout(main, 1);
}
setTimeout(setup, 1);