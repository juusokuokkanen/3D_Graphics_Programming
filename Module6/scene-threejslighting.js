/*************************************************************
  3D Graphics Programming
  anssi.grohn@karelia.fi 2013
  Skybox and lighting demo demo code with Three.js.
  (with FPS counter, too!)
 *************************************************************/
// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = [];

var shoulderRotationJoint;
var shoulderTiltingJoint;
var upperArm;
var elbowJoint;
var lowerArm;
var wrist;
var hand;
var thumb;
var indexfinger;
var middlefinger;
var pinky;
var box;
var bonfire = null;

var fps = {
    width: 100,
    height: 50,
    svg: null,
    data: [],
    ticks: 0,
    time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
var skySphereMesh = null;

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    camObject = new THREE.Object3D();
    camObject.add(camera);
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // directional light for the moon
    var directionalLight = new THREE.DirectionalLight( 0x88aaff, 1.0 ); 
    directionalLight.position.set( 1, 1, -1 ); 
    scene.add( directionalLight );

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add( ambientLight  );

    scene.fog = new THREE.Fog(0x172747, 1.0, 50.0);

    // Add our "flashlight"
    var distance  = 6.0;
    var intensity = 2.0;
    spotLight = new THREE.SpotLight( 0xffffff, 
				     intensity,
				     distance ); 
    // shadows are complex topic, not covered now.
    spotLight.castShadow = false; 
    spotLight.position = new THREE.Vector3(0,0,1);
    // where spotlight is "looking"
    spotLight.target = spotLightObj;
    // spotlight exponent "spread"
    spotLight.exponent = 188.1;
    // spotlight cone angle
    spotLight.angle = 0.21;

    scene.add( spotLight );
    
    var loader = new THREE.JSONLoader();

    function handler(geometry, materials) {
        skySphereMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(
	    {
		map: THREE.ImageUtils.loadTexture("clouds.png"),
		transparent: true,
		side : THREE.DoubleSide
	    }
	));
        //we alter the rendering order of the items with rendering depth
        skySphereMesh.renderDepth = 5000;
        skySphereMesh.position = camObject.position;
        scene.add(skySphereMesh);
    }
    
    loader.load("meshes/sky.js", handler);

    // load skybox materials 
    var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
	d.side = THREE.BackSide;
	d.depthWrite = false;

    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
	new THREE.CubeGeometry( 1,1,1,1,1,1 ), 
	sbmfm
    );

    skybox.position = camObject.position;
    scene.add(skybox);
    
    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;





    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1),
				 new THREE.MeshPhongMaterial({
				     map: rockTexture,
				     transparent: true
				 }));

    ground.renderDepth = 2000;
    // Do a little magic with vertex coordinates so ground looks more interesting
    $.each(ground.geometry.faceVertexUvs[0], function(i,d){

	d[0] = new THREE.Vector2(0,25);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });
    
    
    //scene.add(ground);


    
    fps.time = new Date();
    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
	mouse.down = true;
	mouse.prevY = ev.pageY;
	mouse.prevX = ev.pageX;
    }

    document.onmouseup = function(ev){
	mouse.down = false;
    }

    document.onmousemove = function(ev){
	if ( mouse.down ) {

	    var rot = (ev.pageY - mouse.prevY) * 0.01;
	    var rotY = (ev.pageX - mouse.prevX) * 0.01;

	    camObject.rotation.y -= rotY;
	    camera.rotation.x -= rot;

	    mouse.prevY = ev.pageY;
	    mouse.prevX = ev.pageX;
	}
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
	keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
	keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
	console.log(d);
    });
    //Create SVG element (ain't HTML5 grand stuff?)
    fps.svg = d3.select("#fps")
	.append("svg")
	.attr("width", fps.width)
	.attr("height", fps.height);

    //CREATE BONFIRE
    bonfire = new Bonfire({
        bonfirePosition : new THREE.Vector3(0, 0, 0),
        
        //smoke
        smokeVelocity : new THREE.Vector3(0.1, 0.5, 0),
        smokeEnergy : 100,
        smokeEnergyDrain : 20,
        smokeMaxParticles : 25,
        //smoke particles per second
        smokeFrequency : 0.5,
        
        //fire
        fireVelocity : new THREE.Vector3(0, 1, 0),
        fireEnergy : 100,
        fireEnergyDrain : 150,
        fireMaxParticles : 4,
        //smoke particles per second
        fireFrequency : 5
    });
    bonfire.initSmokeParticles(1);
    scene.add(bonfire.smokeSystem);
    scene.add(bonfire.fireSystem);
    
    //CREATE TREES
    var tree = new Tree("PINE");
    tree.treeObject.position.x = 10;
    scene.add(tree.treeObject);

});

