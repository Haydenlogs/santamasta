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

async function generateTrackerHTML() {
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
}

function sendSSEMessage(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
}


app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
});
async function sendTrackerHTML(res) {
    const trackerHTML = await generateTrackerHTML();
    if (res) {
        if (!res.headersSent) { // Check if headers have been sent already
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write(`data: ${trackerHTML}\n\n`);
        }
    } else {
        app.locals.clients.forEach(client => {
            if (!client.res.finished && !client.res.headersSent) { // Check if headers have been sent already
                client.res.write(`data: ${trackerHTML}\n\n`);
            }
        });
    }
}

app.get('/', (req, res) => {
    if (!isStarted()) {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
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
        sendTrackerHTML(res);
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
