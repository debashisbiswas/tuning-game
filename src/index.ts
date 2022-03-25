import * as THREE from 'three';

// init

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.CircleGeometry(0.1, 64);
const material = new THREE.MeshBasicMaterial({ color: 0xffbf00 });

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

function animation(time: number) {
    renderer.render(scene, camera);
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
    let speed = 0.05;
    switch (event.key) {
        case 'w':
            mesh.position.y += speed;
            break;
        case 'a':
            mesh.position.x -= speed;
            break;
        case 's':
            mesh.position.y -= speed;
            break;
        case 'd':
            mesh.position.x += speed;
            break;
    }
})
