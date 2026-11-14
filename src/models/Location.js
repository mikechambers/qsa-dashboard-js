export default class Location {
    latitude;
    longitude;
    grid;

    constructor({ latitude, longitude, grid }) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.grid = grid;
    }
}
