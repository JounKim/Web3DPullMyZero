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

let hover = false;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 140);
controls.enablePan = false;
controls.enableRotate = false;
controls.maxDistance = 140;
controls.update();

// Models and Mixers
const loader = new GLTFLoader();
const models = [
    { path: 'models/Room2.gltf', position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { path: 'models/dancing.gltf', position: { x: -3, y: -9, z: 70 }, scale: { x: 8, y: 8, z: 8 } },
    { path: 'models/HipHopDance.gltf', position: { x: -3, y: -9, z: 110 }, scale: { x: 8, y: 8, z: 8 } },
    { path: 'models/RumbaDance.gltf', position: { x: -3, y: -9, z: 30 }, scale: { x: 8, y: 8, z: 8 } }
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
        hover = true;
        // let intersectedObject = intersects[0].object;
        // if (intersectedObject.userData.mixer) {
        //     intersectedObject.userData.mixer.timeScale = 0; // Pause the animation
        // }
    } else {
        hover = false;
        // // Reset animation speed when the mouse is not hovering over any object
        // loadedModels.forEach((model) => {
        //     if (model.userData.mixer) {
        //         model.userData.mixer.timeScale = 1; // Resume the animation
        //     }
        // });
    }

    if(hover){
        
        let intersectedObject = intersects[0].object;
        if (intersectedObject.userData.mixer) {
            intersectedObject.userData.mixer.timeScale = 0; // Pause the animation
            intersectedObject.material.color.set(0xffff00);
        }
    }
    if(!hover) {
        
        loadedModels.forEach((model) => {
            if (model.userData.mixer) {
                model.userData.mixer.timeScale = 1; // Resume the animation
                model.material.color.set(0xffffff);
            }
        });
    }

    renderer.render(scene, camera);
}

const clock = new THREE.Clock(); // Clock for keeping track of time in the animation
animate();