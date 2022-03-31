import { Easing, Tween } from '@tweenjs/tween.js';
import { CircleGeometry, Mesh, MeshNormalMaterial } from 'three';
import view from './view';
import dimensions from './dimensions';

export default class Player {
    geometry: CircleGeometry;
    mesh: Mesh;
    private directions = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    speed = 20 * view.xunit;

    constructor() {
        this.geometry = new CircleGeometry(dimensions.player_size, 50);
        this.mesh = new Mesh(
            this.geometry,
            new MeshNormalMaterial()
        );
    }

    handleKeyEvent = (event: KeyboardEvent) => {
        let keytoggle = false;
        switch (event.type) {
            case 'keypress':
                keytoggle = true;
                break;
            case 'keyup':
                keytoggle = false;
                break;
            default:
                return;
        }

        switch (event.key) {
            case 'w':
                this.directions.up = keytoggle;
                break;
            case 'a':
                this.directions.left = keytoggle;
                break;
            case 's':
                this.directions.down = keytoggle;
                break;
            case 'd':
                this.directions.right = keytoggle;
                break;
        }
    };

    applyMovement = () => {
        const old_pos = {
            x: this.mesh.position.x,
            y: this.mesh.position.y
        };
        const new_pos = { ...old_pos };

        if (this.directions.up) new_pos.y += this.speed;
        if (this.directions.down) new_pos.y -= this.speed;
        if (this.directions.left) new_pos.x -= this.speed;
        if (this.directions.right) new_pos.x += this.speed;

        new Tween(old_pos)
            .to(new_pos, 500)
            .easing(Easing.Quadratic.Out)
            .onUpdate(() => {
                this.mesh.position.x = old_pos.x;
                this.mesh.position.y = old_pos.y;
            })
            .start();
    };
}
