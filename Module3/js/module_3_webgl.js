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
var texCoordBuffer = null;
var indexBufferObject = null;
var vertexPosAttr = null;
var vertexAngleAttr = null;
var cubeMapSamplerUniform = null;
var cubeMapTexture = null;
var images = {};
window.onload = initWebGL();

function loadTextures(){
    images.negZ = new Image();
    images.posZ = new Image();
    images.negX = new Image();
    images.posX = new Image();
    images.negY = new Image();
    images.posY = new Image();
    images.negZ.onload = function(){
        images.posZ.onload = function(){
            images.negX.onload =  function(){
                images.posX.onload = function(){
                    images.negY.onload = function(){
                        images.posY.onload = function(){
                            setupCubeMapTexture();
                            cubeMapSamplerUniform = gl.getUniformLocation(program, "uTextureCube");
                            gl.uniform1i(cubeMapSamplerUniform, 0);
                            drawScene();
                        };
                        images.posY.src = "./images/posy.jpg";
                    };
                    images.negY.src = "./images/negy.jpg";
                };
                images.posX.src = "./images/posx.jpg";
            };
            images.negX.src = "./images/negx.jpg";
        };
        images.posZ.src = "./images/posz.jpg";
    };
    images.negZ.src = "./images/negz.jpg";
}

function setupCubeMapTexture(){
    cubeMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.INSIGNED_BYTE, images.negZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.INSIGNED_BYTE, images.posZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.INSIGNED_BYTE, images.negX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.INSIGNED_BYTE, images.posX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.INSIGNED_BYTE, images.negY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.INSIGNED_BYTE, images.posY);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    if(!gl.isTexture(cubeMapTexture)){
        console.error("Texture is invalid");
    }
}

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
            "attribute vec3 aTexCoord;",
            "varying highp vec3 vTexCoord;",
            "void main(void){" ,
                "gl_Position = vec4(aVertexPos, 1.0);",
                "vTexCoord = aTexCoord;",
            "}"
        ].join("\n");

        fragmentShaderCode = [
            "precision highp float;",
            "varying highp vec3 vTexCoord;",
            "uniform samplerCube uTextureCube;",
            "void main(void){",
                "gl_FragColor = textureCube(uTextureCube, vTexCoord);",
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
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0
    ];
    
    
    var indexBufferObjectData = [
        //front
        0, 1, 2,
        2, 1, 3,
        //right
        2, 3, 4,
        4, 3, 5,
        //back
        4, 5, 6,
        6, 5, 7,
        //left
        6, 7, 0,
        0, 7, 1,
        //top
        1, 7, 3,
        3, 7, 5,
        //bottom
        6, 0, 4,
        4, 0, 1  
    ];
    
    //we generate the vertices from indices for this case
    vertexData = [];
    
    for(var i = 0; i < indexBufferObjectData.length; i = i+3){
        vertexData.push(data[i]);
        vertexData.push(data[i+1]);
        vertexData.push(data[i+2]);
    }
    
    var texCoordData = [
        //front -z
        0, 0, -1,
        0, 1, -1,
        -1, 0, -1,
        -1, 0, -1,
        0, 1, -1,
        -1, 1, -1,
        //right +x
        1, 0, 0,
        1, 1, 0,
        1, 0, -1,
        1, 0, -1,
        1, 1, 0,
        1, 1, -1,
        //back +z
        0, 0, 1,
        0, 1, 1,
        1, 0, 1,
        1, 0, 1,
        0, 1, 1,
        1, 1, 1,
        //left -x
        -1, 0, 0,
        -1, 1, 0,
        -1, 0, 1,
        -1, 0, 1,
        -1, 1, 0,
        -1, 1, 1,
        //top +y
        0, 1, 0,
        0, 1, -1,
        1, 1, 0,
        1, 1, 0,
        0, 1, -1,
        1, 1, -1,
        //bottom -y
        0, -1, 0,
        0, -1, 1,
        1, -1, 0,
        1, -1, 0,
        0, -1, 1,
        1, -1, 1
    ];
    
    //create new VBO
    drawBuffer = gl.createBuffer();
    //Bind the created VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //Send data to binded VBO. Data will stay in this buffer, and we can rebind it again later.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    drawBuffer.itemCount = vertexData.length;
    
    //Create texture cube map coordinates
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordData), gl.STATIC_DRAW);
    texCoordBuffer.itemCount = texCoordData.length;
    
}

function drawScene(){
    
    textureCoordAttr = gl.getAttribLocation(program, "aTexCoord");
    gl.enableVertexAttribArray(textureCoordAttr);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttr, 3, gl.FLOAT, false, 0, 0);
    
    //get reference to attribute variable in vertex shader
    vertexPosAttr = gl.getAttribLocation(program, "aVertexPos");
    //Enable feeding of array of data to attribute
    gl.enableVertexAttribArray(vertexPosAttr);
    //Bind the buffer that data we want to give to drawing
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //We tell the WebGL how to interpret the data in bind buffers
    gl.vertexAttribPointer(vertexPosAttr, 3, gl.FLOAT, false, 0, 0);
    
    
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, drawBuffer.itemCount);
    
    
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
        
        //drawScene();
        //also draws the scene
        loadTextures();
        
        
    }else{
        alert("Error getting the context. Browser may not support WebGL");
    }
}