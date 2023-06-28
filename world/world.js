
import { inputs } from 'inputs';
import * as THREE from 'three';


// Constants
const GRAVITY = .981; // m/s^2
const AIR_DENSITY = 1.225; // kg/m^3
const AIR_VISCOSITY = 1.7894e-5; // kg/(m*s)
let windSpeed = {
    x: 0,
    z: 0,
}
let windDirection = 0;


class World {
    constructor(clock){
        this.objects = [];
        this.time = 0;
        this.frameTime = 0;
        this.frameCount = 0;
        this.frameRate = 0;
        this.frameRateInterval = 1000;
        this.lastFrameRateTime = 0;
        this.frameRateCount = 0;
        this.clock = clock;

        this.planets = [];
        this.orbitals = [];
    }
    addObject(object){
        this.objects.push(object);
    }
    update(){
        this.frameCount++;
        this.time = this.clock.getElapsedTime();
        this.frameTime = this.time - this.lastFrameTime;
        this.lastFrameTime = this.time;

        for(let i = 0; i < this.objects.length; i++){
            let frameTime = this.frameTime;
            if(!frameTime){
                frameTime = 0;
            }
            this.objects[i].update(frameTime *10, this.planets, this.orbitals);
        }

        windDirection += .001;
        windSpeed.x = Math.sin(windDirection) * .01;
        windSpeed.z = Math.cos(windDirection) * .01;

    }
}

class Topography{
    constructor(params){
        this.position = params.position;
        this.rotation = params.rotation;
    }
    updatePosition(position){
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
    updateRotation(rotation){
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
    }
}

class MovingObject extends Topography{
    constructor(params){
        super(
            {                
                position: params.position,
                rotation: params.rotation
            }
        );

        this.restitution = 0.1;

        this.velocity = params.velocity;
        this.acceleration = params.acceleration;

        this.angularVelocity = params.angularVelocity;
        this.angularAcceleration = params.angularAcceleration;
    }
    updatePosition(frameTime){
        this.position.x += this.velocity.x * frameTime;
        this.position.y += this.velocity.y * frameTime;
        this.position.z += this.velocity.z * frameTime;
    }
    updateVelocity(frameTime){
        this.velocity.x += this.acceleration.x * frameTime + windSpeed.x;
        this.velocity.y += this.acceleration.y * frameTime;
        this.velocity.z += this.acceleration.z * frameTime + windSpeed.z;
    }
    updateRotation(frameTime){
        this.rotation.x += this.angularVelocity.x * frameTime;
        this.rotation.y += this.angularVelocity.y * frameTime;
        this.rotation.z += this.angularVelocity.z * frameTime;
    }
    updateAngularVelocity(frameTime){
        this.angularVelocity.x += (this.angularAcceleration.x) * frameTime ;
        this.angularVelocity.y += (this.angularAcceleration.y) * frameTime ;
        this.angularVelocity.z += (this.angularAcceleration.z) * frameTime ;

    }   
    updateAcceleration(frameTime){
        // this.acceleration.x = 0 ;
        // this.acceleration.y = 0;
        // this.acceleration.y = -GRAVITY * frameTime; 
        
    }
}

const initialLength = 1
const initialAngle = -Math.PI / 2;
const initialX = 0;
const initialY = 0;
const angleVariation = Math.PI / 6;
const lengthReductionFactor = 1;
const recursionLimit = 2;

// Function to draw a line segment

let recurseSnowflake = [];
// Recursive function to generate the snowflake
 function generateSnowflake(x, y, length, angle, depth, snowflake) {
  if (depth > recursionLimit) {
    return snowflake;
  }

  const x2 = x + length * Math.cos(angle);
  const y2 = y + length * Math.sin(angle);

  snowflake.push([x, y, x2, y2])

  const nextLength = length * lengthReductionFactor;
  const randomAngle = angle + (Math.random() * 2 - 1) * angleVariation;

  generateSnowflake(x2, y2, nextLength, randomAngle + Math.PI / 3, depth + 1, snowflake);
  generateSnowflake(x2, y2, nextLength, randomAngle - Math.PI / 3, depth + 1, snowflake);
}


let baseCylinder = new THREE.CylinderGeometry(.1, .1, 1, 32);
let snowMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true, opacity: .5});

let baseSphere = new THREE.SphereGeometry(.1, 32, 32);

class Orbital extends MovingObject{
    constructor(params){
        super(
            {
                position: params.position,
                rotation: params.rotation,
                velocity: params.velocity,
                acceleration: params.acceleration,
                angularVelocity: params.angularVelocity,
                angularAcceleration: params.angularAcceleration
            }
        );
        this.mesh = params.mesh;
        this.planets = params.planets;
        this.generateMesh();
    }

