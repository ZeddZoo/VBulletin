"use strict"

// hardcode demo bulletins
let bulletins = [
    {x: 0.1, y:0.1, value:"I am bulletin 1"},
    {x: 0.5, y:0.75, value:"I am bulletin 2"},
    {x: 0.75, y:0.4, value:"33333333"}
]

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
  
    shaderInfo.forEach(function(desc) {
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
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
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
    gl = canvas.getContext("webgl");
    setTimeout(main, 1);
}

// main function
function main() {
    // clean up previous time
    gl.clear(gl.COLOR_BUFFER_BIT);

    // move video to buffer canvas
    videoBuffer.drawImage(video, 0, 0, canvas.width, canvas.height);

    // find the markers
    let imageData = videoBuffer.getImageData(0, 0, canvas.width, canvas.height);
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
        let scale = {x:5, y:5};
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
        bulletinBoard.drawImage(background, 0, 0);
        bulletins.forEach(function(bulletin) {
            bulletinBoard.fillStyle = "white";
            bulletinBoard.fillRect(
                bulletin.x * bulletinBoardCanvas.width,
                bulletin.y * bulletinBoardCanvas.height,
                0.2 * bulletinBoardCanvas.width,
                0.2 * bulletinBoardCanvas.height
            );
        })
        const texture = loadTexture(bulletinBoardCanvas);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // render
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        curCount -= 1;
    }
    setTimeout(main, 1);
}
setTimeout(setup, 1);