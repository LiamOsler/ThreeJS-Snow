import { inputs } from 'inputs';

import { World,  Planet, Orbital} from 'world';

import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

const clock = new THREE.Clock();
clock.start();

let world = new World( clock );

const threeArea = document.getElementById('three-area');
const guiArea = document.getElementById('gui-area');

const renderer = new THREE.WebGLRenderer( );
renderer.setSize( window.innerWidth, window.innerHeight );
threeArea.appendChild( renderer.domElement );

const scene = new THREE.Scene( );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000 );
camera.lookAt( 0, 0, 0);

camera.position.set( 500, 50, 250 );


const controls = new OrbitControls( camera, renderer.domElement );


controls.update();


let sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );
let meshNormalMaterial = new THREE.MeshNormalMaterial( );


// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry( 10000, 10000, 100, 100 ), meshNormalMaterial);
//     plane.rotation.x = - Math.PI / 2;
//     plane.position.z = -1
//     scene.add( plane );

scene.background = new THREE.Color( 0xaaaaaa );


let fog = new THREE.Fog( 0xaaaaaa, 0, 2000 );
scene.fog = fog;


function init(){
    scene.remove.apply(scene, scene.children);


    const light = new THREE.DirectionalLight( 0xffffff, .1 );
    light.position.set( 100, 100, 100 );
    scene.add( light );


    const ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
    scene.add( ambientLight );

    world = new World( clock );
    world.objects = [];

    let planet = new Planet({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Vector3(0, 0, 0),
        radius: 100,
        mass: 200000,
        orbitalRadius: 250,
        orbitalPeriod: 500,
        orbitalRotation: 0,
    });

    world.addObject(planet);
    world.planets.push(planet);

    let planet2 = new Planet({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Vector3(0, 0, 0),
        radius: 500,
        mass: 1000000,
        orbitalRadius: 1000,
        orbitalPeriod: 500,
        orbitalRotation: 10,
    });

    world.addObject(planet2);
    world.planets.push(planet2);


    // let planet2 = new Planet({
    //     position: new THREE.Vector3(0, 0, 0),
    //     rotation: new THREE.Vector3(0, 0, 0),
    //     radius: 100,
    //     mass: 10000,
    //     orbitalRadius: 1200,
    //     orbitalPeriod: 10
    // });

    
    // world.addObject(planet2);
    // world.planets.push(planet2);




    //Generate a 3D grid of moving spheres
    for(let i = 2; i < 10; i++){
        for(let j = 2; j < 10; j++){
            for(let k = 2; k < 10; k++){
                    let sphere = new THREE.Mesh(sphereGeometry, meshNormalMaterial);
                    let orbital = new Orbital({
                        position: new THREE.Vector3(i * 100 + Math.random() * 100, j * 100 + Math.random() * 100, k * 100 + Math.random() * 100),
                        rotation: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
                        velocity: new THREE.Vector3((Math.random()-.5)*10, (Math.random()-.5)*10,(Math.random()-.5)*10),
                        acceleration: new THREE.Vector3(0, 0, 0),
                        angularVelocity: new THREE.Vector3(0, 0, 0),
                        angularAcceleration: new THREE.Vector3(0, 0, 0),
                        mass: 100,
                        radius: .1,
                        restitution: 0.8,
                        friction: 0.1,
                    });
                    orbital.updateMesh();
                    world.addObject(orbital);
                    world.orbitals.push(orbital);
            }
        }   
    }


    for(let i = 0; i < world.objects.length; i++){
        world.objects[i].addToScene(scene);
    }
}

init();

document.getElementById('start-button').addEventListener('click', function(){
    init();
});



function animate( ) {
    // console.log(arrow)


    world.update();


	requestAnimationFrame( animate );


    controls.update( );

	renderer.render( scene, camera );
}

animate();