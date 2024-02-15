const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
app.locals.clients = []; // Initialize clients array

let cities = [];
let currentIndex = 10561;
let isTrackerStarted = false;
let maxpresents = 8045311447;
let lastCity;
let startTime;
const intervalInSeconds = 8.35;
let trackerInterval;

// Function to read the current index from a file
function readIndexFromFile() {
    try {
        const indexData = fs.readFileSync('currentIndex.txt', 'utf8');
        currentIndex = parseInt(indexData);
        console.log('Current index read from file:', currentIndex);
    } catch (err) {
        console.error('Error reading index from file:', err);
    }
}
// Endpoint to set message 1
app.get('/message1set', async (req, res) => {
    try {
        await fs.writeFile('message.txt', 'Easter Bunny is Getting Ready to Launch.');
        res.send('Message 1 set.');
    } catch (error) {
        console.error('Error setting message 1:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to set message 2
app.get('/message2set', async (req, res) => {
    try {
        await fs.writeFile('message.txt', 'Easter Bunny is expected to launch within the hour.');
        res.send('Message 2 set.');
    } catch (error) {
        console.error('Error setting message 2:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to set message 3
app.get('/message3set', async (req, res) => {
    try {
        await fs.writeFile('message.txt', 'Easter Bunny is about to launch.');
        res.send('Message 3 set.');
    } catch (error) {
        console.error('Error setting message 3:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to set message 4
app.get('/message4set', async (req, res) => {
    try {
        await fs.writeFile('message.txt', 'Easter Bunny is Launching!.');
        res.send('Message 4 set.');
    } catch (error) {
        console.error('Error setting message 4:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getmessage', (req, res) => {
    try {
        const message = fs.readFileSync('message.txt', 'utf8');
        res.send(message);
    } catch (err) {
        console.error('Error getting message:', err);
        res.status(500).send('Error getting message');
    }
});


// Function to save the current index to a file
function saveIndexToFile() {
    fs.writeFileSync('currentIndex.txt', currentIndex.toString());
    console.log('Current index saved to file:', currentIndex);
}

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
            readIndexFromFile(); // Read index from file
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
            saveIndexToFile(); // Save current index to file
            setTimeout(sendNextCity, intervalInSeconds * 1000); // Wait for intervalInSeconds before sending the next city
            sendTrackerEvent({ santaMoving: true });
        } else {
            currentIndex++; // Increment currentIndex even if city information is missing
            sendNextCity(); // Continue to the next city
        }
    } else {
        // If currentIndex is equal to or greater than cities.length, end the tracker
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
    sendTrackerEvent({ trackerStarted: true });
});

// Endpoint to reset the index to 0
app.get('/restarttracker', (req, res) => {
    currentIndex = 0;
    saveIndexToFile(); // Save the index to file
    res.send('Tracker index reset.');
});

// Define a variable to track whether the site is locked
let isLocked = true;

// Endpoint to unlock the site
app.get('/unlock', (req, res) => {
    isLocked = false;
    res.send('Site unlocked');
    sendTrackerEvent({ unlocked: true });
});

// Endpoint to lock the site
app.get('/lock', (req, res) => {
    isLocked = true;
    res.send('Site locked');
    sendTrackerEvent({ unlocked: false });
});

// Default route handler
app.get('/', (req, res) => {
    // Check if the site is locked
    if (isLocked) {
        // If locked, redirect to comeback.html
        res.sendFile(path.join(__dirname, 'src', 'pages', 'comeback.html'));
    } else {
        // If unlocked, serve the default page (index.html or tracker.html based on tracker status)
        if (!isTrackerStarted) {
            res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
        } else {
            res.sendFile(path.join(__dirname, 'src', 'pages', 'tracker.html'));
        }
    }
});
// Default route handler
app.get('/ended.html', (req, res) => {
  
        // If locked, redirect to comeback.html
        res.sendFile(path.join(__dirname, 'src', 'pages', 'ended.html'));
   
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
    saveIndexToFile(); // Save the index to file
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
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'controlpanel.html'));
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
