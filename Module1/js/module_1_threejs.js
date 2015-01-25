/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var renderer = null;
var quad = null;
var angle = 0;
var renderer = null;
var scene = null;
var camera = null;
var mesh = null;
var texture = THREE.ImageUtils.loadTexture("js/kitty.jpg");;

var meshOriginPositionX;
window.onload = function(){
    startThree();
};

function animLoop(){
        //rotate mesh around y-axis
        mesh.position.x = meshOriginPositionX + 2.0*Math.cos(angle);
        mesh.rotation.y = angle;
        angle += 0.05;
        requestAnimationFrame(animLoop);
        renderer.render(scene, camera);
};

function startThree(){
    //Setup renderer and atach it to document
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    //Create perpective camera and move it back along z axis
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, 10);
    
    
   //Initializr quad and clear color
    var quadColor = new THREE.Color(0xFF0000);
    var clearColor = new THREE.Color();
    clearColor.setRGB(0.0, 0.0, 1.0);
    
    //Create empty scene
    scene = new THREE.Scene();

    //Create quad geometry by givin each vertex position, and defining faces/indices
    quad = new THREE.Geometry();

    quad.vertices.push(new THREE.Vector3(-5, -5, 0));
    quad.vertices.push(new THREE.Vector3(5, -5, 0));
    quad.vertices.push(new THREE.Vector3(-5, 5, 0));
    quad.vertices.push(new THREE.Vector3(5, 5, 0));

    var material = new THREE.MeshBasicMaterial({
        //color: triangleColor
        vertexColors: THREE.VertexColors
    });

    quad.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 1, 3));
    
    quad.faces[0].vertexColors.push(new THREE.Color(0x00FF00));
    quad.faces[0].vertexColors.push(new THREE.Color(0xFF0000));
    quad.faces[0].vertexColors.push(new THREE.Color(0xFFFF00));
    quad.faces[1].vertexColors.push(new THREE.Color(0xFFFF00));
    quad.faces[1].vertexColors.push(new THREE.Color(0xFF0000));
    quad.faces[1].vertexColors.push(new THREE.Color(0x00FF00));
    
    quad.faceVertexUvs.push(new THREE.Vector2(0, 0));
    quad.faceVertexUvs.push(new THREE.Vector2(1, 0));
    quad.faceVertexUvs.push(new THREE.Vector2(0, 0));
    quad.faceVertexUvs.push(new THREE.Vector2(1, 1));
    //load texture
    //texture = THREE.ImageUtils.loadTexture("js/kitty.jpg");
    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
    //texture.repeat.set( 4, 4 );
    texture.needsUpdate = true;

    //set quad material with quadColor (green)
    var material = new THREE.MeshBasicMaterial({
        //color: quadColor
        //vertexColors: THREE.VertexColors
        map: texture
    });
    
    //create mesh from quad geometry and material
    mesh = new THREE.Mesh(quad, material);
    mesh.doubleSided = true;
    //Add quad mesh to scene
    scene.add(mesh);
    
    //set renderer clear color to blue and render with scene and camera
    renderer.setClearColor(clearColor, 1.0);
    
    meshOriginPositionX = mesh.position.x;
    
    animLoop();
    
}

