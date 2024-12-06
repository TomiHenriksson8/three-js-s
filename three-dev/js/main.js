import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { invisiblePlanetoTestTeleportL, loadModels } from "./models.js";
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
let marker, INTERSECTION;

init();
animate();

invisiblePlanetoTestTeleportL([0, 0, 0], [100, 100], teleportgroup);

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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Add the VR button to enter VR mode
  document.body.appendChild(VRButton.createButton(renderer));

  // Load models and environment
  loadModels(scene, group, teleportgroup, () => {
    console.log(
      "all models loaded. teleport group is ready",
      teleportgroup,
      " and ",
      teleportgroup.children,
    );
  });
  setupEnvironment(scene, renderer);

  // Add groups to the scene
  scene.add(group);
  scene.add(teleportgroup);

  // Add camera controls
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

  // Debugging
  console.log("Scene initialized with objects:", scene);
}

function visualizeRayCaster() {
  const rayHelper = new THREE.ArrowHelper(
    raycaster.ray.direction,
    raycaster.ray.origin,
    10,
    0xff0000,
  );
  scene.add(rayHelper);
  console.log("ray origin", raycaster.ray.origin);
  console.log("ray direction", raycaster.ray.direction);
}

function initVR() {
  const loader = new GLTFLoader();

  // Initialize Controller 1
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("squeezestart", onSqueezeStart);
  controller1.addEventListener("squeezeend", onSqueezeEnd);

  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);

  loader.load("assets/models/ctrl.glb", function(gltf) {
    const controllerModel = gltf.scene;
    controllerModel.scale.set(0.002, 0.002, 0.002);
    controllerModel.rotation.z = Math.PI;

    controllerModel.rotation.x += THREE.MathUtils.degToRad(180);
    controller1.add(controllerModel);
  });

  scene.add(controller1);

  // Add Controller Grip 1
  controllerGrip1 = renderer.xr.getControllerGrip(0);
  scene.add(controllerGrip1);

  // Initialize Controller 2
  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("squeezestart", onSqueezeStart);
  controller2.addEventListener("squeezeend", onSqueezeEnd);

  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);

  loader.load("assets/models/ctrl.glb", function(gltf) {
    const controllerModel = gltf.scene;
    controllerModel.scale.set(0.002, 0.002, 0.002);
    controllerModel.rotation.z = Math.PI;

    controllerModel.rotation.x += THREE.MathUtils.degToRad(180);
    controller2.add(controllerModel);
  });

  scene.add(controller2);

  // Add Controller Grip 2
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  scene.add(controllerGrip2);
}

function onSelectStart(event) {
  const controller = event.target;
  console.log("select start", controller);
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  console.log("INTERSECTION", INTERSECTION);
  console.log("teleportable objects", teleportgroup.children);
  visualizeRayCaster();
  const intersects = raycaster.intersectObjects(teleportgroup.children, true);
  console.log("plane position: ", teleportgroup.children[0].position);
  console.log("plane rotation: ", teleportgroup.children[0].rotation);
  console.log("intersects", intersects);
  if (intersects.length > 0) {
    INTERSECTION = intersects[0].point;
    console.log("intersection point", intersects[0].point);
    marker.position.copy(INTERSECTION);
    marker.visible = true;
  } else {
    console.log("no intersection");
    marker.visible = false;
  }
}

function onSelectEnd(event) {
  const controller = event.target;
  console.log("select end triggered:", controller);

  if (INTERSECTION) {
    console.log("Intersection at select end:", INTERSECTION);

    const session = renderer.xr.getSession();
    if (session) {
      const xrReferenceSpace = renderer.xr.getReferenceSpace();
      console.log("Original XR Reference Space:", xrReferenceSpace);

      // Compute the new offset for teleportation
      const offsetTransform = new XRRigidTransform({
        x: INTERSECTION.x,
        y: INTERSECTION.y,
        z: INTERSECTION.z,
      });

      console.log("Offset Transform for teleportation:", offsetTransform);

      // Set the new reference space
      try {
        const offsetSpace =
          xrReferenceSpace.getOffsetReferenceSpace(offsetTransform);
        renderer.xr.setReferenceSpace(offsetSpace);
        console.log("New XR Reference Space set. Teleported to:", INTERSECTION);
      } catch (error) {
        console.error("Error applying teleportation offset:", error);
      }

      // Hide the marker
      marker.visible = false;
      INTERSECTION = null;
    } else {
      console.error("No active XR session found.");
    }
  } else {
    console.log("No valid intersection for teleportation.");
  }
}

function onSqueezeStart(event) {
  const controller = event.target;
  controller.userData.isSqueezing = true;

  console.log("squuze start", controller);

  const intersects = raycaster.intersectObjects(group.children, true);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    controller.attach(object);
    controller.userData.grabbedObject = object;
  }
}

function onSqueezeEnd(event) {
  const controller = event.target;
  controller.userData.isSqueezing = false;

  console.log("squuze end", controller);

  if (controller.userData.grabbedObject) {
    group.attach(controller.userData.grabbedObject);
    controller.userData.grabbedObject = null;
  }
}

function moveMarker() {
  let foundIntersection = false;

  // Determine raycaster origin and direction based on controller state
  if (controller1.userData.isSqueezing) {
    tempMatrix.identity().extractRotation(controller1.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  } else if (controller2.userData.isSqueezing) {
    tempMatrix.identity().extractRotation(controller2.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  } else {
    marker.visible = false;
    return;
  }

  // Check for intersection
  const intersects = raycaster.intersectObjects(teleportgroup.children, true);
  console.log("MoveMarker intersects:", intersects);

  if (intersects.length > 0) {
    INTERSECTION = intersects[0].point;
    marker.position.copy(INTERSECTION);
    marker.visible = true;
    foundIntersection = true;
    console.log("MoveMarker intersection point:", INTERSECTION);
  } else {
    console.log("MoveMarker no intersection");
    marker.visible = false;
  }

  // Reset INTERSECTION if no intersection was found
  if (!foundIntersection) {
    INTERSECTION = undefined;
  }
}

function animate() {
  renderer.setAnimationLoop(() => {
    moveMarker();
    renderer.render(scene, camera);

    // console.log("main camera position", camera.position);
    // console.log("xr camera position", renderer.xr.getCamera(camera).position);
  });
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

export { teleportgroup, scene, group };
