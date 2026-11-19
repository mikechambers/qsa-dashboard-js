# QSA Dashboard

QSA Dashboard is a web based dashboard for tracking radio amateur radio user signal propagation for digital modes.

It provides insight into how your signal is propagating, as well as antenna performance and band conditions for the station your are tracking.

Data is sourced via MQTT feed from [PSKReporter](https://www.mqtt.pskreporter.info/).

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

## Installation

## Usage

###

Online version.

### Run Locally

#### Requirements

- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### Install required modules

```
npm install
```

#### Run

```
npm run dev
```

Then point your browser to the dev url (printed out in terminal when you run it).

If you want to play around without transmitting, you can run in debug mode:

```
npm run debug
```

which will prepopulate the app with mock spots.

### Enter station details

On first launch, you will be prompted to enter your station details.

- _Callsign_ **(required)** : You amateur radio call sign, or the callsign that you plan to track.
- _Grid Location_ You maidenhead grid location (4 - 6 chars) used to display prorogation routes and determine distance.

Once you have entered your station details, click "Update Station" to load the dashboard.

### Load dashboard view

### Begin transmitting on supported digital modes

Data is obtained from a live feed of propagation submissions to [PSKReporter](https://www.mqtt.pskreporter.info/).

You do not need any particular app to transmit, as long as you are transmitting a supported digital mode.

All that is required is that the receiver is using an app that reports viewed transmissions to PSKReporter (and they have the feature enabled).

### Interact with and filter data

Data is only retained per session. If you close the page, or reload it, data will be wiped.

You can filter the data views via the filter bar. These filters are applied in real time.

## Charts

There are currently two charts:

### Max Median Distance

This creates a floating bar chart displaying the max and median distance for each of the previous 30 minutes.

It is color coded based on the average signal strength (SNR)
.

### Spots / Minutes

This displays the spots per minutes, for each of the previous 30 minutes, color coding the line based on the average signal strength.

Note, due to the way that PSKReporter and apps handle duplicate / repeat spots, the initial minute will often be much higher than subsequent minutes, which omit repeated spots.

PSKReporter clears this every 5 minutes.

## Settings

|               |                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Callsign      | _(required)_ The callsign whose signal you want to track.                                                                    |
| Location Grid | The maidenhead grid location for the specified callsign. Used to determine distance and display signal path.                 |
| Theme         | The color theme for the UI display. Options are Light or Dark.                                                               |
| Units         | The measurement units to display distances in. Metric or Imperial.                                                           |
| Time Zone     | The time zone to display time in. Options are UTC or Local (uses system time zone.)                                          |
| Grey Line     | Whether to display a greyline overlay, showing the transition between day and night. Can be useful for timing band openings. |

## Known Issues

- chart, flurry of spots on first transmission

## Questions, Feature Requests, Feedback

If you have any questions, feature requests, need help, or just want to chat, join the [dcli / DARCI Discord server](https://discord.gg/2Y8bV2Mq3p).

If you have any questions, feature requests, issues or need help please post on the [issues page](https://github.com/mikechambers/qsa-dashboard-js/issues).

## Acknowledgements

Data is obtained from a live feed of propagation submissions to [www.mqtt.pskeporter.info](https://www.mqtt.pskreporter.info/) from data from [PSKReporter](pskreporter.info).

## License

Project released under a [MIT License](LICENSE.md).

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE.md)
