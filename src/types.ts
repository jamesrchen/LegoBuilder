import * as BABYLON from 'babylonjs';
import { Vector3 } from 'babylonjs/Maths/math.vector';
import { Mesh } from 'babylonjs/Meshes/mesh';

// https://github.com/POSTECH-CVLab/Combinatorial-3D-Shape-Generation/blob/main/src_dataset/dataset_line.py
// https://github.com/POSTECH-CVLab/Geometric-Primitives
// https://github.com/POSTECH-CVLab/Geometric-Primitives/blob/main/geometric_primitives/brick.py
export class Brick {
    scene: BABYLON.Scene;

    #color: BABYLON.Color3;
    #permanent: boolean;
    #position: Vector3;
    #rotated: boolean = false;

    vertCollisionMesh: BABYLON.Mesh;
    collisionMesh: BABYLON.Mesh;
    meshes: BABYLON.Mesh[];
    meshesOrigin: BABYLON.Vector3[];


    constructor(scene: BABYLON.Scene, position: BABYLON.Vector3, color: BABYLON.Color3, permanent: boolean) {
        this.scene = scene;

        this.#color = color;
        this.#permanent = permanent;
        this.#position = position;
        this.meshes = [];
        this.meshesOrigin = [];

        // Invisable Colliders
        this.collisionMesh = BABYLON.MeshBuilder.CreateBox("box", {
            height: 0.9,
            width: 1.9,
            depth: 0.9,
        }, scene);

        this.collisionMesh.position = position;
        this.collisionMesh.isPickable = false;
        this.collisionMesh.material = new BABYLON.StandardMaterial("material", scene);
        this.collisionMesh.material.alpha = 0;
        
        this.vertCollisionMesh = BABYLON.MeshBuilder.CreateBox("box", {
            height: 1.1,
            width: 1.9,
            depth: 0.9,
        }, scene);

        this.vertCollisionMesh.position = position;
        this.vertCollisionMesh.isPickable = false;
        this.vertCollisionMesh.material = new BABYLON.StandardMaterial("material", scene);
        this.vertCollisionMesh.material.alpha = 0;

        // Main Brick
        this.meshes.push(BABYLON.MeshBuilder.CreateBox("box", {
            height: 1, // 0.82,
            width: 2,
            faceColors: Array(6).fill(color),
        }, scene))

        // for (let i = 0; i < 4; i++) {
        //     let mesh = BABYLON.MeshBuilder.CreateCylinder("stud", {
        //         height: 0.18,
        //         diameter: 0.2,
        //     })
        //     mesh.position = new BABYLON.Vector3(0, 0.41, 0);
        //     this.meshes.push(mesh);
        // }


        for (const mesh of this.meshes) {
            mesh.isPickable = permanent;
            this.meshesOrigin.push(mesh.position);
            mesh.position = mesh.position.add(position);

            let material = new BABYLON.StandardMaterial("material", scene)
            material.diffuseColor = color;
            material.alpha = permanent ? 1 : 0.5;
            mesh.material = material;
        }
    }

    #rotate() {
        for (const mesh of this.meshes) {
            mesh.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
            this.collisionMesh.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
            this.vertCollisionMesh.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
        }
    }

    destroy() {
        for (const mesh of this.meshes) {
            mesh.dispose();
        }
        this.vertCollisionMesh.dispose();
        this.collisionMesh.dispose();
    }

    set rotated(rotated: boolean) {
        if(rotated != this.#rotated) {
            this.#rotate();
            this.#rotated = rotated;
        }
    }

    get rotated() {
        return this.#rotated;
    }

    set color(color: BABYLON.Color3) {
        for (const mesh of this.meshes) {
            for (const mesh of this.meshes) {
                let material = new BABYLON.StandardMaterial("material", this.scene)
                material.diffuseColor = color;
                material.alpha = this.#permanent ? 1 : 0.5;
                mesh.material = material;
            }
        }
    }
    get color() {
        return this.#color;
    }

    set permanent(permanent: boolean) {
        this.#permanent = permanent;
        for (const mesh of this.meshes) {
            mesh.isPickable = permanent;
            let material = new BABYLON.StandardMaterial("material", this.scene)
            material.diffuseColor = this.#color;
            material.alpha = permanent ? 1 : 0.5;
            mesh.material = material;
        }
    }
    get permanent() {
        return this.#permanent;
    }

    set position(position: BABYLON.Vector3) {
        this.#position = position;
        for (const [index, mesh] of this.meshes.entries()) {
            mesh.position = this.meshesOrigin[index].add(position);
        }
        this.collisionMesh.position = position;
        this.vertCollisionMesh.position = position;
    }
    get position() {
        return this.#position;
    }


}