function addArm(){
    shoulderRotationJoint = new THREE.Object3D();
    shoulderRotationJoint.position.y = 0.5;
    shoulderTiltingJoint = new THREE.Mesh( 
        new THREE.SphereGeometry(0.2,10,10), 
        new THREE.MeshLambertMaterial({ color: 0xFF0000, transparent: true})
    );
    upperArm  = new THREE.Mesh( new THREE.CubeGeometry(0.125,0.5,0.125),
                                new THREE.MeshLambertMaterial({ color: 0x00FF00, transparent: true}));
    upperArm.position.y = 0.45;
    elbowJoint = new THREE.Mesh( 
        new THREE.SphereGeometry(0.12,10,10), 
        new THREE.MeshLambertMaterial({ color: 0xFF00FF, transparent: true})
    );
    lowerArm = new THREE.Mesh( new THREE.CubeGeometry(0.125,0.5,0.125),
                                new THREE.MeshLambertMaterial({ color: 0xFFFF00, transparent: true}));


    wrist = new THREE.Object3D();
    hand = new THREE.Mesh( new THREE.CubeGeometry(0.25,0.25,0.25),
                           new THREE.MeshLambertMaterial({ color: 0x0000FF, transparent: true}));
    shoulderRotationJoint.add(shoulderTiltingJoint);
    shoulderTiltingJoint.add(upperArm);

    scene.add(shoulderRotationJoint);
    shoulderRotationJoint.add(shoulderTiltingJoint);
    shoulderTiltingJoint.add(upperArm);
    upperArm.add(elbowJoint);
    elbowJoint.position.y = 0.25;
    elbowJoint.add(lowerArm);
    lowerArm.position.y = 0.25;
    lowerArm.add(wrist);
    wrist.position.y = 0.25;
    wrist.add(hand);
    hand.position.y = 0.05;
    thumb =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
                             new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: true}));
    hand.add(thumb);
    thumb.position.x = 0.2;
    thumb.rotation.z = 2.0;


    indexfinger =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
                                   new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: true}));
    hand.add(indexfinger);
    indexfinger.position.x = 0.10;
    indexfinger.position.y = 0.2;


    middlefinger =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
                                    new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: true}));
    hand.add(middlefinger);
    middlefinger.position.x = 0.0;
    middlefinger.position.y = 0.2;

    pinky =  new THREE.Mesh( new THREE.CubeGeometry(0.05,0.25,0.05),
                                    new THREE.MeshLambertMaterial({ color: 0xFFAAAA, transparent: true}));
    hand.add(pinky);
    pinky.position.x = -0.1;
    pinky.position.y = 0.2;
}

var angle = 0.0;
var movement = 0.0;
var moving = false;

function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    angle += 0.001;
    moving = false;
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["S".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;

    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;
    }
    if ( keysPressed["Q".charCodeAt(0)] == true ){

	shoulderRotationJoint.rotation.y += 0.1;

    }
    if ( keysPressed["E".charCodeAt(0)] == true ){

	shoulderRotationJoint.rotation.y -= 0.1;

    }
    // so strafing and moving back-fourth does not double the bounce
    if ( moving ) {
	movement+=0.1;
	camObject.position.y = Math.sin(movement*2.30)*0.07+1.2; 
    }
    spotLight.position = camObject.position;

    var dir = new THREE.Vector3(0,0,-1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;
    
    bonfire.updateBonfireParticles();
    // request another frame update
    requestAnimationFrame(update);
    
    fps.ticks++;
    var tmp = new Date();
    var diff = tmp.getTime()-fps.time.getTime();

    if ( diff > 1000.0){
	fps.data.push(fps.ticks);
	if ( fps.data.length > 15 ) {
	    fps.data.splice(0, 1);
	}
	fps.time = tmp;
	fps.ticks = 0;
	displayFPS();
    }
    
}

  
// for displaying fps meter 
function displayFPS(){

    fps.svg.selectAll("rect").remove();
    
    fps.svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", 100)
	.attr("height", 50)
	.attr("fill", "rgb(0,0,0)");

    fps.svg.selectAll("rect")
	.data(fps.data)
	.enter()
	.append("rect")
	.attr("x", function(d, i) {
	    return (i * (2+1));  //Bar width of 20 plus 1 for padding
	})
	.attr("y", function(d,i){
	    return 50-(d/2);
	})
	.attr("width", 2)
	.attr("height", function(d,i){
	    return (d/2);
	})
	.attr("fill", "#FFFFFF");
	
    fps.svg.selectAll("text").remove();
    fps.svg
	.append("text")
	.text( function(){
	    return fps.data[fps.data.length-1] + " FPS";
	})
	.attr("x", 50)
	.attr("y", 25)
	.attr("fill", "#FFFFFF");
}

