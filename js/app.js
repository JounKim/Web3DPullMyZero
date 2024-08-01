import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log(THREE);

//장면
const scene = new THREE.Scene();

//카메라
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );


//모델 업로드
let object;
let controls;
let objToRender = 'dancing';

const loader = new GLTFLoader();
loader.load(
	'models/Room2.gltf',
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

// const models1 = new GLTFLoader();
// models1.load(
// 	'models/dancing.gltf', (models1) => {
// 		this._mixer = new THREE.AnimationMixer(gltf.scene);
// 		const idle = this._mixer.clipAction(models1.animations[0]);
// 		idle.play();
// 	},

// 	function(gltf){
// 		models1 = gltf.scene;
// 		scene.add(models1);
// 	},
// 	function(xhr){
// 		console.log((xhr.loaded/xhr.total*100) + '% loaded');
// 	},
// 	function(error){
// 		console.error(error);
// 	}
// );


//사운드 업로드

const listener_ = new THREE.AudioListener();
camera.add(listener_);

const sound = new THREE.PositionalAudio(listener_);
const loadersound = new THREE.AudioLoader();
loadersound.load('audio/ShowMusic.mp3', (buffer) => {
	sound.setBuffer(buffer);
	sound.setVolume(1);
	sound.setRefDistance(10);
	sound.play(); 
});

// loader.add(sound);

// initializeAudio_() {
// 	this.listener_ = new THREE.AudioListener();
// 	this.camera_.add(this.listener_);

// 	const sound = new THREE.PositionalAudio(this.listener_);
// 	const loadersound = new THREE.AudioLoader();
// 	loadersound.load('audio/ShowMusic.mp3', (buffer) => {
// 		sound.setBuffer(buffer);
// 		sound.setVolume(1);
// 		sound.setRefDistance(1);
// 		sound.play();
// 	});

// 	this.loader.add(sound);
// };

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


//랜더러
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);


//캔버스라고 했는데 나는 컨테이너 (html에 div로 들어가있음)
document.getElementById("container3D").appendChild(renderer.domElement);
//document.body.appendChild( renderer.domElement );






// renderer.setAnimationLoop( animate );


// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );


// 조명 넣기
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500,500,500)
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

//캔버스 크기 자동 조절
window.addEventListener("resize", function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});


// Orbit Control 조절하기
const controlcam = new OrbitControls(camera, renderer.domElement);

camera.position.set(0,0,140);
controlcam.enablePan = false;
controlcam.enableRotate = false;
controlcam.maxDistance = 140;
controlcam.update();


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

