import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import dimensions from './dimensions';
import Player from './player';
import view from './view';

const camera = new THREE.OrthographicCamera(
    -view.width / 2,
    view.width / 2,
    view.height / 2,
    -view.height / 2,
);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const player = new Player();
const objects: Array<THREE.Mesh> = [];

const checkCollisions = () => {
    const circle = new THREE.Sphere();
    if (!player.geometry.boundingBox) {
        player.geometry.computeBoundingSphere();
    }

    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion --
     * The above condition generates the bounding sphere if it does
     * not exist, so the boundingSphere must exist here.
    **/
    circle.copy(player.geometry.boundingSphere!)
        .applyMatrix4(player.mesh.matrixWorld);

    const box = new THREE.Box3();
    for (const object of objects) {
        if (!object.geometry.boundingBox) {
            object.geometry.computeBoundingBox();
        }

        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion --
         * The above condition generates the bounding box if it does
         * not exist, so the boundingBox must exist here.
        **/
        box.copy(object.geometry.boundingBox!).applyMatrix4(object.matrixWorld);
        if (box.intersectsSphere(circle)) {
            console.log('Hit!');
        }
    }
};

const animation = (time: number) => {
    renderer.render(scene, camera);
    TWEEN.update(time);
    player.applyMovement();
    checkCollisions();
};

const init = () => {
    camera.position.z = 1;
    scene.add(player.mesh);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);
    player.geometry.computeBoundingSphere();
};
init();

window.addEventListener('keypress', player.handleKeyEvent);
window.addEventListener('keyup', player.handleKeyEvent);
window.addEventListener('resize', () => {
    view.updateSize(window.innerWidth, window.innerHeight);
    renderer.setSize(view.width, view.height);
    camera.left = -view.width / 2;
    camera.right = view.width / 2;
    camera.top = view.height / 2;
    camera.bottom = -view.height / 2;
    camera.updateProjectionMatrix();
});

// TODO: These intervals should not always be the same. When you update the
// intervals to be different times, make sure the tween duration stays constant
window.setInterval(() => {
    // Random number between 50 and -50
    const gap_center = view.yunit * (Math.floor(Math.random() * (101)) - 50);
    const gap_size = dimensions.player_size + (view.yunit * 20);
    const obstacle_width = 5 * view.xunit;

    const top_height = (100 * view.yunit) - (gap_center + gap_size);
    const bot_height = Math.abs((-100 * view.yunit) - (gap_center - gap_size));
    const top_object_mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obstacle_width, top_height),
        new THREE.MeshNormalMaterial()
    );
    const bot_object_mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obstacle_width, bot_height),
        new THREE.MeshNormalMaterial()
    );

    top_object_mesh.position.set(
        100 * view.xunit + obstacle_width,
        view.yunit * 100 - (top_height / 2),
        0
    );
    bot_object_mesh.position.set(
        100 * view.xunit + obstacle_width,
        view.yunit * -100 + (bot_height / 2),
        0
    );

    objects.push(top_object_mesh);
    objects.push(bot_object_mesh);
    scene.add(top_object_mesh);
    scene.add(bot_object_mesh);

    for (const object of objects) {
        const coords = {
            x: object.position.x,
            y: object.position.y
        };
        new TWEEN.Tween(coords)
            .to({
                x: object.position.x - (50 * view.xunit)
            })
            .duration(2500)
            .onUpdate(() => {
                object.position.x = coords.x;
                object.position.y = coords.y;
            })
            .start();
    }
}, 2500);
