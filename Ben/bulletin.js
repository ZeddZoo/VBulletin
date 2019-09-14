"use strict"

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
let bulletin = document.getElementById("bulletin").getContext("2d");
var gl = canvas.getContext("webgl");
if (gl === null) error("Unable to initialise WebGL");
gl.clearColor(0, 0, 0, 0);
let vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
let shaderProgram = buildShaderProgram([
    {type: gl.VERTEX_SHADER, id: "vertexShader"},
    {type: gl.FRAGMENT_SHADER, id: "fragmentShader"}
]);
let vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
gl.enableVertexAttribArray(vertexPosition);
gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
gl.useProgram(shaderProgram);


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

        // convert to gl positions
        let scale = {x:1, y:1};
        let g0 = {
            x: scale.x * (2 * c0.x / canvas.width - 1),
            y: scale.y * (-2 * c0.y / canvas.height + 1)
        };
        let g1 = {
            x: scale.x * (2 * c1.x / canvas.width - 1),
            y: scale.y * (-2 * c1.y / canvas.height + 1)
        };
        let g2 = {
            x: scale.x * (2 * c2.x / canvas.width - 1),
            y: scale.y * (-2 * c2.y / canvas.height + 1)
        };
        let g3 = {
            x: scale.x * (2 * c3.x / canvas.width - 1),
            y: scale.y * (-2 * c3.y / canvas.height + 1)
        };

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

        // render
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    setTimeout(main, 1);
}
setTimeout(setup, 1);