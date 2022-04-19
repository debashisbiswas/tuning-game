import { AudioListener, Audio, AudioAnalyser } from 'three';

export default class AudioManager {
    listener: AudioListener;
    audio: Audio;
    three_analyser: AudioAnalyser;
    readonly noteStrings = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];

    constructor() {
        this.listener = new AudioListener();
        this.audio = new Audio(this.listener);
        this.three_analyser = new AudioAnalyser(this.audio, 2048);

        navigator.mediaDevices.getUserMedia({
            audio: {
                autoGainControl: false,
                echoCancellation: false,
                latency: 0,
                noiseSuppression: false,
            } as MediaTrackConstraints,
        })
            .then(this._handleGetMicSuccess)
            .catch(console.error);
    }

    private _handleGetMicSuccess = (stream: MediaStream) => {
        const source = this.listener.context.createMediaStreamSource(stream);
        this.audio.setMediaStreamSource(source.mediaStream);
        source.connect(this.three_analyser.analyser);
        console.log('Audio successfully attached!');
    };

    get analyserNode(): AnalyserNode {
        return this.three_analyser.analyser;
    }

    findFundamentalFreq = (buf: Float32Array): number =>
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

        return this.audio.context.sampleRate / T0;
    };

    noteFromPitch = (frequency: number) => {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    };

    frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    };

    centsOffFromPitch = (frequency: number, note: number) => {
        return Math.floor(
            1200
            * Math.log(
                frequency / this.frequencyFromNoteNumber(note)
            )
            / Math.log(2)
        );
    };
}
