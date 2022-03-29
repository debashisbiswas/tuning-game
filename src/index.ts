import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import Player from './player';

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const player = new Player();
const init = () => {
    camera.position.z = 1;
    scene.add(player.mesh);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);
}
init();

function animation(time: number) {
    renderer.render(scene, camera);
    TWEEN.update(time);
    player.applyMovement();
}

window.addEventListener('keypress', player.handleKeyEvent);
window.addEventListener('keyup', player.handleKeyEvent);
