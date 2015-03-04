/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var renderer = null;
var scene = null;
var camera = null;
var meshes = {};

function initializeArmHierarchy(){
    //TODO: We need to probably rotate first and then translate these (and not to set position like now)
    //but see first how it goes.

    //shoulder
    meshes.shoulder = new THREE.Mesh(
                new THREE.SphereGeometry(4, 10, 10),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0xFF0000)})
            );
    //upper arm
    meshes.upperArm = new THREE.Mesh(
                new THREE.BoxGeometry(3, 10, 3),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0x00FF00)})
            );
    meshes.upperArm.position.y = 6
    meshes.shoulder.add(meshes.upperArm);
    //elbow
    meshes.elbow = new THREE.Mesh(
                new THREE.SphereGeometry(3, 10, 10),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0xFF0000)})
            );
    meshes.elbow.position.y = 6;
    meshes.upperArm.add(meshes.elbow);
    //lower arm
    meshes.lowerArm = new THREE.Mesh(
                new THREE.BoxGeometry(3, 10, 3),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0x00FF00)})
            );
    meshes.lowerArm.position.y = 7
    meshes.elbow.add(meshes.lowerArm);
    //hand/wrist
    meshes.hand = new THREE.Mesh(
                new THREE.BoxGeometry(4, 4, 4),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0x0000FF)})
            );
    meshes.hand.position.y = 7
    meshes.lowerArm.add(meshes.hand);
    //fingers
    //thumb
    meshes.thumb = new THREE.Mesh(
                new THREE.BoxGeometry(3.0, 1, 1),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0xFF0000)})
            );
    meshes.thumb.position.x = 3;
    meshes.hand.add(meshes.thumb);
    //index
    meshes.index = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 4, 1),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0xFF0000)})
            );
    meshes.index.position.y = 3;
    meshes.index.position.x = 1.5;
    meshes.hand.add(meshes.index);
    //middle
    meshes.middle = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 4, 1),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0xFF0000)})
            );
    meshes.middle.position.y = 3;
    meshes.hand.add(meshes.middle);
    //pinky
    meshes.pinky = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 4, 1),
                new THREE.MeshBasicMaterial({color : new THREE.Color(0xFF0000)})
            );
    meshes.pinky.position.y = 3;
    meshes.pinky.position.x = -1.5;
    meshes.hand.add(meshes.pinky);
    
}

function setup(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(650, 500);
    document.body.appendChild(renderer.domElement);
    
    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 650/500, 0.1, 1000);
    scene.add(camera);
    
    initializeArmHierarchy();
    
    scene.add(meshes.shoulder);
    meshes.shoulder.rotaionAngleZ = 0.0;
    meshes.elbow.rotationAngleZ = 0.0;
    meshes.hand.rotationAngleX = 0.0;
    //scene.add(meshes.upperArm);
    //scene.add(meshes.elbow);
    camera.position.z = 30;
    camera.position.y = 20;
    
    renderer.render(scene, camera);
}

function update(){
    var rotationShoulder = Math.PI/4 * Math.cos(meshes.shoulder.rotaionAngleZ);
    meshes.shoulder.rotaionAngleZ += 0.01;
    meshes.shoulder.rotation.z = rotationShoulder;
    
    var rotationElbow = Math.PI/8 * Math.sin(meshes.elbow.rotationAngleZ);
    meshes.elbow.rotationAngleZ += 0.01; 
    meshes.elbow.rotation.z = rotationElbow;
    
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}
