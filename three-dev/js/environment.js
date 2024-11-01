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
    skyUniforms['turbidity'].value = 8;             // Softer haze
    skyUniforms['rayleigh'].value = 1.2;            // Adjusted for more atmospheric blue
    skyUniforms['mieCoefficient'].value = 0.005;    // Lower for less scattering
    skyUniforms['mieDirectionalG'].value = 0.7;     // Directional lighting effect

    // Set Sun Position
    const phi = THREE.MathUtils.degToRad(70);       // Lower sun angle for evening light
    const theta = THREE.MathUtils.degToRad(180);    // Set sun position
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms['sunPosition'].value.copy(sun);

    // Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.7); // Increased intensity
    scene.add(ambientLight);

    // Add a Directional Light to Simulate Sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Brighter directional light
    directionalLight.position.set(sun.x, sun.y, sun.z).normalize();
    directionalLight.castShadow = true; // Enable shadows
    directionalLight.shadow.mapSize.width = 2048; // Higher resolution for softer shadows
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;

    scene.add(directionalLight);

    // Enable Shadows in Renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
