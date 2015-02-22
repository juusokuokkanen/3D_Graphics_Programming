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
var perspectiveMatrixUniform = null;
var modelMatrixUniform = null;
var vertexColorBuffer = null;
var vertexColorAttr = null;
var images = {};
var rotationX = 0;
var rotationY = 0;
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
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.negZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.posZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.negX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.posX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.negY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.posY);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    if(!gl.isTexture(cubeMapTexture)){
        console.error("Texture is invalid");
    }else{
        cubeMapSamplerUniform = gl.getUniformLocation(program, "uTextureCube");
        gl.uniform1i(cubeMapSamplerUniform, 0);
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
            "attribute vec3 aVertexColor;",
            "uniform mat4 uModMatrix;",
            "uniform mat4 uPerMatrix;",
            "varying highp vec3 vTexCoord;",
            "varying vec3 vVertexColor;",
            "void main(void){",
                "gl_Position = uPerMatrix * uModMatrix * vec4(aVertexPos, 1.0);",
                "vTexCoord = aTexCoord;",
                "vVertexColor = aVertexColor;",
            "}"
        ].join("\n");

        fragmentShaderCode = [
            "precision highp float;",
            "varying highp vec3 vTexCoord;",
            "varying vec3 vVertexColor;",
            "uniform samplerCube uTextureCube;",
            "void main(void){",
                "//gl_FragColor = vec4(vVertexColor, 1.0);",
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
        [-1.0, -1.0, -1.0],
        [-1.0, 1.0, -1.0],
        [1.0, -1.0, -1.0],
        [1.0, 1.0, -1.0],
        [1.0, -1.0, 1.0],
        [1.0, 1.0, 1.0],
        [-1.0, -1.0, 1.0],
        [-1.0, 1.0, 1.0]
    ];
    
    
    var indexData = [
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
        4, 0, 2  
    ];
    
    //we generate the vertices from indices for this case
    vertexData = [];
    
    for(var i in indexData){
        vertexData.push.apply(vertexData, data[indexData[i]]);
    }
    var texCoordData = [
        //front -z
        -1, -1, -1,
        -1, 1, -1,
        1, -1, -1,
        1, -1, -1,
        -1, 1, -1,
        1, 1, -1,
        //right +x
        1, -1, -1,
        1, 1, -1,
        1, -1, 1,
        1, -1, 1,
        1, 1, -1,
        1, 1, 1,
        //back +z
        1, -1, 1,
        1, 1, 1,
        -1, -1, 1,
        -1, -1, 1,
        1, 1, 1,
        -1, 1, 1,
        //left -x
        -1, -1, 1,
        -1, 1, 1,
        -1, -1, -1,
        -1, -1, -1,
        -1, 1, 1,
        -1, 1, -1,
        //top +y
        1, 1, 1,
        1, 1, -1,
        -1, 1, 1,
        -1, 1, 1,
        1, 1, -1,
        -1, 1, -1,
        //bottom -y
        1, -1, -1,
        1, -1, 1,
        -1, -1, -1,
        -1, -1, -1,
        1, -1, 1,
        -1, -1, 1
    ];
    
    var vertexColorData = [
        //front -z
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        //right +x
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        //back +z
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        
        //left -x
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        //top +y
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        //bottom -y
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
    ];
    
    //create new VBO
    drawBuffer = gl.createBuffer();
    //Bind the created VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //Send data to binded VBO. Data will stay in this buffer, and we can rebind it again later.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    drawBuffer.itemCount = vertexData.length;
    
    //Create texture cube map coordinates
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorData), gl.STATIC_DRAW);
    vertexColorBuffer.itemCount = vertexColorData.length;
    
    //Create texture cube map coordinates
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordData), gl.STATIC_DRAW);
    texCoordBuffer.itemCount = texCoordData.length;
    
}

