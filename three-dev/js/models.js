import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function loadModels(scene, group, teleportgroup) {
    const loader = new GLTFLoader();

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
                if (addToTeleportGroup) teleportgroup.add(model);
                group.add(model);
            },
            undefined,
            (error) => console.error(`Error loading model (${path}):`, error),
        );
    }

    // Load individual models
    loadModel("assets/models/farm.glb", [1, 1, 1], [0, 0, 0], true);
    loadModel("assets/models/catT.glb", [0.3, 0.3, 0.3], [-24, 0.5, 4], false);
    loadModel("assets/models/tynnyri.glb", [1, 1, 1], [-10, 0.5, -1], false);
    loadModel(
        "assets/models/shoe.glb",
        [0.75, 0.75, 0.75],
        [-10, 0.8, -1],
        false,
    );
}
