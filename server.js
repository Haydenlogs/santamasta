const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();

let cities = [];
let trackerInterval;
let currentIndex = 0;
let isTrackerStarted = false;
const intervalInSeconds = 8.53; // Time for each city in seconds

// Function to read cities from CSV file
function readCitiesFromFile(filePath) {
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
            trackerInterval = setInterval(sendNextCity, intervalInSeconds * 1000);
            sendNextCity();
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
        currentIndex++; // Increment after sending the city information
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
    startTracker('World Cities East to West - World_Cities_Location_table.csv');
    res.send('Tracker started.');
});

app.get('/endtracker', (req, res) => {
    endTracker();
    res.send('Tracker ended.');
});

app.get('/getcurrentlocation', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity) {
        res.send(`${currentCity} In ${currentIndex * intervalInSeconds} seconds.`);
    } else {
        res.send('Tracker is not started.');
    }
});

app.get('/isstarted', (req, res) => {
    res.send(isStarted() ? 'true' : 'false');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