function drawScene(){
    
    //create model matrix and perpective matrix using THREE.matrix4
    var modelMatrix = (new THREE.Matrix4()).makeTranslation(0, 0, 5);
    var perspectiveMatrix = (new THREE.Matrix4()).makePerspective(70.0, canvas.width/canvas.height, 0.1, 1000);
    
    //local model transformation multiplication chain
    var mat4Trans = WEBGL_LIB.Math.getTranslationMat4f(0, 0, 0).matrixMult(
                                    WEBGL_LIB.Math.getZRotationMat4f(0).matrixMult(
                                    WEBGL_LIB.Math.getYRotationMat4f(rotationX).matrixMult(
                                    WEBGL_LIB.Math.getXRotationMat4f(rotationY).matrixMult(
                                    WEBGL_LIB.Math.getScaleMat4f(20, 20, 20)))));

    var mat4Proj = WEBGL_LIB.Math.getPerspectiveProjMat4f(150.0, canvas.width, canvas.height, 0.1, 100.0);
		
    
    perspectiveMatrixUniform = gl.getUniformLocation(program, "uPerMatrix");
    modelMatrixUniform = gl.getUniformLocation(program, "uModMatrix");
    
    gl.uniformMatrix4fv(perspectiveMatrixUniform, false, mat4Proj.array);
    gl.uniformMatrix4fv(modelMatrixUniform, false, mat4Trans.array);
    
    textureCoordAttr = gl.getAttribLocation(program, "aTexCoord");
    gl.enableVertexAttribArray(textureCoordAttr);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttr, 3, gl.FLOAT, false, 0, 0);
    
    vertexColorAttr = gl.getAttribLocation(program, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttr);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(vertexColorAttr, 3, gl.FLOAT, false, 0, 0);
    
    //get reference to attribute variable in vertex shader
    vertexPosAttr = gl.getAttribLocation(program, "aVertexPos");
    //Enable feeding of array of data to attribute
    gl.enableVertexAttribArray(vertexPosAttr);
    //Bind the buffer that data we want to give to drawing
    gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
    //We tell the WebGL how to interpret the data in bind buffers
    gl.vertexAttribPointer(vertexPosAttr, 3, gl.FLOAT, false, 0, 0);
    
    
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, drawBuffer.itemCount/3);
    
    
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
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
        
        initShaders();
        initBuffers();
        
        //drawScene();
        //also draws the scene
        loadTextures();
        
        
    }else{
        alert("Error getting the context. Browser may not support WebGL");
    }
}

WEBGL_LIB = {};
//global namespace for math functionalities
WEBGL_LIB.Math = {};

//Define entities
WEBGL_LIB.Math.Entities = {};

WEBGL_LIB.Math.Entities.Matrix4f = function(matrixArray){
    /*
	Class: Matrix4f

	Desc:
		Class that represents 4x4 matrix
	Constructor params:
		
	Member variables:
		matrix: 4x4 array containing float values
    */
    if(!matrixArray || matrixArray.length !== 16){
    	this.array = new Float32Array(16);
    	this.array[0] = 1.0; //m11
    	this.array[1] = 0.0; //m21
    	this.array[2] = 0.0; //m31
    	this.array[3] = 0.0; //m41
    	this.array[4] = 0.0; //m12
    	this.array[5] = 1.0; //m22
    	this.array[6] = 0.0; //m32
    	this.array[7] = 0.0; //m42
    	this.array[8] = 0.0; //m13
    	this.array[9] = 0.0; //m23
    	this.array[10] = 1.0; //m33
    	this.array[11] = 0.0; //m43
    	this.array[12] = 0.0; //m14
    	this.array[13] = 0.0; //m24
    	this.array[14] = 0.0; //m34
    	this.array[15] = 1.0; //m44
    }else{
    	this.array = new Float32Array(matrixArray);
    }
};

WEBGL_LIB.Math.Entities.Matrix4f.prototype.matrixMult = function(mat4){
    var result = new WEBGL_LIB.Math.Entities.Matrix4f();
    
    if(mat4 instanceof WEBGL_LIB.Math.Entities.Matrix4f){
    	result.array[0] = this.array[0] * mat4.array[0] + this.array[4] * mat4.array[1] + this.array[8] * mat4.array[2] + this.array[12] * mat4.array[3]; //m11
        result.array[1] = this.array[1] * mat4.array[0] + this.array[5] * mat4.array[1] + this.array[9] * mat4.array[2] + this.array[13] * mat4.array[3]; //m21
        result.array[2] = this.array[2] * mat4.array[0] + this.array[6] * mat4.array[1] + this.array[10] * mat4.array[2] + this.array[14] * mat4.array[3]; //m31
        result.array[3] = this.array[3] * mat4.array[0] + this.array[7] * mat4.array[1] + this.array[11] * mat4.array[2] + this.array[15] * mat4.array[3]; //m41
        result.array[4] = this.array[0] * mat4.array[4] + this.array[4] * mat4.array[5] + this.array[8] * mat4.array[6] + this.array[12] * mat4.array[7]; //m12
    	result.array[5] = this.array[1] * mat4.array[4] + this.array[5] * mat4.array[5] + this.array[9] * mat4.array[6] + this.array[13] * mat4.array[7]; //m22
    	result.array[6] = this.array[2] * mat4.array[4] + this.array[6] * mat4.array[5] + this.array[10] * mat4.array[6] + this.array[14] * mat4.array[7]; //m32
    	result.array[7] = this.array[3] * mat4.array[4] + this.array[7] * mat4.array[5] + this.array[11] * mat4.array[6] + this.array[15] * mat4.array[7]; //m42
    	result.array[8] = this.array[0] * mat4.array[8] + this.array[4] * mat4.array[9] + this.array[8] * mat4.array[10] + this.array[12] * mat4.array[11]; //m13
    	result.array[9] = this.array[1] * mat4.array[8] + this.array[5] * mat4.array[9] + this.array[9] * mat4.array[10] + this.array[13] * mat4.array[11]; //m23
    	result.array[10] = this.array[2] * mat4.array[8] + this.array[6] * mat4.array[9] + this.array[10] * mat4.array[10] + this.array[14] * mat4.array[11]; //m33
    	result.array[11] = this.array[3] * mat4.array[8] + this.array[7] * mat4.array[9] + this.array[11] * mat4.array[10] + this.array[15] * mat4.array[11]; //m43
    	result.array[12] = this.array[0] * mat4.array[12] + this.array[4] * mat4.array[13] + this.array[8] * mat4.array[14] + this.array[12] * mat4.array[15]; //m14
    	result.array[13] = this.array[1] * mat4.array[12] + this.array[5] * mat4.array[13] + this.array[9] * mat4.array[14] + this.array[13] * mat4.array[15]; //m24
    	result.array[14] = this.array[2] * mat4.array[12] + this.array[6] * mat4.array[13] + this.array[10] * mat4.array[14] + this.array[14] * mat4.array[15]; //m34
    	result.array[15] = this.array[3] * mat4.array[12] + this.array[7] * mat4.array[13] + this.array[11] * mat4.array[14] + this.array[15] * mat4.array[15]; //m44
    }else{
    	console.log("Can't multiply Matrix4f with other than Matrix4f. Tried to multiply with:");
    	console.log(mat4);
    }
    
    return result;
};

