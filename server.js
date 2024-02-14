const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { SSE } = require('express-sse');

const app = express();
app.locals.clients = []; // Initialize clients array

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
                sendTrackerUpdate();
            }, 1000); // Update tracker every second
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

function sendTrackerUpdate() {
    const trackerUpdate = generateTrackerUpdate();
    app.locals.clients.forEach(client => {
        client.sse.send(trackerUpdate); // Send update using SSE
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
        nextCity
    };
}

app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
});

app.get('/', (req, res) => {
    if (!isTrackerStarted) {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'tracker.html'));
    }
});

app.get('/endtracker', (req, res) => {
    isTrackerStarted = false;
    console.log('Tracker ended.');
    app.set('currentCity', null);
    res.send('Tracker ended.');
});

app.get('/updates', (req, res) => {
    const sse = new SSE();

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Connect clients to SSE stream
    sse.init(req, res);

    // Add client to list of clients
    const client = { id: Date.now(), sse };
    app.locals.clients.push(client);

    // Handle client disconnect
    req.on('close', () => {
        console.log('Client disconnected');
        app.locals.clients = app.locals.clients.filter(c => c.id !== client.id);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
