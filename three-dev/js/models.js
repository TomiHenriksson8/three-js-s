import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export function loadModels(scene, group, teleportgroup) {
    const loader = new GLTFLoader();

    // Load Farm Model
    loader.load(
        'assets/models/farm.glb',
        (gltf) => {
            console.log('Farm model loaded:', gltf);
            const farm = gltf.scene;

            if (!farm) {
                console.error('Farm model is undefined. Ensure the file path is correct.');
                return;
            }

            try {
                farm.scale.set(1, 1, 1);
                farm.position.set(0, 0, 0);

                // Safely traverse the farm model
                farm.traverse((child) => {
                    if (child && child.isObject3D) {
                        console.log('Farm child:', child);

                        if (child.isMesh) {
                            child.castShadow = true; // Enable shadow casting
                            child.receiveShadow = true; // Enable shadow receiving
                        }
                    } else {
                        console.warn('Skipping invalid child during farm traversal:', child);
                    }
                });

                // Add the farm to the scene (but not the teleportgroup)
                group.add(farm);
                console.log('Farm model added to the scene.');
            } catch (error) {
                console.error('Error while traversing the farm model:', error);
            }
        },
        undefined,
        (error) => {
            console.error('Error loading farm model:', error);
        }
    );

    // Load other models (cat, barrel, shoe)...
    loader.load(
        'assets/models/catT.glb',
        (gltf) => {
            const cat = gltf.scene;
            cat.scale.set(0.3, 0.3, 0.3);
            cat.position.set(-24, 0.5, 4);
            teleportgroup.add(cat); // Add to teleportgroup
            group.add(cat);
        },
        undefined,
        (error) => console.error('Error loading cat model:', error)
    );

    loader.load(
        'assets/models/tynnyri.glb',
        (gltf) => {
            const barrel = gltf.scene;
            barrel.scale.set(1, 1, 1);
            barrel.position.set(-10, 0.5, -1);
            teleportgroup.add(barrel); // Add to teleportgroup
            group.add(barrel);
        },
        undefined,
        (error) => console.error('Error loading barrel model:', error)
    );

    loader.load(
        'assets/models/shoe.glb',
        (gltf) => {
            const shoe = gltf.scene;
            shoe.scale.set(0.75, 0.75, 0.75);
            shoe.position.set(-10, 0.8, -1);
            teleportgroup.add(shoe); // Add to teleportgroup
            group.add(shoe);
        },
        undefined,
        (error) => console.error('Error loading shoe model:', error)
    );
}