function Bonfire(properties){
     //we create two systems: one for somke and one for fire particles
     this.prevTime = Date.now();
     this.properties = properties;
     
     //create logs
     this.bonfireLogs = new THREE.Object3D();
     
     //Create a bonfire log meshes that will be added to bonfireLogs Object3D
     this.logs = [];
     for(var i = 0; i < 5; i++){
         this.logs.push(new THREE.Mesh(
                 new THREE.CubeGeometry(0.5, 0.1, 0.1),
                 new THREE.MeshPhongMaterial({
                     color : new THREE.Color(0x691F01),
                     transparent : true,
                 })
         ));
         this.bonfireLogs.add(this.logs[i]);
         this.logs[i].renderDepth = 1000;
         this.logs[i].position.y = 0.2;
         this.logs[i].rotation.z = Math.PI/4;
     }
     this.logs[0].position.x = -0.15;
     this.logs[1].rotation.y = ((2*Math.PI)/5)*1;
     this.logs[1].position.x = -0.05;
     this.logs[1].position.z = 0.2;
     this.logs[2].rotation.y = ((2*Math.PI)/5)*2;
     this.logs[2].position.x = 0.25;
     this.logs[2].position.z = 0.1;
     this.logs[3].rotation.y = ((2*Math.PI)/5)*3;
     this.logs[3].position.x = 0.15;
     this.logs[3].position.z = -0.1;
     this.logs[4].rotation.y = ((2*Math.PI)/5)*4;
     this.logs[4].position.x = -0.05;
     this.logs[4].position.z = -0.2;
     scene.add(this.bonfireLogs);
     //smokeSystem
     this.smokeMaxParticles = this.properties.smokeMaxParticles;
     this.smokeParticles = new THREE.Geometry();
     //make initial particle vertices
     for(var i = 0; i < this.smokeMaxParticles; i++){
         this.smokeParticles.vertices.push(new THREE.Vector3(0,0,0));
     }
     this.smokeParticlesAlive = 0;
     this.lastSmokeCreated = 0;
     this.smokeMaterial = new THREE.ParticleBasicMaterial({
         map : THREE.ImageUtils.loadTexture("smoke.png"),
         transparent: true,
         depthWrite : false,
         blending: THREE.AdditiveBlending,
         blendingEquation: THREE.AddEquation,
         blendSrc : THREE.SrcAlphaFactor,
         blendDst : THREE.OneFactor,
         size : 3
     });
     this.smokeSystem = new THREE.ParticleSystem(this.smokeParticles, this.smokeMaterial);
     this.smokeSystem.renderDepth = 0;
     this.smokeSystem.sortParticles = false;
     //no particles available by default
     this.smokeSystem.geometry.__webglParticleCount = 0;
     
     
     //fire system
     this.fireParticles = new THREE.Geometry();
     this.fireParticlesAlive = 0;
     this.lastFireCreated = 0;
     //make initial particle vertices
     for(var i = 0; i < this.smokeMaxParticles; i++){
         this.fireParticles.vertices.push(new THREE.Vector3(0,0,0));
     }
     this.fireMaterial = new THREE.ParticleBasicMaterial({
         map : THREE.ImageUtils.loadTexture("fire.png"),
         transparent: true,
         depthWrite : false,
         blending: THREE.CustomBlending,
         blendingEquation: THREE.AddEquation,
         blendSrc : THREE.SrcAlphaFactor,
         blendDst : THREE.OneFactor,
         size : 1
     });
     this.fireSystem = new THREE.ParticleSystem(this.fireParticles, this.fireMaterial);
     this.fireSystem.renderDepth = 0;
     this.fireSystem.sortParticles = false;
     //no particles available by default
     this.fireSystem.geometry.__webglParticleCount = 0;
     
     this.initSmokeParticles = function(smokeCnt){
         //initialize smoke system
         var currentAlive = this.smokeParticlesAlive;
         var nextAlive = currentAlive + smokeCnt;
         nextAlive = (nextAlive > this.smokeMaxParticles) ? this.smokeMaxParticles : nextAlive;
         for(var i = currentAlive; i < nextAlive; i++){
             this.smokeParticles.vertices[i].set(0,0,0);
             this.smokeParticles.vertices[i].creation = Date.now();
             this.smokeParticles.vertices[i].energy = this.properties.smokeEnergy;
             this.smokeParticlesAlive++;
         }
         this.smokeSystem.geometry.verticesNeedUpdate = true;
     };
     
     this.initFireParticles = function(fireCnt){
         //initialize fire system
         var currentAlive = this.fireParticlesAlive;
         var nextAlive = currentAlive + fireCnt;
         nextAlive = (nextAlive > this.fireMaxParticles) ? this.fireMaxParticles : nextAlive;
         for(var i = currentAlive; i < nextAlive; i++){
             this.fireParticles.vertices[i].set(0,0,0);
             this.fireParticles.vertices[i].creation = Date.now();
             this.fireParticles.vertices[i].energy = this.properties.fireEnergy;
             this.fireParticlesAlive++;
         }
         this.fireSystem.geometry.verticesNeedUpdate = true;
     };
     
     this.updateBonfireParticles = function(){
         var curTime = Date.now();
         var delta = (curTime - this.prevTime)/1000.0;
         this.smokeSystem.geometry.__webglParticleCount = this.smokeParticlesAlive;
         var currentAlive = this.smokeParticlesAlive;
         for(var i = 0; i < currentAlive; i++){
             var particle = this.smokeSystem.geometry.vertices[i];
             if(particle !== undefined){
                 particle.add(this.properties.smokeVelocity.clone().multiplyScalar(delta));
                 particle.energy -= this.properties.smokeEnergyDrain * delta;
                 //check if dead
                 if(particle.energy <= 0){
                     var deadParticle = this.smokeSystem.geometry.vertices.splice(i, 1);
                     this.smokeSystem.geometry.vertices.push(deadParticle[0]);
                     this.smokeParticlesAlive--;
                     currentAlive = this.smokeParticlesAlive;
                 }
             }
         }
         
         
         this.fireSystem.geometry.__webglParticleCount = this.fireParticlesAlive;
         currentAlive = this.fireParticlesAlive;
         for(var i = 0; i < currentAlive; i++){
             var particle = this.fireSystem.geometry.vertices[i];
             if(particle !== undefined){
                 particle.add(this.properties.fireVelocity.clone().multiplyScalar(delta));
                 particle.energy -= this.properties.fireEnergyDrain * delta;
                 //check if dead
                 if(particle.energy <= 0){
                     var deadParticle = this.fireSystem.geometry.vertices.splice(i, 1);
                     this.fireSystem.geometry.vertices.push(deadParticle[0]);
                     this.fireParticlesAlive--;
                     currentAlive = this.fireParticlesAlive;
                 }
             }
         }
         
         this.smokeSystem.geometry.verticesNeedUpdate = true;
         this.fireSystem.geometry.verticesNeedUpdate = true;
         this.burnBabyBurn();
         this.prevTime = curTime;
     };
     
     this.burnBabyBurn = function(){
         var current = Date.now();
         if((current - this.lastFireCreated) > 1000/this.properties.fireFrequency){
             this.initFireParticles(1);
             this.lastFireCreated = current;
         }
         if((current - this.lastSmokeCreated) > 1000/this.properties.smokeFrequency){
             this.initSmokeParticles(1);
             this.lastSmokeCreated = current;
         }
     }
     
     this.setPosition = function(x, y, z){
         this.bonfireLogs.position.x = x;
         this.bonfireLogs.position.y = y;
         this.bonfireLogs.position.z = z;
         this.fireSystem.position.x = x;
         this.fireSystem.position.y = y;
         this.fireSystem.position.z = z;
         this.smokeSystem.position.x = x;
         this.smokeSystem.position.y = y;
         this.smokeSystem.position.z = z;
     }
};

function Tree(type){
    this.treeObject = new THREE.Object3D();
    this.image = null;
    if(type === "PINE"){
        this.image = THREE.ImageUtils.loadTexture("pine.png");
    } else if(type==="LIME"){
        this.image = THREE.ImageUtils.loadTexture("lime.png");
    }
    this.image.flipY = false;
    this.planes = [];
    for(var i = 0; i < 2; i++){
        this.planes[i] = new THREE.Mesh(
                new THREE.PlaneGeometry(5, 5),
                new THREE.MeshPhongMaterial({
                    map : this.image,
                    transparent : true,
                    side : THREE.DoubleSide,
                    depthWrite : false,
                    depthTest : true
                })
        );
        this.treeObject.add(this.planes[i]);
        this.planes[i].renderDepth = 1000;
    }
    this.planes[0].rotation.y = Math.PI/2;
    this.treeObject.position.y = 2.5;
    
}
    