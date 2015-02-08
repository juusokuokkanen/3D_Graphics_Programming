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
var vertexAngleBuffer = null;
var indexBufferObjectTri = null;
var indexBufferObjectLine = null;
var vertexPosAttr = null;
var vertexAngleAttr = null;
var vertexCountUniform = null;
var radiusUniform = null;
window.onload = initWebGL();


function makeShaderProgram(source, type){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;
    }else{
        alert("Shader could not be compiled. Error was: "+ gl.getShaderInfoLog(shader));
        return null;
    }
}

function initShaders(){
    if(vertexShaderCode === null || fragmentShaderCode === null){
        vertexShaderCode = [
            "uniform float uRadius;",
            "attribute vec3 aVertexPos;",
            "attribute float aVertexAngle;",
            "varying highp float vAngle;",
            "vec4 transform(float radius){",
                "vec4 resultVec = vec4(aVertexPos, 1.0);",
                "resultVec.x = cos(aVertexAngle);",
                "resultVec.y = sin(aVertexAngle);",
                "resultVec.xyz = resultVec.xyz * radius;",
                "return resultVec;",
            "}",
            
            "void main(void){",
                "vec4 transformedVector = transform(uRadius);",
                "gl_PointSize = 4.0;",
                "gl_Position = transformedVector;",
                "vAngle = aVertexAngle;",
            "}"
        ].join("\n");

        fragmentShaderCode = [
            "precision highp float;",
            "varying mediump float vAngle;",
            "vec4 color(float angle){",
                "vec4 color = vec4(smoothstep(-1.0, 1.0, sin(vAngle)), smoothstep(-1.0, 1.0, cos(vAngle)), 0.0, 1.0);",
                "return color;",
            "}",
            "void main(void){",
                "gl_FragColor = color(vAngle);",
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
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ];
    //create new VBO
    drawBuffer = gl.createBuffer();
    //Bind the created VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //Send data to binded VBO. Data will stay in this buffer, and we can rebind it again later.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    drawBuffer.itemCount = data.length;
    
    //create index buffer object
    var indexBufferObjectData = [
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 5,
        0, 5, 6,
        0, 6, 7,
        0, 7, 8,
        0, 8, 9,
        0, 9, 10,
        0, 10, 11,
        0, 11, 12,
        0, 12, 13,
        0, 13, 14,
        0, 14, 15,
        0, 15, 1
    ];
    
    indexBufferObjectTri = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectTri);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBufferObjectData), gl.STATIC_DRAW);
    indexBufferObjectTri.itemCount = indexBufferObjectData.length;
    
    //create index buffer object
    indexBufferObjectData = [
        1,2,3,4,5,6,7,8,9,10,11,12,13,14,15
    ];
    
    indexBufferObjectPL = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectPL);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBufferObjectData), gl.STATIC_DRAW);
    indexBufferObjectPL.itemCount = indexBufferObjectData.length;
    
    //create angle data based on number of vertices. First always 0.0, because it should be the center of circle.
    var vertexAngleData = [
        0.0
    ];
    
    for(var i = 1; i < drawBuffer.itemCount/3; i++){
        //angle is determined by number of vertices in cirlces ring (we exclude the center)
        //and create angle for every vertex
        var angle = (2.0*Math.PI/(drawBuffer.itemCount/3-1))*(i-1);
        vertexAngleData.push(angle);
    }
    
    //create new VBO
    vertexAngleBuffer = gl.createBuffer();
    //Bind the created VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexAngleBuffer);
    //Send data to binded VBO. Data will stay in this buffer, and we can rebind it again later.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexAngleData), gl.STATIC_DRAW);
    vertexAngleBuffer.itemCount = vertexAngleData.length;
}

function drawScene(){
    //radius uniform
    radiusUniform = gl.getUniformLocation(program, "uRadius");
    //assing values to uniforms
    this.gl.uniform1f(radiusUniform, 0.7);
    
    //get reference to attribute variable in vertex shader
    vertexPosAttr = gl.getAttribLocation(program, "aVertexPos");
    //Enable feeding of array of data to attribute
    gl.enableVertexAttribArray(vertexPosAttr);
    //Bind the buffer that data we want to give to drawing
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //We tell the WebGL how to interpret the data in bind buffers
    gl.vertexAttribPointer(vertexPosAttr, 3, gl.FLOAT, false, 0, 0);
    
    //get reference to attribute variable in vertex shader
    vertexAngleAttr = gl.getAttribLocation(program, "aVertexAngle");
    //Enable feeding of array of data to attribute
    gl.enableVertexAttribArray(vertexAngleAttr);
    //Bind the buffer that data we want to give to drawing
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexAngleBuffer);
    //We tell the WebGL how to interpret the data in bind buffers
    gl.vertexAttribPointer(vertexAngleAttr, 1, gl.FLOAT, false, 0, 0);
    
    
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //draw by using the indices
    if(selectedButton==="1"){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectTri);
        gl.drawElements(gl.TRIANGLES, indexBufferObjectTri.itemCount, gl.UNSIGNED_SHORT, 0);
    }
    //draw by using the indices
    if(selectedButton==="2"){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectPL);
        gl.drawElements(gl.LINE_LOOP, indexBufferObjectPL.itemCount, gl.UNSIGNED_SHORT, 0);
    }
    //draw by using the indices
    if(selectedButton==="3"){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectPL);
        gl.drawElements(gl.POINTS, indexBufferObjectPL.itemCount, gl.UNSIGNED_SHORT, 0);
    }
    
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
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        initShaders();
        initBuffers();
        drawScene();
        
        
    }else{
        alert("Error getting the context. Browser may not support WebGL");
    }
}