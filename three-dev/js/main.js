import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


let camera, scene, renderer;
let cube, sphere, cone, water;

init();
animate();

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animate );
	document.body.appendChild( renderer.domElement );

	// Add Axis Helper
	const axesHelper = new THREE.AxesHelper(20);
	scene.add(axesHelper);

	const islandGeometry = new THREE.CylinderGeometry( 5, 10, 2, 32 );
	const islandMaterial = new THREE.MeshStandardMaterial({
		color: 0xC2B280,
		roughness: 1,
	});
	const island = new THREE.Mesh( islandGeometry, islandMaterial );
	island.position.set(0, -0.5, 0);
	scene.add( island );

	const rockGeometry = new THREE.DodecahedronGeometry( 0.5 );
	const rockMaterial = new THREE.MeshStandardMaterial({
		color: 0x808080,
		roughness: 1,
	});
	for (let i = 0; i < 5; i++) {
		const rock = new THREE.Mesh( rockGeometry, rockMaterial );
		rock.position.set( Math.random() * 20 - 10, 0, Math.random() * 20 - 10 );
		scene.add( rock );
	}

	const loader = new GLTFLoader();
	loader.load('./scene.gltf', function(gltf) {
    const palmTree = gltf.scene;
    palmTree.position.set(-1, 4, 0);
    palmTree.scale.set(5, 5, 5);
    scene.add(palmTree);
  });

	const rockLikeMaterial = new THREE.MeshStandardMaterial({
		color: 0x696969,
		roughness: 1,
		metalness: 0,
	});

	const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	const sphereGeometry = new THREE.SphereGeometry( 0.5, 32, 32 );
	const coneGeometry = new THREE.ConeGeometry( 0.3, 0.8, 32 );


	cube = new THREE.Mesh( cubeGeometry, rockLikeMaterial );
	const cubeWireframe = new THREE.Mesh( cubeGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true }));


	sphere = new THREE.Mesh( sphereGeometry, rockLikeMaterial );
	const sphereWireframe = new THREE.Mesh( sphereGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true }));


	cone = new THREE.Mesh( coneGeometry, rockLikeMaterial );
	const coneWireframe = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true }));


	cube.position.set(0, 1, 0);
	cubeWireframe.position.set(0, 1, 0);
	sphere.position.set(0, 2, 0);
	sphereWireframe.position.set(0, 2, 0);
	cone.position.set(0, 2.5, 0);
	coneWireframe.position.set(0, 2.5, 0);

	scene.add( cube );
	scene.add( cubeWireframe );
	scene.add( sphere );
	scene.add( sphereWireframe );
	scene.add( cone );
	scene.add( coneWireframe );

	const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
	water = new Water(
		waterGeometry,
		{
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/waternormals.jpg', function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			}),
			alpha: 1.0,
			sunDirection: new THREE.Vector3().normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		}
	);
	water.rotation.x = - Math.PI / 2;
	scene.add( water );

	const sky = new Sky();
	sky.scale.setScalar(10000);
	scene.add(sky);

	const sun = new THREE.Vector3();

	const skyUniforms = sky.material.uniforms;
	skyUniforms['turbidity'].value = 10;
	skyUniforms['rayleigh'].value = 2;
	skyUniforms['mieCoefficient'].value = 0.005;
	skyUniforms['mieDirectionalG'].value = 0.7;

	const phi = THREE.MathUtils.degToRad(90 - 2);
	const theta = THREE.MathUtils.degToRad(180);
	sun.setFromSphericalCoords(1, phi, theta);
	sky.material.uniforms['sunPosition'].value.copy(sun);

	// lights
	const ambientLight = new THREE.AmbientLight( 0x888888 );
	scene.add( ambientLight );

	const pointLight = new THREE.PointLight( 0xffffff, 2, 100 );
	pointLight.position.set( 5, 5, 5 );
	scene.add( pointLight );

	// orbit controls
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.update();

	// background color
	scene.background = new THREE.Color(0x87CEEB);

	camera.position.set( 15, 10, 15 );
	camera.lookAt( new THREE.Vector3(0, 0, 0) );
}

function animate() {
	// Animate water
	water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

	renderer.render( scene, camera );
}

window.addEventListener( 'resize', resize, false );

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
