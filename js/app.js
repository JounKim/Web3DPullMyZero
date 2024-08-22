import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log(THREE);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Lighting
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 2);
scene.add(ambientLight);

// Raycaster and Mouse Vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let previousHover = null; // Track the previously hovered model

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 140);
controls.enablePan = false;
controls.enableRotate = false;
controls.maxDistance = 140;
controls.update();

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

// Models and Mixers
const loader = new GLTFLoader();
const models = [
    { path: 'models/Room2.gltf', position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { path: 'models/dancing.gltf', position: { x: -3, y: -9, z: 70 }, scale: { x: 8, y: 8, z: 8 } },
    { path: 'models/HipHopDance.gltf', position: { x: -3, y: -9, z: 110 }, scale: { x: 8, y: 8, z: 8 } },
    { path: 'models/RumbaDance.gltf', position: { x: -3, y: -9, z: 30 }, scale: { x: 8, y: 8, z: 8 } },
    { path: 'models/ArrowLeft.gltf', position: { x: -8.5, y: 0, z: -12 }, scale: { x: 0.5, y: 0.5, z: 0.5 } },
    { path: 'models/ArrowRight.gltf', position: { x: 8.5, y: 0, z: -12 }, scale: { x: 0.5, y: 0.5, z: 0.5 } }
];

let mixers = []; // Array to store animation mixers
let loadedModels = []; // Array to store loaded models

models.forEach((model) => {
    loader.load(
        model.path,
        function (gltf) {
            const loadedModel = gltf.scene;
            loadedModel.position.set(model.position.x, model.position.y, model.position.z);
            loadedModel.scale.set(model.scale.x, model.scale.y, model.scale.z);
            scene.add(loadedModel);
            loadedModels.push(loadedModel); // Store the model for raycasting

            // Traverse the entire model hierarchy and store a reference to the loadedModel
            loadedModel.traverse((child) => {
                child.userData.parentModel = loadedModel;
            });

            // If the model has animations, create an AnimationMixer and store it
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(loadedModel);
                const actions = gltf.animations.map((clip) => mixer.clipAction(clip));
                actions[0].play(); // Play the first animation by default
                
                loadedModel.userData.mixer = mixer; // Store the mixer in the model's userData
                loadedModel.userData.actions = actions; // Store the actions for switching animations
                loadedModel.userData.currentAction = actions[0]; // Track the current animation
                
                mixers.push(mixer);
            }
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error occurred while loading the model', error);
        }
    );
});

// Mousemove Event Listener
window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Handle Window Resize
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to lerp between animations
function switchAnimation(intersectedObject, newAction) {
    const mixer = intersectedObject.userData.mixer;
    const currentAction = intersectedObject.userData.currentAction;

    if (currentAction !== newAction) {
        currentAction.crossFadeTo(newAction, 0.5, true); // Smooth transition between animations
        newAction.play();
        intersectedObject.userData.currentAction = newAction; // Update the current action
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update all mixers for animations
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));

    controls.update();

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the raycaster
    const intersects = raycaster.intersectObjects(loadedModels, true);

    if (intersects.length > 0) {
        // Get the original loaded model via userData reference
        let intersectedObject = intersects[0].object.userData.parentModel;
        
        if (previousHover !== intersectedObject) {
            // Switch back to the default animation for the previous model if we hover over a new model
            if (previousHover && previousHover.userData.mixer) {
                switchAnimation(previousHover, previousHover.userData.actions[0]);
            }

            // Change to a different animation for the currently hovered model
            if (intersectedObject.userData && intersectedObject.userData.mixer) {
                const nextActionIndex = (intersectedObject.userData.actions.indexOf(intersectedObject.userData.currentAction) + 1) % intersectedObject.userData.actions.length;
                switchAnimation(intersectedObject, intersectedObject.userData.actions[nextActionIndex]);
            }

            previousHover = intersectedObject;
            
            // Print the name of the hovered model to the console
            console.log(`Hovered over model: ${intersectedObject.name}`);
        }
    } else {
        // If no objects are hovered, resume the previous model's default animation
        if (previousHover && previousHover.userData.mixer) {
            switchAnimation(previousHover, previousHover.userData.actions[0]);
            previousHover = null; // Clear previous hover
        }
    }
    
    renderer.render(scene, camera);
}

const clock = new THREE.Clock(); // Clock for keeping track of time in the animation
animate();