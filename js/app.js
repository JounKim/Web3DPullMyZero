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

const models = [
    { path: 'models/Room2.gltf', position: { x: 0, y: 0, z: 0 } },
    { path: 'models/dancing.gltf', position: { x: 0, y: 0, z: 40 } },
    { path: 'models/Flamingo.glb', position: { x: -10, y: 0, z: 0 } }
];

let mixers = []; // Array to store animation mixers


models.forEach((model) => {
    loader.load(
        model.path,
        function (gltf) {
            const loadedModel = gltf.scene;
            loadedModel.position.set(model.position.x, model.position.y, model.position.z);
            scene.add(loadedModel);

            // If the model has animations, create an AnimationMixer and store it
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(loadedModel);
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });
                mixers.push(mixer);
            }
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error(error);
        }
    );
});


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



//랜더러
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);


//캔버스라고 했는데 나는 컨테이너 (html에 div로 들어가있음)
document.getElementById("container3D").appendChild(renderer.domElement);
//document.body.appendChild( renderer.domElement );



// 조명 넣기
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500,500,500)
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 2);
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


// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update all mixers for animations
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));

    controlcam.update();
    renderer.render(scene, camera);
}

const clock = new THREE.Clock(); // Clock for keeping track of time in the animation
animate();



