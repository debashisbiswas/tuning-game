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

const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);
const analyser = new THREE.AudioAnalyser(audio, 2048);
camera.add(listener);

function handleSuccess(stream: MediaStream) {
    const context = listener.context;
    const source = context.createMediaStreamSource(stream);
    audio.setMediaStreamSource(source.mediaStream);
    source.connect(analyser.analyser);
    console.log('Audio successfully attached!');
}

navigator.mediaDevices.getUserMedia({
    audio: {
        autoGainControl: false,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
    } as MediaTrackConstraints,
})
    .then(handleSuccess)
    .catch(console.error);

const findFundamentalFreq = (buf: Float32Array, sampleRate: number): number =>
{
    // Implements the ACF2+ algorithm
    let SIZE = buf.length;
    let rms = 0;

    for (let i = 0;i < SIZE;i++) {
        const val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) // not enough signal
        return -1;

    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    const c = Float32Array.from(new Array(SIZE).fill(0));
    for (let i = 0; i < SIZE; i++)
        for (let j = 0; j < SIZE - i; j++)
            c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;

    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;

    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
};

const getScoreElement = (): HTMLElement | null => {
    return document.getElementById('center-ui');
};

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const player = new Player();
const objects: Array<THREE.Mesh> = [];
const ui = getScoreElement();

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

const updateUI = (score: string) => {
    if (!ui) {
        console.error('Score element does not exist!');
        return;
    }
    ui.innerHTML = score;
};

const noteStrings = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

function noteFromPitch(frequency: number) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note: number) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency: number, note: number) {
    return Math.floor(
        1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2)
    );
}

const animation = (time: number) => {
    renderer.render(scene, camera);
    TWEEN.update(time);
    player.applyMovement();
    checkCollisions();

    const buffer = new Float32Array(analyser.analyser.fftSize);
    analyser.analyser.getFloatTimeDomainData(buffer);
    const fundamentalFreq = findFundamentalFreq(
        buffer, audio.context.sampleRate
    );
    const noteNumber: number = noteFromPitch(fundamentalFreq);
    const note: string = noteStrings[noteNumber % 12];
    if (note) {
        updateUI(`${note}, ${centsOffFromPitch(fundamentalFreq, noteNumber)}`);
    }
    else {
        updateUI('');
    }
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
