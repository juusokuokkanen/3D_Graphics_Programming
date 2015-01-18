/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


window.onload = initWebGL();
var gl = null;

function initWebGL(){
    try{
        //get the canvas element with its id
        var canvas = document.getElementById("canvas-webgl");
        //get webgl context to global gl variable
        gl = canvas.getContext("webgl");
    }
    catch(e){
        
    }
    //check that context was gotten and fill the color buffer
    if(gl){
        //we can access the webgl functionalities by usin gl, that contains the context
        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }else{
        alert("Error getting the context. Browser may not support WebGL");
    }
}