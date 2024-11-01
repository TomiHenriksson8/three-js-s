import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export function loadModels(scene) {
    // Load Photogrammetry Model (Shoe)
    const photogrammetryLoader = new GLTFLoader();
    photogrammetryLoader.load('assets/models/shoe.glb', (gltf) => {
        const photogrammetryModel = gltf.scene;
        photogrammetryModel.scale.set(2.5, 2.5, 2.5);
        photogrammetryModel.position.set(8.1, 7.05, 8);
        scene.add(photogrammetryModel);
    });

    // Load Barrel Model
    const barrelLoader = new GLTFLoader();
    barrelLoader.load('assets/models/tynnyri.glb', (gltf) => {
        const barrel = gltf.scene;
        barrel.scale.set(1.5, 1.5, 1.5);
        barrel.position.set(8, 6.7, 8.1);
        scene.add(barrel);
    });

    // Load External Model (Land)
    const externalModelLoader = new GLTFLoader();
    externalModelLoader.load('assets/models/minecraft_skyblock.glb', (gltf) => {
        const externalModel = gltf.scene;
        externalModel.scale.set(1, 1, 1);
        externalModel.position.set(3, 0, 3);
        scene.add(externalModel);
    });

    // Add Basic Primitives
    const material = new THREE.MeshStandardMaterial({ color: 0x808080 });

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    cube.position.set(4, 6.5, 5);
    scene.add(cube);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
    sphere.position.set(4, 7.4, 5);
    scene.add(sphere);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 32), material);
    cone.position.set(4, 8.1, 5);
    scene.add(cone);

    // Add WebGL Earth Model
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('assets/textures/world.png'), // Update to match dist path
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(-10, 15, 10);
    earth.scale.set(2, 2, 2);
    scene.add(earth);
}
