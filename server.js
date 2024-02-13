const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { createServer } = require('http');
const { Server: SSE } = require('express-sse');

const sse = new SSE();


const app = express();

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
function calculateSantaPosition(currentCity, nextCity, elapsedTime) {
    const transitionDuration = intervalInSeconds * 500; // Transition duration in milliseconds
    const interpolation = Math.min(elapsedTime / transitionDuration, 1); // Interpolation value between 0 and 1
    const currentLatLng = {
        latitude: currentCity.latitude,
        longitude: currentCity.longitude
    };
    const nextLatLng = {
        latitude: nextCity.latitude,
        longitude: nextCity.longitude
    };
    return {
        latitude: currentLatLng.latitude + (nextLatLng.latitude - currentLatLng.latitude) * interpolation,
        longitude: currentLatLng.longitude + (nextLatLng.longitude - currentLatLng.longitude) * interpolation
    };
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

async function generateTrackerHTML() {
    const currentCity = app.get('currentCity');
    const nextCityIndex = currentIndex;
    const nextCity = cities[nextCityIndex];
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const timeLeft = Math.ceil(intervalInSeconds - elapsedTime / 1000);
    const santaPosition = calculateSantaPosition(currentCity, nextCity, elapsedTime);

    // Render HTML using EJS
    return ejs.renderFile(path.join(__dirname, 'views', 'tracker.ejs'), {
        currentCity,
        timeLeft,
        santaPosition
    });
}

async function sendTrackerHTML() {
    const trackerHTML = await generateTrackerHTML();
    sse.send(trackerHTML);
}


// Route to start the tracker
app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
});

// Route to end the tracker
app.get('/endtracker', (req, res) => {
    isTrackerStarted = false;
    console.log('Tracker ended.');
    app.set('currentCity', null);
    res.send('Tracker ended.');
});

// Initialize SSE endpoint
app.get('/sse', sse.init);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
