class View {
    width = window.innerWidth
    height = window.innerHeight
    xunit = this.width / 200;
    yunit = this.height / 200;
    bottom = this.yunit * 200;

    updateSize = (width: number, height: number) => {
        this.width = width;
        this.height = height;
        this.xunit = width / 200;
        this.yunit = height / 200;
    }
}

export default new View();
