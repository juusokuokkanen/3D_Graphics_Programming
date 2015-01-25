/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var renderer = null;
var quad = null;
var angle = 0;

window.onload = function(){
    startThree();
};

function startThree(){
    //Setup renderer and atach it to document
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    //Create perpective camera and move it back along z axis
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, 10);
    
    
   //Initializr quad and clear color
    var quadColor = new THREE.Color(0x00FF00);
    var clearColor = new THREE.Color();
    clearColor.setRGB(0.0, 0.0, 1.0);
    
    //Create empty scene
    var scene = new THREE.Scene();

    //Create quad geometry by givin each vertex position, and defining faces/indices
    quad = new THREE.Geometry();

    quad.vertices.push(new THREE.Vector3(-5, -5, 0));
    quad.vertices.push(new THREE.Vector3(5, -5, 0));
    quad.vertices.push(new THREE.Vector3(-5, 5, 0));
    quad.vertices.push(new THREE.Vector3(5, 5, 0));

    quad.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 1, 3));

    //set quad material with quadColor (green)
    var material = new THREE.MeshBasicMaterial({
        color: quadColor
    });
    
    //create mesh from quad geometry and material
    var mesh = new THREE.Mesh(quad, material);
    
    //Add quad mesh to scene
    scene.add(mesh);
    
    //set renderer clear color to blue and render with scene and camera
    renderer.setClearColor(clearColor, 1.0);
    renderer.render(scene, camera);
}

