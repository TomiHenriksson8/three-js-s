import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export function setupEnvironment(scene, renderer) {
    // Create the Sky
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const sun = new THREE.Vector3();

    // Adjust Sky Settings
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 8;
    skyUniforms['rayleigh'].value = 1.2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.7;

    // Set Sun Position
    const phi = THREE.MathUtils.degToRad(70);
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms['sunPosition'].value.copy(sun);

    // Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.7);
    scene.add(ambientLight);

    // Add a Directional Light to Simulate Sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(sun.x, sun.y, sun.z).normalize();
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;

    scene.add(directionalLight);

    // Enable Shadows in Renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
