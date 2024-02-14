const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
app.locals.clients = []; // Initialize clients array

let cities = [];
let currentIndex = 0;
let isTrackerStarted = false;
let lastCity;
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
                sendTrackerUpdate();
            }, 1000); // Update tracker every second
            sendTrackerStartEvent(); // Send SSE event when the tracker starts
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
            lastCity = cityInfo; // Update lastCity when sending a new city
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
        lastCity = null; // Reset lastCity when the tracker ends
        clearInterval(trackerInterval); // Stop the tracker interval
    }
}

function sendTrackerUpdate() {
    const trackerUpdate = generateTrackerUpdate();
    app.locals.clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(trackerUpdate)}\n\n`);
    });
}

function generateTrackerUpdate() {
    const currentCity = app.get('currentCity');
    const nextCityIndex = currentIndex;
    const nextCity = cities[nextCityIndex];
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const timeLeft = Math.ceil(intervalInSeconds - elapsedTime / 1000);

    return {
        currentCity,
        timeLeft,
        nextCity,
        lastCity // Include lastCity in the tracker update
    };
}

function sendTrackerStartEvent() {
    app.locals.clients.forEach(client => {
        client.res.write('event: trackerStart\n');
        client.res.write('data: {"trackerStarted": true}\n\n');
    });
}

app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
  sendTrackerStartEvent({ trackerEnded: true });
});

app.get('/', (req, res) => {
    if (!isTrackerStarted) {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'tracker.html'));
    }
});
// Add a function to send SSE events
function sendTrackerEvent(data) {
    app.locals.clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

app.get('/endtracker', (req, res) => {
    isTrackerStarted = false;
    console.log('Tracker ended.');
    app.set('currentCity', null);
    lastCity = null; // Reset lastCity when the tracker ends
    res.send('Tracker ended.');
    currentIndex = 0;
    sendTrackerEvent({ trackerEnded: true });
});

app.get('/updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { id: Date.now(), res };
    if (!app.locals.clients) {
        app.locals.clients = [];
    }
    app.locals.clients.push(client);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
