import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export function invisiblePlanetoTestTeleportL(position, size, teleportgroup) {
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size[0], size[1]),
        new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            visible: false,
        }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(...position);
    teleportgroup.add(plane);
    console.log("added plane to teleportgroup", plane);
}

export function loadModels(scene, group, teleportgroup, onModelsLoaded) {
    const loader = new GLTFLoader();
    let modelsToLoad = 4;
    let modelsLoaded = 0;

    // Helper function to load models
    function loadModel(path, scale, position, addToTeleportGroup = false) {
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(...scale);
                model.position.set(...position);

                // Enable shadows for model
                model.castShadow = true;
                model.receiveShadow = true;

                // Add to appropriate groups
                if (addToTeleportGroup) {
                    teleportgroup.add(model);
                    console.log("added model to teleportgroup", model);
                }

                // console.log(teleportgroup, "from models.js");
                group.add(model);

                modelsLoaded++;
                if (modelsLoaded === modelsToLoad && onModelsLoaded) {
                    onModelsLoaded();
                }
            },
            undefined,
            (error) => console.error(`Error loading model (${path}):`, error),
        );
    }

    // Load individual models
    loadModel("assets/models/farm.glb", [1, 1, 1], [0, 0, 0], true);
    loadModel("assets/models/catT.glb", [0.3, 0.3, 0.3], [-24, 0.5, 4], true);
    loadModel("assets/models/tynnyri.glb", [1, 1, 1], [-10, 0.5, -1], true);
    loadModel("assets/models/shoe.glb", [0.75, 0.75, 0.75], [-10, 0.8, -1], true);
}
