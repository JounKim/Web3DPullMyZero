import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log(THREE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );


let object;
let controls;
let objToRender = 'dancing';

const loader = new GLTFLoader();

loader.load(
	'models/dancing.gltf',
	function(gltf){
		object = gltf.scene;
		scene.add(object);
	},
	function(xhr){
		console.log((xhr.loaded/xhr.total*100) + '% loaded');
	},
	function(error){
		console.error(error);
	}
);

// loader.load(
// 	'models/Flamingo.glb',
// 	function(gltf2){
// 		object = gltf2.scene;
// 		scene.add(object);
// 	},
// 	function(xhr){
// 		console.log((xhr.loaded/xhr.total*100) + '% loaded');
// 	},
// 	function(error){
// 		console.error(error);
// 	}
// );


const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize( window.innerWidth, window.innerHeight);

document.getElementById("container3D").appendChild(renderer.domElement);


// renderer.setAnimationLoop( animate );
// document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );



const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500,500,500)
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);


window.addEventListener("resize", function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

const controlcam = new OrbitControls(camera, renderer.domElement);

camera.position.set(0,0,120);



function animate(){
	requestAnimationFrame(animate);
	controlcam.update();
	

	renderer.render(scene, camera);
}



// function MouseWheel (event){
// 	var fovMax = 16;
// 	var fovMin = 14;

// 	camera.fov -= THREE.MOUSE.DOLLY * 0.05;
// 	console.log(THREE.MOUSE.DOLLY);
// 	camera.fov = Math.max(Math.min(camera.fov, fovMax), fovMin);
// 	camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth/window.innerHeight, camera.near, camera.far);
	
// }

// window.addEventListener("mousewheel", MouseWheel, false);

animate();

// function animate() {

// 	cube.rotation.x += 0.01;
// 	cube.rotation.y += 0.01;

// 	renderer.render( scene, camera );
// }