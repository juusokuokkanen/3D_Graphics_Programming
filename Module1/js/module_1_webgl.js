/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



var gl = null;
var canvas = null;
var vertexShaderCode = null;
var fragmentShaderCode = null;
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
                "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
            "}"
        ].join("\n");
        
        
    }
    
    var vertexShader = makeShaderProgram(vertexShaderCode, gl.VERTEX_SHADER);
    var fragmentShader = makeShaderProgram(fragmentShaderCode, gl.FRAGMENT_SHADER);
    
    if(vertexShader !== null && fragmentShader !== null){
        var program = gl.createProgram();
        gl.attachShader(vertexShader);
        gl.attachShader(vertexShader);
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
        }else{
            alert("Linking the program did not went correctly.");
        }
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
        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        initShaders();
        
        
    }else{
        alert("Error getting the context. Browser may not support WebGL");
    }
}