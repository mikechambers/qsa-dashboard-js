# QSA Dashboard

QSA Dashboard is a web based dashboard for tracking amateur radio signal propagation for digital modes.

It provides insight into how your signal is propagating, as well as antenna performance and band conditions for the station you are tracking.

Data is sourced via MQTT feed from [PSKReporter](https://www.mqtt.pskreporter.info/).

**Features**

- Realtime spot information, including location, distance and strength
- Plot spots on world map
- Filter data
- Light / dark modes
- Charts and data analysis
- Open Source
- Completely client side

**Supported Modes**

- FT8
- FT4
- CW
- MFSK
- JT9
- JT65
- PSK31
- PSK63
- RTTY
- SSB
- OLIVIA

Spots in any other mode (WSPR, for example) are still shown, with the mode listed as UNKNOWN.

## Installation

### Run Locally

#### Requirements

- [Node.js](https://nodejs.org)
- Online connection

#### Install required modules

```
$ npm install
```

#### Run

```
$ npm run dev
```

Then point your browser to the dev url (printed out in terminal when you run it).

If you want to play around without transmitting, you can run in debug mode:

```
$ npm run debug
```

which will prepopulate the app with mock spots.

## Usage

### Enter station details

On first launch, you will be prompted to enter your station details.

- _Callsign_ **(required)** : Your amateur radio call sign, or the callsign that you plan to track.
- _Grid Location_ Your maidenhead grid location (4 - 6 chars), used to show your location on the map and display propagation routes. It is optional, but without it there is no home marker or path line.

Once you have entered your station details, click "Update station" to load the dashboard.

The dashboard URL includes your callsign and grid (for example `/dashboard/W1AW/FN31`), so you can bookmark or share it.

### Begin transmitting on supported digital modes

Data is obtained from a live feed of propagation submissions to [PSKReporter](https://www.mqtt.pskreporter.info/).

You do not need any particular app to transmit, as long as you are transmitting a supported digital mode.

All that is required is that the receiver is using an app that reports viewed transmissions to PSKReporter (and they have the feature enabled).

### Interact with and filter data

Data is only retained per session. If you close the page, or reload it, data will be wiped. Only the most recent 3,000 spots are kept, older ones drop off.

Hover over a spot in the table or on the map to select it. Its details are shown, and the path from your location to the receiver is drawn on the map.

You can filter the data views via the filter bar. These filters are applied in real time, and affect the table, map and charts:

- _Callsign_ : only show spots from receivers whose callsign starts with this
- _Band_
- _Mode_
- _Min SNR_ : hide spots weaker than this
- _Min Distance_ : hide spots closer than this

## Charts

There are currently two charts:

### Max / Median Distance

This creates a floating bar chart displaying the max and median distance for each of the previous 30 minutes.

It is color coded based on the average signal strength (SNR).

### Spots / Minute

This displays the spots per minute, for each of the previous 30 minutes, color coding the line based on the average signal strength.

Note, due to the way that PSKReporter and apps handle duplicate / repeat spots, the initial minute will often be much higher than subsequent minutes, which omit repeated spots.

PSKReporter clears this every 5 minutes.

## Settings

|                |                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Callsign       | _(required)_ The callsign whose signal you want to track.                                                                    |
| Location Grid  | The maidenhead grid location for the specified callsign. Used to show your location on the map and display signal paths.     |
| Theme          | The color theme for the UI display. Options are Light or Dark.                                                               |
| Units          | The measurement units to display distances in. Metric or Imperial.                                                           |
| Time Zone      | The time zone to display time in. Options are UTC or Local (uses system time zone.)                                          |
| Grey Line      | Whether to display a greyline overlay, showing the transition between day and night. Can be useful for timing band openings. |
| Twilight Bands | Which lines the greyline overlay draws: horizon, civil, nautical and astronomical twilight.                                  |

## Known Issues

- The first minute in the charts is often much higher than the minutes after it (see the note under Spots / Minute)

## Development

There are a couple of tests included (mostly for callsign and grid validation), which you can run with:

```
$ npm test
```

## Questions, Feature Requests, Feedback

If you have any questions, feature requests, need help, or just want to chat, join the [dcli / DARCI Discord server](https://discord.gg/2Y8bV2Mq3p).

If you have any questions, feature requests, issues or need help please post on the [issues page](https://github.com/mikechambers/qsa-dashboard-js/issues).

## Acknowledgements

Data is obtained from a live feed of propagation submissions to [mqtt.pskreporter.info](https://www.mqtt.pskreporter.info/), from data submitted to [PSKReporter](https://pskreporter.info).

Built with [React](https://react.dev), [Mantine](https://mantine.dev), [MapLibre GL JS](https://maplibre.org), and the [ham2k](https://github.com/ham2k) libraries for DXCC and grid / distance calculations. Map styles are from [maptoolkit](https://www.maptoolkit.com), using [OpenStreetMap](https://www.openstreetmap.org/copyright) data.

## License

Project released under a [MIT License](LICENSE.md).

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE.md)
