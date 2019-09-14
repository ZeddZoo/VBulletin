<script src=".js" type="text/javascript"></script>
<canvas id="myCanvas" width="200" height="100" style="border:1px solid #d3d3d3;">
Your browser does not support the HTML5 canvas tag.</canvas>

function renderToBoard(message){
    var messageData = JSON.parse(message);
    if (messageData.ID === undefined 
        || messageData.Author === undefined 
        || messageData.text === undefined){
            return false;
    }

    
}