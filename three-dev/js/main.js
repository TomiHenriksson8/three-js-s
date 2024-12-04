import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { loadModels } from "./models.js";
import { setupEnvironment } from "./environment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let camera, scene, renderer;
let controller1, controller2, controllerGrip1, controllerGrip2;
let raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
let group = new THREE.Group();
group.name = "Interaction-Group";
let teleportgroup = new THREE.Group();
teleportgroup.name = "Teleport-Group";
const loader = new GLTFLoader();
let marker, baseReferenceSpace, INTERSECTION;

init();
animate();

function init() {
    // Initialize the scene
    scene = new THREE.Scene();

    // Initialize the camera
    camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );

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
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    );
    marker.visible = false; // Hidden by default
    scene.add(marker);

    // Debugging: Traverse scene to identify unexpected objects
    scene.traverse((child) => {
        console.log("Scene object:", child.name || child.type);
    });
}

function initVR() {
    const loader = new GLTFLoader();

    // Load the custom controller model once
    loader.load(
        "assets/models/catT.glb",
        (gltf) => {
            const customController = gltf.scene;
            if (!customController) {
                console.error("Custom controller model is undefined.");
                return;
            }

            // Add custom controller to both grips
            controllerGrip1.add(customController.clone());
            controllerGrip2.add(customController.clone());
        },
        undefined,
        (error) => {
            console.error("Error loading custom controller model:", error);
        },
    );

    // Initialize Controller 1
    controller1 = renderer.xr.getController(0);
    controller1.addEventListener("connected", (event) => {
        console.log("Controller 1 connected:", event.data);
    });
    controller1.addEventListener("squeezestart", onSqueezeStart);
    controller1.addEventListener("squeezeend", onSqueezeEnd);
    scene.add(controller1);

    // Add Controller Grip 1
    controllerGrip1 = renderer.xr.getControllerGrip(0);
    scene.add(controllerGrip1);

    // Initialize Controller 2
    controller2 = renderer.xr.getController(1);
    controller2.addEventListener("connected", (event) => {
        console.log("Controller 2 connected:", event.data);
    });
    controller2.addEventListener("squeezestart", onSqueezeStart);
    controller2.addEventListener("squeezeend", onSqueezeEnd);
    scene.add(controller2);

    // Add Controller Grip 2
    controllerGrip2 = renderer.xr.getControllerGrip(1);
    scene.add(controllerGrip2);
}

function onSqueezeStart(event) {
    const controller = event.target;
    controller.userData.isSqueezing = true;
    console.log("Squeeze start");

    const intersects = raycaster.intersectObjects(group.children, true);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        controller.attact(object);
        controller.userData.grabbedObject = object;
    }
}

function onSqueezeEnd(event) {
    const controller = event.target;
    controller.userData.isSqueezing = false;

    if (controller.userData.grabbedObject) {
        scene.attach(controller.userData.grabbedObject);
        controller.userData.grabbedObject = null;
    }
}

function moveMarker() {
    INTERSECTION = undefined;

    if (controller1.userData.isSqueezing) {
        // Handle raycasting for controller1
        tempMatrix.identity().extractRotation(controller1.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    } else if (controller2.userData.isSqueezing) {
        // Handle raycasting for controller2
        tempMatrix.identity().extractRotation(controller2.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    } else {
        // Hide marker if no controller is active
        marker.visible = false;
        return;
    }

    // Check for intersections with teleportable objects
    const intersects = raycaster.intersectObjects(teleportgroup.children, true);

    if (intersects.length > 0) {
        INTERSECTION = intersects[0].point;
        marker.position.copy(INTERSECTION);
        marker.visible = true;
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
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