WEBGL_LIB.Math.getXRotationMat4f = function(rotationAngle){
	var rotationRad = rotationAngle * (Math.PI/180.0);
	var rotMat4 = new WEBGL_LIB.Math.Entities.Matrix4f([
	                                           1, 0, 0, 0, 
	                                           0, Math.cos(rotationRad), -Math.sin(rotationRad), 0,
	                                           0, Math.sin(rotationRad), Math.cos(rotationRad), 0,
	                                           0, 0, 0, 1 ]);
	return rotMat4;
};

WEBGL_LIB.Math.getYRotationMat4f = function(rotationAngle){
	var rotationRad = rotationAngle * (Math.PI/180.0);
	var rotMat4 = new WEBGL_LIB.Math.Entities.Matrix4f([
	                                           Math.cos(rotationRad),0, Math.sin(rotationRad), 0,
	                                           0, 1, 0, 0,
	                                           -Math.sin(rotationRad), 0, Math.cos(rotationRad), 0,
	                                           0, 0, 0, 1 ]);
	return rotMat4;
};

WEBGL_LIB.Math.getZRotationMat4f = function(rotationAngle){
	var rotationRad = rotationAngle * (Math.PI/180.0);
	var rotMat4 = new WEBGL_LIB.Math.Entities.Matrix4f([
	                                           Math.cos(rotationRad), -Math.sin(rotationRad), 0, 0, 
	                                           Math.sin(rotationRad), Math.cos(rotationRad), 0, 0,
	                                           0, 0, 1, 0,
	                                           0, 0, 0, 1 ]);
	return rotMat4;
};

WEBGL_LIB.Math.getScaleMat4f = function(sx, sy, sz){
	var scaleMat4 = new WEBGL_LIB.Math.Entities.Matrix4f([
	                                          sx, 0, 0, 0,
	                                          0, sy, 0, 0,
	                                          0, 0, sz, 0,
	                                          0, 0, 0, 1 ]);
	return scaleMat4;
};

WEBGL_LIB.Math.getTranslationMat4f = function(x, y, z){
	var transMat4 = new WEBGL_LIB.Math.Entities.Matrix4f([
	                                           1, 0, 0, 0, 
	                                           0, 1, 0, 0,
	                                           0, 0, 1, 0,
	                                           x, y, z, 1 ]);
	return transMat4;
};

WEBGL_LIB.Math.getPerspectiveProjMat4f = function(fov, width, height, nearClip, farClip){
	var halfFov = Math.tan((fov/2) * (Math.PI/180.0)); //distance to center from screen border
	var aspectRatio = height/width; //screen aspect
	var clipRange = nearClip - farClip;
	var projMat4 = new WEBGL_LIB.Math.Entities.Matrix4f([
	                                           1.0 * (halfFov * aspectRatio), 0, 0, 0,
	                                           0, 1.0 * (halfFov), 0, 0,
	                                           0, 0, (-nearClip - farClip)/clipRange, 1,
	                                           0, 0, 2 * farClip * nearClip / clipRange, 0 ]);
	return projMat4;
};