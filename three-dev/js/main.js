import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let container, camera, scene, renderer, cube;

init()

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animate );
	document.body.appendChild( renderer.domElement );

	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshPhongMaterial(
		{ color: 0x00ff00 }
	);
	cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	
	camera.position.set(2,2,2);
	
	const axesHelper = new THREE.AxesHelper( 5 );
	scene.add( axesHelper );
	camera.lookAt(new THREE.Vector3(0,0,0));

	const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	scene.add( directionalLight );

	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	const controls = new OrbitControls( camera, renderer.domElement );
	controls.update();
}



function animate() {

	cube.rotation.x += 0.10;
	cube.rotation.y += 0.10;

	renderer.render( scene, camera );

}

window.addEventListener( 'resize', resize, false);


function resize(){
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize( window.innerWidth, window.innerHeight );
}