    generateMesh(){
        this.mesh = new THREE.Group();

        // this.mesh = new THREE.Mesh(
        //     new THREE.SphereGeometry(1, 32, 32),
        //     new THREE.MeshPhongMaterial({color: 0xffffff})
        // );
        const recurseSnowflake = [];
        generateSnowflake(initialX, initialY, initialLength, initialAngle, 0, recurseSnowflake);


        let quadrant = new THREE.Group();

        for(let item of recurseSnowflake){
            let distance = Math.sqrt(Math.pow(item[2] - item[0], 2) + Math.pow(item[3] - item[1], 2));

            const sphere = new THREE.Mesh(
                baseSphere,
                snowMaterial
            );
            sphere.position.x = item[0];
            sphere.position.y = item[1];
            sphere.position.z =  0;



            sphere.scale.x = distance * 5;
            sphere.scale.y = distance * 5;
            sphere.scale.z = distance * 5;

            // cylinder.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.atan2(item[3] - item[1], item[2] - item[0]));
            quadrant.add(sphere);
        }

        for(let i = 0; i < 4; i++){
            let newQuadrant = quadrant.clone();
            newQuadrant.rotateOnAxis(new THREE.Vector3(0, 0, 1), i * Math.PI / 2);
            this.mesh.add(newQuadrant);
        }

        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    
    updateMesh(){
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;

        this.mesh.rotation.x = this.rotation.x;
        this.mesh.rotation.y = this.rotation.y;
        this.mesh.rotation.z = this.rotation.z;
    }
    calculateAcceleration(planets){
        let acceleration = new THREE.Vector3(0, 0, 0);
        for(let i = 0; i < planets.length; i++){
            let planet = planets[i];
            let distance = this.position.distanceToSquared(planet.position);
            let force = GRAVITY * planet.mass / distance;
            let direction = new THREE.Vector3();

            direction.subVectors(planet.position, this.position);
            direction.normalize();

            let accelerationVector = new THREE.Vector3();
            accelerationVector.copy(direction);
            accelerationVector.multiplyScalar(force);
            acceleration.add(accelerationVector);
            acceleration.y -= GRAVITY;
            if(Math.abs(acceleration.y) > .5){
                acceleration.y = (Math.abs(acceleration.y) / acceleration.y )* .5;
            }
            if(Math.abs(acceleration.x) > 1){
                acceleration.x = Math.abs(acceleration.x) / acceleration.x;
            }
            if(Math.abs(acceleration.z) > 1){
                acceleration.z = Math.abs(acceleration.z) / acceleration.z;
            }
        }
        return acceleration;
    }
    calculateRotation(){
        let rotation = new THREE.Vector3(0, 0, 0);
        let angleOfAttack = new THREE.Vector3(0, 0, 0);
        angleOfAttack = {
            x: Math.atan2(this.velocity.y, this.velocity.z) - Math.PI / 2,
            y: Math.atan2(this.velocity.x, this.velocity.z),
            z: Math.atan2(this.velocity.y, this.velocity.x),
        }
        if(this.rotation.x > angleOfAttack.x){
            this.angularAcceleration.x = -.1;
        }
        else if(this.rotation.x < angleOfAttack.x){
            this.angularAcceleration.x = .1;
        }
        else{
            this.angularAcceleration.x = 0;
        }
        if(this.rotation.y > angleOfAttack.y){
            this.angularAcceleration.y = -.1;
        }
        else if(this.rotation.y < angleOfAttack.y){
            this.angularAcceleration.y = .1;
        }
        else{
            this.angularAcceleration.y = 0;
        }
        if(this.rotation.z > angleOfAttack.z){
            this.angularAcceleration.z = -.1;
        }
        else if(this.rotation.z < angleOfAttack.z){
            this.angularAcceleration.z = .1;
        }
        else{
            this.angularAcceleration.z = 0;
        }
    }

    update(frameTime, planets, orbitals){       
        if(this.position.y < -1000 || this.position.y > 1000 || this.position.x < -1000 || this.position.x > 1000 || this.position.z < -1000 || this.position.z > 1000){
            this.position.y = 1000;
            this.position.x = Math.random() * 1000 - 1000;
            this.position.z = Math.random() * 1000 - 1000;


            this.acceleration.y = 0;
            this.acceleration.x = 0;
            this.acceleration.z = 0;
            
            this.velocity.y = 0;
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
        

        this.updatePosition(frameTime);
        this.updateRotation(frameTime);
        this.updateVelocity(frameTime);
        if(this.velocity.y < -5){
            this.velocity.y = -5;
        }

        this.updateAngularVelocity(frameTime);
        this.calculateRotation();
        this.updateMesh();
        this.acceleration = this.calculateAcceleration(planets);
    }

    delete(){
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }

}


class Planet extends Topography{
    constructor(params){
        super(
            {
                position: {
                    x: Math.sin(params.orbitalPeriod) * params.orbitalRadius,
                    y: 0,
                    z: Math.cos(params.orbitalPeriod) * params.orbitalRadius
                },
                rotation: params.rotation
            }
        );
        this.radius = params.radius;
        this.mass = params.mass;
        this.orbitalRadius = params.orbitalRadius;
        this.orbitalPeriod = params.orbitalPeriod;
        this.orbitalRotation = params.orbitalRotation;
        // this.position = Math.sin(this.orbitalPeriod) * this.orbitalRadius;


        this.generateMesh();
    }
    generateMesh(){
        let geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        let material = new THREE.MeshBasicMaterial({color: 0xffff00});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = this.position.x;
        mesh.position.y = this.position.y;
        mesh.position.z = this.position.z;
        mesh.visible = false;
        this.mesh = mesh;
    }
    updateMesh(){
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;

        this.mesh.rotation.x = this.rotation.x;
        this.mesh.rotation.y = this.rotation.y;
        this.mesh.rotation.z = this.rotation.z;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    update(frameTime){
        this.orbitalRotation += this.orbitalPeriod * frameTime / 1000;
        this.position.x = Math.sin(this.orbitalRotation) * this.orbitalRadius;
        this.position.z = Math.cos(this.orbitalRotation) * this.orbitalRadius
        this.updateMesh();
    }
}




export {World, Topography, MovingObject, Planet, Orbital };
