import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export function loadModels(scene) {
    const loader = new GLTFLoader();

    // Load Farm Model (as the base)
    loader.load('assets/models/farm.glb', (gltf) => {
        const farm = gltf.scene;
        farm.scale.set(1, 1, 1); // Adjust scale if necessary
        farm.position.set(0, 0, 0); // Base position
        scene.add(farm);

        // Load Cat Model (place on top of the farm)
        loader.load('assets/models/catT.glb', (gltf) => {
            const cat = gltf.scene;
            cat.scale.set(0.5, 0.5, 0.5); // Adjust scale to fit the farm
            cat.position.set(-24, 0.5, 4); // Position on top of the farm
            cat.scale.set(0.3, 0.3, 0.3)
            farm.add(cat); // Attach the cat to the farm
        });

        // Load Barrel Model (place within the farm)
        loader.load('assets/models/tynnyri.glb', (gltf) => {
            const barrel = gltf.scene;
            barrel.scale.set(1, 1, 1); // Adjust scale to fit the farm
            barrel.position.set(-10, 0.5, -1); // Position within the farm
            farm.add(barrel); // Attach the barrel to the farm
        });


        loader.load('assets/models/shoe.glb', (gltf) => {
            const shoe = gltf.scene;
            shoe.scale.set(0.75, 0.75, 0.75); // Adjust scale to fit the farm
            shoe.position.set(-10, 0.8, -1); // Position within the farm
            farm.add(shoe); // Attach the shoe to the farm
        });
    });
}
