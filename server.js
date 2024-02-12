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
// Define routes
app.get('/ended', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'ended.html')); // Serve ended.html
});

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


// Define the /getcurrentcoordinates route
app.get('/getcurrentcoordinates', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity && currentCity.latitude && currentCity.longitude) {
        const coordinates = {
            latitude: currentCity.latitude,
            longitude: currentCity.longitude
        };
        res.json(coordinates); // Send the coordinates as JSON response
    } else {
        res.status(404).send('Current coordinates not available.'); // Send an error if coordinates are not available
    }
});
// Define the /getcurrentcoordinates route
app.get('/getcurrentcoordinates', (req, res) => {
    const currentCity = app.get('currentCity');
    if (currentCity && currentCity.latitude && currentCity.longitude) {
        const nextCityIndex = currentIndex + 1;
        if (nextCityIndex < cities.length) {
            const nextCity = cities[nextCityIndex];
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const remainingTime = intervalInSeconds * 1000 - elapsedTime; // Remaining time in milliseconds
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
            const intermediateLatLng = {
                latitude: currentLatLng.latitude + (nextLatLng.latitude - currentLatLng.latitude) * interpolation,
                longitude: currentLatLng.longitude + (nextLatLng.longitude - currentLatLng.longitude) * interpolation
            };
            res.json(intermediateLatLng); // Send the intermediate coordinates as JSON response
        } else {
            const coordinates = {
                latitude: currentCity.latitude,
                longitude: currentCity.longitude
            };
            res.json(coordinates); // Send the current coordinates if there are no more cities
        }
    } else {
        res.status(404).send('Current coordinates not available.'); // Send an error if coordinates are not available
    }
});


app.get('/', (req, res) => {
    if (!isStarted()) {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'tracker.html'));
    }
});
// Define the /tracker route
app.get('/tracker', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'tracker.html'));
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
