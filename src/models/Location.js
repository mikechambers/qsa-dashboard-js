export default class Location {
    latitude;
    longitude;
    grid;

    constructor({ latitude, longitude, grid }) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.grid = grid;
    }

    //return in format for maplibre
    get coordinates() {
        return [this.longitude, this.latitude];
    }
}
