const express = require('express');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const app = express();

let cities = [];
let trackerInterval;
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
            trackerInterval = setInterval(() => {
                const timeLeft = Math.ceil(intervalInSeconds - (Date.now() - startTime) / 1000);
                if (timeLeft <= 0) {
                    clearInterval(trackerInterval);
                    sendNextCity();
                }
            }, 1000);
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
        clearInterval(trackerInterval);
        isTrackerStarted = false;
        console.log('Tracker ended.');
        app.set('currentCity', null);
    }
}



function endTracker() {
    clearInterval(trackerInterval);
    currentIndex = 0;
    isTrackerStarted = false;
    console.log('Tracker ended.');
    app.set('currentCity', '');
}

function isStarted() {
    return isTrackerStarted;
}

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

app.get('/', (req, res) => {
    // Function to serve the appropriate page based on the tracker status
    function servePage() {
        if (!isStarted()) {
            res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
        } else {
            res.sendFile(path.join(__dirname, 'src', 'pages', 'tracker.html'));
        }
    }

    // Serve the appropriate page immediately
    servePage();

    // Check the tracker status every second and serve the appropriate page
    const interval = setInterval(() => {
        servePage();
        if (isStarted()) {
            clearInterval(interval); // Stop checking once the tracker has started
        }
    }, 1000);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
