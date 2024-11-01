import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadModels } from './models.js';
import { setupEnvironment } from './environment.js';

let camera, scene, renderer;

init();
animate();

function init() {
    // Initialize the scene
    scene = new THREE.Scene();

    // Initialize the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Initialize the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Enable shadow map for renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add Axis Helper
    const axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);

    // Load models
    loadModels(scene);

    // Set up environment (sky, lighting) with renderer passed as a parameter
    setupEnvironment(scene, renderer);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Set camera position and orientation
    camera.position.set(25, 10, 15);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
