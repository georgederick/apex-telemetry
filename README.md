<p align="center"><img src="assets/icons/logo-mark.svg" width="96" height="96" alt="Apex Telemetry logo"></p>

# Apex Telemetry

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)
![OpenF1](https://img.shields.io/badge/Data-OpenF1_API-FF8000)
![License](https://img.shields.io/badge/License-MIT-00D68F)

A Formula 1 telemetry lab that runs entirely in the browser. It reads real historical session data from the OpenF1 API and turns it into driver comparisons, telemetry traces and track layouts.

**Developed by georgederick**

## Features

- **Overview**: season statistics, sessions per month, session types, Grands Prix and recent activity, all built from API responses.
- **Race Sessions**: pick a season, Grand Prix and session. Load results, lap counts, best laps, pit stops, tyre stints, weather and race control messages. Sort the table and filter by driver or team.
- **Telemetry Lab**: compare two drivers on any timed lap. Speed, throttle, brake, RPM and gear traces use time since lap start on the horizontal axis. A delta view shows where one lap gains or loses time against the other.
- **Driver Comparison**: best lap, best sectors and top recorded speed side by side, with a radar chart.
- **Circuits**: Grands Prix from `/meetings` with track layouts drawn from real `/location` samples.
- Local caching, HTTP 429 handling, loading and empty states, and saved preferences through `localStorage`.

## Data and transparency

- Data provided by the [OpenF1 API](https://openf1.org/). OpenF1 is independent and unofficial, and is not associated with Formula 1 companies.
- The project uses the free historical data. No API key, backend or sign-up is needed.
- The free tier allows 3 requests per second and 30 per minute. Requests are queued with spacing, retried on HTTP 429, cached in `localStorage` for 24 hours and made only when a view needs them. The Refresh data button clears the cache.
- Nothing is simulated. Missing values appear as "Data unavailable".
- Track coordinates are OpenF1 telemetry units, not geographic positions. They are normalised only to draw the layout.
- Distance for the delta view is estimated by integrating speed, so it is an approximation.
- Circuit length and corner count are not provided by OpenF1 and are therefore not shown.

## Endpoints used

`/meetings`, `/sessions`, `/drivers`, `/laps`, `/car_data`, `/location`, `/position`, `/pit`, `/stints`, `/weather`, `/race_control`

## Tech stack

HTML, CSS and vanilla JavaScript with `fetch()`. Chart.js 4.4.1 is loaded from jsDelivr. No build step, no backend, no database.

## Project structure

```
apex-telemetry/
├── index.html
├── README.md
├── LICENSE
├── .gitignore
├── assets/
│   ├── images/   (carbon texture, screenshots)
│   ├── icons/    (logo, tyre compound icons)
│   └── tracks/
├── css/
│   ├── main.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
└── js/
    ├── storage.js
    ├── api.js
    ├── ui.js
    ├── flags.js
    ├── charts.js
    ├── navigation.js
    ├── telemetry.js
    ├── drivers.js
    ├── circuits.js
    └── app.js
```

## Run locally

```
git clone https://github.com/georgederick/apex-telemetry.git
cd apex-telemetry
python3 -m http.server 8000
```

Open `http://localhost:8000`. Opening `index.html` directly also works.

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. Open Settings, then Pages.
3. Select the `main` branch and the `/ (root)` folder, then save.
4. The site goes live at `https://georgederick.github.io/apex-telemetry/`.

## Screenshots

![Overview](assets/images/overview.png)
![Telemetry Lab](assets/images/telemetry-lab.png)
![Driver Comparison](assets/images/driver-comparison.png)
![Circuits](assets/images/circuits.png)

## License

MIT. See `LICENSE`.

Developed by georgederick.
