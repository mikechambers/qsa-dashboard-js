export default class Location {
    latitude;
    longitude;
    grid;

    constructor({ latitude, longitude, grid }) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.grid = grid;
    }

    get id() {
        return `${this.latitude},${this.longitude}`;
    }

    //return in format for maplibre
    get coordinates() {
        return [this.longitude, this.latitude];
    }
}
