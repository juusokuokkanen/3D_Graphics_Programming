/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



var gl = null;
var canvas = null;
var vertexShaderCode = null;
var fragmentShaderCode = null;
var program = null;
var drawBuffer = null;
var vertexPosAttr = null;
window.onload = initWebGL();


function makeShaderProgram(source, type){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;
    }else{
        alert("Shader could not be compiled. Type was: "+ type);
        return null;
    }
}

function initShaders(){
    if(vertexShaderCode === null || fragmentShaderCode === null){
        vertexShaderCode = [
            "attribute vec3 aVertexPos;",
            "void main(void){",
                "gl_Position = vec4(aVertexPos, 1.0);",
            "}"
        ].join("\n");

        fragmentShaderCode = [
            "void main(void){",
                "gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);",
            "}"
        ].join("\n");
        
        
    }
    
    var vertexShader = makeShaderProgram(vertexShaderCode, gl.VERTEX_SHADER);
    var fragmentShader = makeShaderProgram(fragmentShaderCode, gl.FRAGMENT_SHADER);
    
    if(vertexShader !== null && fragmentShader !== null){
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
        }else{
            alert("Linking the program did not went correctly.");
        }
    }
}

function initBuffers(){
    var data = [
        -0.5, -0.5, 0.0,
        0.0, 0.5, 0.0,
        0.5, -0.5, 0.0
    ];
    //create new VBO
    drawBuffer = gl.createBuffer();
    //Bind the created VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //Send data to binded VBO. Data will stay in this buffer, and we can rebind it again later.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

function drawScene(){
    //get reference to attribute variable in vertex shader
    vertexPosAttr = gl.getAttribLocation(program, "aVertexPos");
    //Enable feeding of array of data to attribute
    gl.enableVertexAttribArray(vertexPosAttr);
    //Bind the buffer that data we want to give to drawing
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //We tell the WebGL how to interpret the data in bind buffers
    gl.vertexAttribPointer(vertexPosAttr, 3, gl.FLOAT, false, 0, 0);
    //Draw the buffers, tell how to draw the data, where to start and how many vertices we should draw in total.
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function initWebGL(){
    try{
        //get the canvas element with its id
        canvas = document.getElementById("canvas-webgl");
        //get webgl context to global gl variable
        gl = canvas.getContext("webgl");
    }
    catch(e){
        
    }
    //check that context was gotten and fill the color buffer
    if(gl){
        //we can access the webgl functionalities by using gl, that contains the context
        //clear the scene with color set
        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        //gl.viewport(canvas.width/2, canvas.height/2, canvas.width, canvas.height);
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        initShaders();
        initBuffers();
        drawScene();
        
        
    }else{
        alert("Error getting the context. Browser may not support WebGL");
    }
}