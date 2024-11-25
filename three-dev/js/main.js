import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { loadModels } from './models.js';
import { setupEnvironment } from './environment.js';

let camera, scene, renderer;
let controller1, controller2, controllerGrip1, controllerGrip2;
let raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
let group = new THREE.Group();
group.name = 'Interaction-Group';
let teleportgroup = new THREE.Group();
teleportgroup.name = 'Teleport-Group';

let marker, baseReferenceSpace, INTERSECTION;

init();
animate();

function init() {
    // Initialize the scene
    scene = new THREE.Scene();

    // Initialize the camera
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Initialize the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Add the VR button to enter VR mode
    document.body.appendChild(VRButton.createButton(renderer));

    // Add directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(4096, 4096); // High-resolution shadows
    directionalLight.shadow.normalBias = 0.05; // Avoid shadow artifacts
    scene.add(directionalLight);

    // Load models
    loadModels(scene, group, teleportgroup);

    // Add groups to the scene
    scene.add(group);
    scene.add(teleportgroup);

    // Set up environment (sky, lighting)
    setupEnvironment(scene, renderer);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Set camera position and orientation
    camera.position.set(50, 30, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Initialize VR controllers
    initVR();

    // Add teleportation marker
    marker = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    marker.visible = false; // Hidden by default
    scene.add(marker);

    // Debugging: Traverse scene to identify unexpected objects
    scene.traverse((child) => {
        console.log('Scene object:', child.name || child.type);
    });
}

function initVR() {
    const controllerModelFactory = new XRControllerModelFactory();

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('connected', (event) => {
        console.log('Controller 1 connected:', event.data);
    });
    controller1.addEventListener('squeezestart', onSqueezeStart);
    controller1.addEventListener('squeezeend', onSqueezeEnd);
    scene.add(controller1);

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('connected', (event) => {
        console.log('Controller 2 connected:', event.data);
    });
    controller2.addEventListener('squeezestart', onSqueezeStart);
    controller2.addEventListener('squeezeend', onSqueezeEnd);
    scene.add(controller2);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);
}

function onSqueezeStart(event) {
    const controller = event.target;
    controller.userData.isSqueezing = true;
    console.log('Squeeze start');
}

function onSqueezeEnd(event) {
    const controller = event.target;
    controller.userData.isSqueezing = false;

    if (INTERSECTION) {
        console.log('Teleporting to:', INTERSECTION);
        const offsetPosition = {
            x: -INTERSECTION.x,
            y: -INTERSECTION.y,
            z: -INTERSECTION.z,
            w: 1
        };
        const offsetRotation = new THREE.Quaternion();
        const transform = new XRRigidTransform(offsetPosition, offsetRotation);
        const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);
        renderer.xr.setReferenceSpace(teleportSpaceOffset);
    } else {
        console.log('No valid teleport target');
    }
}

function moveMarker() {
    INTERSECTION = undefined;

    const activeController =
        controller1.userData.isSqueezing ? controller1 : controller2.userData.isSqueezing ? controller2 : null;

    if (activeController) {
        tempMatrix.identity().extractRotation(activeController.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(activeController.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects(teleportgroup.children, true);

        if (intersects.length > 0) {
            INTERSECTION = intersects[0].point;
            console.log('Intersection:', INTERSECTION);
            marker.position.copy(INTERSECTION);
            marker.visible = true;
        } else {
            marker.visible = false;
        }
    } else {
        marker.visible = false;
    }
}

function animate() {
    renderer.setAnimationLoop(() => {
        moveMarker();
        renderer.render(scene, camera);
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
