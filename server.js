const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const app = express();

let cities = [];
let trackerInterval;
let currentIndex = 0;
let isTrackerStarted = false;
let startTime; // Initialize the startTime variable
const intervalInSeconds = 8.53; // Time for each city in seconds

// Function to read cities from CSV file
async function readCitiesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        cities = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                cities.push(row);
            })
            .on('end', () => {
                console.log('Cities loaded:', cities.length);
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Start the tracker
async function startTracker(filePath) {
    if (!isTrackerStarted) {
        try {
            await readCitiesFromFile(filePath);
            isTrackerStarted = true;
            sendNextCity();
            trackerInterval = setInterval(() => {
                const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
                if (timeLeft <= 0) {
                    clearInterval(trackerInterval);
                    currentIndex++;
                    sendNextCity();
                }
            }, 1000); // Check every second
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }
}

// Function to send the next city information
function sendNextCity() {
    if (currentIndex < cities.length) {
        const city = cities[currentIndex];
        const cityInfo = `${city.City}, ${city.Country}`;
        app.set('currentCity', cityInfo);
        startTime = Date.now(); // Initialize startTime here
    } else {
        clearInterval(trackerInterval);
        isTrackerStarted = false;
        console.log('Tracker ended.');
        app.set('currentCity', '');
    }
}

// End the tracker
function endTracker() {
    clearInterval(trackerInterval);
    currentIndex = 0;
    isTrackerStarted = false;
    console.log('Tracker ended.');
    app.set('currentCity', '');
}

// Check if the tracker is started
function isStarted() {
    return isTrackerStarted;
}

// Define routes
app.get('/starttracker', (req, res) => {
    startTracker('cities2.csv');
    res.send('Tracker started.');
});

app.get('/endtracker', (req, res) => {
    endTracker();
    res.send('Tracker ended.');
});

app.get('/getcurrentlocation', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity) {
        const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
        res.send(`${currentCity} In ${timeLeft} seconds.`);
    } else {
        res.send('Tracker is not started.');
    }
});

app.get('/isstarted', (req, res) => {
    res.send(isStarted() ? 'true' : 'false');
});

// Serve index.html if tracker is not started
app.use(express.static(path.join(__dirname, 'src')));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
