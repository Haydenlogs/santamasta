const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

let cities = [];
let currentIndex = 0;
let isTrackerStarted = false;
let startTime;
const intervalInSeconds = 8.35;

async function readCitiesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const lines = data.trim().split('\n');
            cities = lines.map(line => {
                const [city, country, latitude, longitude] = line.split(',');
                return { city, country, latitude, longitude };
            });

            console.log('Cities loaded:', cities.length);
            resolve();
        });
    });
}

async function startTracker(filePath) {
    if (!isTrackerStarted) {
        try {
            await readCitiesFromFile(filePath); // Wait for cities to be loaded
            isTrackerStarted = true;
            sendNextCity();
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }
}

function sendNextCity() {
    if (isTrackerStarted && currentIndex < cities.length) {
        const city = cities[currentIndex];
        if (city.city && city.country) {
            const cityInfo = {
                city: city.city,
                country: city.country,
                latitude: city.latitude,
                longitude: city.longitude
            };
            app.set('currentCity', cityInfo);
            startTime = Date.now();
            console.log('Sent next city:', cityInfo);
            currentIndex++; // Increment currentIndex after sending the city
            setTimeout(sendNextCity, intervalInSeconds * 1000); // Wait for intervalInSeconds before sending the next city
        } else {
            currentIndex++; // Increment currentIndex even if city information is missing
            sendNextCity(); // Continue to the next city
        }
    } else {
        isTrackerStarted = false;
        console.log('Tracker ended.');
        app.set('currentCity', null);
    }
}

function isStarted() {
    return isTrackerStarted;
}

app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
});

app.get('/getcurrentlocation', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity && currentCity.city && currentCity.country) {
        const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
        const response = `${currentCity.city}, ${currentCity.country} In ${timeLeft} seconds.`;
        res.send(response);
    } else {
        res.send('Tracker is not started or no city information available.');
    }
});

app.get('/isstarted', (req, res) => {
    res.send(isStarted() ? 'true' : 'false');
});

app.get('/getcurrentcoordinates', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity && currentCity.latitude && currentCity.longitude) {
        res.json({
            latitude: currentCity.latitude,
            longitude: currentCity.longitude
        });
    } else {
        res.status(404).send('Current coordinates not available.');
    }
});

// Construct tracker HTML dynamically
function constructTrackerHTML(currentCity, timeLeft) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Santa Tracker</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f0f8ff; /* Light Blue */
                }
                .container {
                    text-align: center;
                    padding: 20px;
                }
                #currentLocation {
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 50px;
                }
                #map {
                    position: relative;
                    width: 80%;
                    height: 70%;
                    margin: 20px auto;
                    overflow: hidden; /* Hide overflow to prevent image from overflowing */
                }
                #santa {
                    position: absolute;
                    transition: top 1s, left 1s; /* Smooth transition for Santa's movement */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div id="currentLocation">${currentCity.city}, ${currentCity.country} In ${timeLeft} seconds.</div>
                <div id="map">
                    <img id="santa" src="santa.png" width="50" height="50"> <!-- Image of Santa -->
                    <img src="https://cdn.glitch.global/00096ffa-1c6f-46f0-aa52-09cd4de366d6/satellite-map-of-the-world_wm00875.jpg?v=1707770779809" width="100%" height="100%">
                </div>
            </div>
            <script>
                setInterval(() => {
                    fetch('/getcurrentcoordinates')
                        .then(response => response.json())
                        .then(coordinates => {
                            const santa = document.getElementById('santa');
                            const map = document.getElementById('map');
                            const mapWidth = map.offsetWidth; // Width of the map container
                            const mapHeight = map.offsetHeight; // Height of the map container
                            const santaWidth = santa.offsetWidth; // Width of the Santa image
                            const santaHeight = santa.offsetHeight; // Height of the Santa image
                            const left = (coordinates.longitude / 360 + 0.5) * mapWidth - santaWidth / 2; // Calculate left position
                            const top = (0.5 - coordinates.latitude / 180) * mapHeight - santaHeight / 2; // Calculate top position
                            santa.style.left = \`\${left}px\`; // Set left position
                            santa.style.top = \`\${top}px\`; // Set top position
                        })
                        .catch(error => console.error('Error updating Santa location:', error));
                }, 1000);
            </script>
        </body>
        </html>
    `;
}

app.get('/', (req, res) => {
    if (!isStarted()) {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
    } else {
        const currentCity = app.get('currentCity');
        const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
        const trackerHTML = constructTrackerHTML(currentCity, timeLeft);
        res.send(trackerHTML);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
