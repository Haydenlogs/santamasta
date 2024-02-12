const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();

let cities = [];
let trackerInterval;
let currentIndex = 0;
let isTrackerStarted = false;
let startTime; // Initialize the startTime variable
const intervalInSeconds = 8.35; // Time for each city in seconds
// Function to read cities from CSV file
async function readCitiesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        cities = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const cityInfo = {
                    City: row['"North Pole'],
                    Country: row['Arctic"'],
                };
                cities.push(cityInfo);
            })
            .on('end', () => {
                console.log('Cities loaded:', cities.length);
                resolve();
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error);
            });
    });
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
    startTracker('cities.csv');
    res.send('Tracker started.');
});

app.get('/endtracker', (req, res) => {
    endTracker();
    res.send('Tracker ended.');
});

// Start the tracker
async function startTracker(filePath) {
    console.log('Starting tracker...');
    if (!isTrackerStarted) {
        try {
            await readCitiesFromFile(filePath);
            isTrackerStarted = true;
            sendNextCity();
            trackerInterval = setInterval(() => {
                if (isTrackerStarted) { // Check if tracker is started before calculating time left
                    const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
                    if (timeLeft <= 0) {
                        clearInterval(trackerInterval);
                        currentIndex++;
                        sendNextCity();
                    }
                }
            }, 1000); // Check every second
            startTime = Date.now(); // Initialize startTime when tracker starts
        } catch (error) {
            console.error('Error starting tracker:', error);
        }
    } else {
        console.log('Tracker is already started.');
    }
}



// Function to get time left
function getTimeLeft() {
    if (isTrackerStarted) {
        const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
        return Math.max(timeLeft, 0); // Ensure timeLeft is non-negative
    } else {
        return 0; // Return 0 if tracker is not started
    }
}

// Route to get current location
app.get('/getcurrentlocation', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity) {
        const timeLeft = getTimeLeft();
        res.send(`${currentCity} In ${timeLeft} seconds.`);
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
