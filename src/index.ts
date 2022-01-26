import axios from 'axios';
import * as BABYLON from 'babylonjs';
import { Vector3 } from 'babylonjs/Maths/math.vector';
import { Brick } from './types';

import api from './api';


// Append canvas to body of document
const canvas = document.createElement('canvas');
canvas.id = "renderCanvas";
canvas.height = window.innerHeight-50;
canvas.width = window.innerWidth-50;

document.body.appendChild(canvas);

// Create engine
const engine = new BABYLON.Engine(canvas, true);

// Start scene
const scene = new BABYLON.Scene(engine);

// Setup
const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 2, 0), scene);
camera.attachControl(canvas, true);

// Light
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Floor
var plane = BABYLON.Mesh.CreatePlane("plane", 15, scene);
plane.checkCollisions = false;
plane.position.y = 0.5;
plane.rotation.x = Math.PI / 2;

// Post-Setup
let bricks: Brick[] = [];
let nextBrick: Brick;

// Brick to be controlled with pointer
nextBrick = new Brick(scene, new BABYLON.Vector3(0, 1, 0), randomColor3(), false);

scene.onPointerDown = (evt) => {
  if (evt.button == 0) {
    nextBrick.permanent = true;
    bricks.push(nextBrick);
    nextBrick = new Brick(scene, new BABYLON.Vector3(0, 1, 0), randomColor3(), false);
  }
}

document.addEventListener("keydown", (event) => {
  if(event.key == "r") {
    nextBrick.rotated = !nextBrick.rotated;
  }
  // Key to send data and wipe the slate
  if(event.key == "Enter") {
    console.log("Sending data, resetting scene");

    let cleanedBricks = bricks.map(b => {
      return {
        x: b.position.x,
        y: b.position.y,
        z: b.position.z,
        rotated: b.rotated,
      }
    })

    // Upload creation
    api.post("/api/upload", cleanedBricks).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    });

    bricks.forEach(brick => {
      brick.destroy();
    });
    bricks = [];
    nextBrick.destroy();
    nextBrick = new Brick(scene, new BABYLON.Vector3(0, 1, 0), randomColor3(), false);
  }
});

function updateNextBrickPosition() {
  let ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), null);
  let hit = scene.pickWithRay(ray);
  let pickedPoint = hit.pickedPoint;

  if (pickedPoint) {
    let newPos = lockToGrid(pickedPoint)

    if(checkAllBlockVertCollisions(nextBrick)) {
      newPos.y = nextBrick.position.y
    }

    nextBrick.position = newPos;

    if(checkAllBlockCollisions(nextBrick)) {
      nextBrick.position = nextBrick.position.add(new BABYLON.Vector3(0, 1, 0));
    }

    // console.log(pickedPoint);
  }

  function checkAllBlockCollisions(brick: Brick) {
    for (let i = 0; i < bricks.length; i++) {
      if (bricks[i].collisionMesh.intersectsMesh(brick.collisionMesh)) {
        return true;
      }
    }
    return false;
  }

  function checkAllBlockVertCollisions(brick: Brick) {
    for (let i = 0; i < bricks.length; i++) {
      if (bricks[i].vertCollisionMesh.intersectsMesh(brick.collisionMesh)) {
        return true;
      }
    }
    return false;
  }

  function lockToGrid(position: Vector3) {
    let x = Math.round(position.x / 0.5) * 0.5;
    let y = Math.ceil(position.y);
    let z = Math.round(position.z / 0.5) * 0.5;

    return new BABYLON.Vector3(x, y, z);
  }

}

// Run render loop
engine.runRenderLoop(function () {
  updateNextBrickPosition();
  scene.render();
});

// Random color generation
function randomColor3(): BABYLON.Color3 {
    return new BABYLON.Color3(
      Math.random(),
      Math.random(),
      Math.random()
    );
  }