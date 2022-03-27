import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// init

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.SphereGeometry(0.1);
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

let directions = {
    up: false,
    down: false,
    left: false,
    right: false
}

const speed = 0.1;
function animation(time: number) {
    renderer.render(scene, camera);
    TWEEN.update(time);

    if (directions.up || directions.down || directions.left || directions.right) {
        const old_pos = {
            x: mesh.position.x,
            y: mesh.position.y
        }
        let new_pos = { ...old_pos };

        if (directions.up) new_pos.y += speed;
        if (directions.down) new_pos.y -= speed;
        if (directions.left) new_pos.x -= speed;
        if (directions.right) new_pos.x += speed;

        new TWEEN.Tween(old_pos)
            .to(new_pos, 200)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                mesh.position.x = old_pos.x;
                mesh.position.y = old_pos.y;
            })
            .start()
    }
}

window.addEventListener('keyup', (event: KeyboardEvent) => {
    switch (event.key) {
        case 'w':
            directions.up = false
            break;
        case 'a':
            directions.left = false
            break;
        case 's':
            directions.down = false
            break;
        case 'd':
            directions.right = false
            break;
    }
})

window.addEventListener('keypress', (event: KeyboardEvent) => {
    switch (event.key) {
        case 'w':
            directions.up = true
            break;
        case 'a':
            directions.left = true
            break;
        case 's':
            directions.down = true
            break;
        case 'd':
            directions.right = true
            break;
    }
})
