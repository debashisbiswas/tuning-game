import view from "./view";

class Dimensions {
    player_size = 0;

    constructor() {
        this.recalc();
    }

    recalc = () => {
        this.player_size = 10 * view.yunit
    }
}

export default new Dimensions();
