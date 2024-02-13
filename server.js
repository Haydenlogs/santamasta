const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
app.locals.clients = []; // Initialize clients array

// Rest of the server code...

let cities = [];
let currentIndex = 0;
let isTrackerStarted = false;
let startTime;
const intervalInSeconds = 8.35;
let trackerInterval;

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
                return { city, country, latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
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
            trackerInterval = setInterval(() => {
                sendTrackerHTML();
            }, 1000); // Update tracker HTML every second
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
            startTime = Date.now(); // Set the start time when sending a new city
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
        clearInterval(trackerInterval); // Stop the tracker interval
    }
}

function isStarted() {
    return isTrackerStarted;
}

function calculateSantaPosition(currentCity, nextCity, elapsedTime) {
    // Get the latitude and longitude of the current city
    const currentLatitude = parseFloat(currentCity.latitude);
    const currentLongitude = parseFloat(currentCity.longitude);

    // Dummy implementation: Calculate position based on latitude and longitude
    // You can replace this with your own logic
    const latitudePercentage = (currentLatitude + 90) / 180 * 100;
    const longitudePercentage = (currentLongitude + 180) / 360 * 100;

    return {
        latitude: latitudePercentage + '%',
        longitude: longitudePercentage + '%'
    };
}
async function sendTrackerHTML() {
    try {
        const trackerHTML = await generateTrackerHTML();
        app.locals.clients.forEach(client => {
            client.res.write(`data: ${trackerHTML}\n\n`);
        });
    } catch (error) {
        console.error('Error sending tracker HTML:', error);
    }
}

async function generateTrackerHTML() {
    try {
        const currentCity = app.get('currentCity');
        const nextCityIndex = currentIndex;
        const nextCity = cities[nextCityIndex];
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const timeLeft = Math.ceil(intervalInSeconds - elapsedTime / 1000);
        const santaPosition = calculateSantaPosition(currentCity, nextCity, elapsedTime);

        // Render HTML using EJS
        const html = await ejs.renderFile(path.join(__dirname, 'views', 'tracker.ejs'), {
            currentCity,
            timeLeft,
            santaPosition
        });

        return html;
    } catch (error) {
        console.error('Error generating tracker HTML:', error);
        throw error; // Re-throw the error to handle it further up the call stack
    }
}


app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
});
app.get('/', (req, res) => {
    if (!isStarted()) {
        // Send the provided HTML when the tracker is not started
        const htmlContent = `<!DOCTYPE html>
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
                    left: 75%;
                    top: 100%;
                    transition: left 1s, top 1s; /* Smooth transition for Santa's movement */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div id="currentLocation"></div>
                <div id="map">
                    <img id="santa" src="https://cdn.glitch.global/00096ffa-1c6f-46f0-aa52-09cd4de366d6/Santa_1-removebg-preview.png?v=1707774212144" width="50" height="50"> <!-- Image of Santa -->
                    <img src="https://cdn.glitch.global/00096ffa-1c6f-46f0-aa52-09cd4de366d6/satellite-map-of-the-world_wm00875.jpg?v=1707770779809" width="100%" height="100%">
                </div>
            </div>

            <script>
                // No client-side JavaScript code for updating tracker data
            </script>
        </body>
        </html>`;
        res.send(htmlContent);
    } else {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const client = { id: Date.now(), res };
        if (!app.locals.clients) {
            app.locals.clients = [];
        }
        app.locals.clients.push(client);

        // Send initial tracker HTML
        sendTrackerHTML();

        // Update tracker HTML every second
        setInterval(() => {
            sendTrackerHTML();
        }, 1000);
    }
});



app.get('/endtracker', (req, res) => {
    isTrackerStarted = false;
    console.log('Tracker ended.');
    app.set('currentCity', null);
    res.send('Tracker ended.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
