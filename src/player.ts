import { Mesh, MeshNormalMaterial, SphereGeometry } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

export default class Player {
    mesh: Mesh;
    directions = {
        up: false,
        down: false,
        left: false,
        right: false
    }
    speed = 0.1

    constructor() {
        this.mesh = new Mesh(
            new SphereGeometry(0.1),
            new MeshNormalMaterial()
        );
    }

    handleKeyEvent(event: KeyboardEvent) {
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
                this.directions.up = keytoggle
                break;
            case 'a':
                this.directions.left = keytoggle
                break;
            case 's':
                this.directions.down = keytoggle
                break;
            case 'd':
                this.directions.right = keytoggle
                break;
        }
    }

    applyMovement() {
        if (this.directions.up || this.directions.down || this.directions.left || this.directions.right) {
            const old_pos = {
                x: this.mesh.position.x,
                y: this.mesh.position.y
            }
            let new_pos = { ...old_pos };

            if (this.directions.up) new_pos.y += this.speed;
            if (this.directions.down) new_pos.y -= this.speed;
            if (this.directions.left) new_pos.x -= this.speed;
            if (this.directions.right) new_pos.x += this.speed;

            new Tween(old_pos)
                .to(new_pos, 200)
                .easing(Easing.Quadratic.Out)
                .onUpdate(() => {
                    this.mesh.position.x = old_pos.x;
                    this.mesh.position.y = old_pos.y;
                })
                .start()
        }
    }
}