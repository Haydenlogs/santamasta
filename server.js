const express = require("express");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const app = express();
app.locals.clients = []; // Initialize clients array

let cities = [];
let currentIndex;
let isTrackerStarted = false;
let maxpresents = 8045311447;
let lastCity;
let startTime;
const intervalInSeconds = 7.86;
let trackerInterval;



// Function to save the current index to a file
function saveIndexToFile() {
  fs.writeFileSync("currentIndex.txt", currentIndex.toString());
  console.log("Current index saved to file:", currentIndex);
}

async function readCitiesFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = data.trim().split("\n");
      cities = lines.map((line) => {
        const [city, country, latitude, longitude] = line.split(",");
        return {
          city,
          country,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        };
      });

      console.log("Cities loaded:", cities.length);
      resolve();
    });
  });
}

// Function to read the current index from a file
async function readIndexFromFile() {
  try {
    const indexData = await fs.promises.readFile("currentIndex.txt", "utf8");
    const currentIndex = parseInt(indexData);
    console.log("Current index read from file:", currentIndex);
    return currentIndex;
  } catch (err) {
    console.error("Error reading index from file:", err);
    return 0; // Return 0 if there's an error reading the file
  }
}
async function startTracker(filePath) {
  if (!isTrackerStarted) {
    try {
      await readCitiesFromFile(filePath); // Wait for cities to be loaded
      currentIndex = await readIndexFromFile(); // Read index from file
      isTrackerStarted = true;
      if (currentIndex > 1) {
        // If currentIndex is greater than 1, start from that index
        for (let i = 0; i < currentIndex - 1; i++) {
          addToGiftsDelivered(cities[i]); // Add a basket for each city before the current index
        }
      }
      sendNextCity();
      trackerInterval = setInterval(() => {
        sendTrackerUpdate();
      }, 1000); // Update tracker every second
      sendTrackerStartEvent(); // Send SSE event when the tracker starts
    } catch (error) {
      console.error("Error loading cities:", error);
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
        longitude: city.longitude,
      };
      app.set("currentCity", cityInfo);
      lastCity = cityInfo; // Update lastCity when sending a new city
      startTime = Date.now(); // Set the start time when sending a new city
      console.log("Sent next city:", cityInfo);
      currentIndex++; // Increment currentIndex after sending the city
      saveIndexToFile(); // Save current index to file
      setTimeout(sendNextCity, intervalInSeconds * 1000); // Wait for intervalInSeconds before sending the next city
      sendTrackerEvent({ santaMoving: true });
      // Add delivered location to JSON file
      addToGiftsDelivered(cityInfo);
      console.log(cityInfo);
      sendTrackerEvent({ newbasket: cityInfo });
    } else {
      currentIndex++; // Increment currentIndex even if city information is missing
      sendNextCity(); // Continue to the next city
    }
  } else {
    // If currentIndex is equal to or greater than cities.length, end the tracker
    isTrackerStarted = false;
    console.log("Tracker ended.");
    sendTrackerEvent({ trackerEnded: true });
    app.set("currentCity", null);
    lastCity = null; // Reset lastCity when the tracker ends
    clearInterval(trackerInterval); // Stop the tracker interval
  }
}
// Endpoint to set message 1
app.get("/message1set", async (req, res) => {
  try {
    await fs.writeFile(
      "message.txt",
      "Easter Bunny is Getting Ready to Launch.",
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        } else {
          res.send("Message 1 set.");
          sendTrackerEvent({
            messageupdate: "Easter Bunny is Getting Ready to Launch.",
          });
        }
      }
    );
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to set message 2
app.get("/message2set", async (req, res) => {
  try {
    await fs.writeFile(
      "message.txt",
      "Easter Bunny is expected to launch within the hour.",
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        } else {
          res.send("Message 2 set.");
          sendTrackerEvent({
            messageupdate:
              "Easter Bunny is expected to launch within the hour.",
          });
        }
      }
    );
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to set message 3
app.get("/message3set", async (req, res) => {
  try {
    await fs.writeFile(
      "message.txt",
      "Easter Bunny is about to launch.",
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        } else {
          res.send("Message 3 set.");
          sendTrackerEvent({
            messageupdate: "Easter Bunny is about to launch.",
          });
        }
      }
    );
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to set message 4
app.get("/message4set", async (req, res) => {
  try {
    await fs.writeFile("message.txt", "Easter Bunny is Launching!", (err) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        res.send("Message 4 set.");
        sendTrackerEvent({ messageupdate: "Easter Bunny is Launching!" });
      }
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Function to add delivered location to giftsdelivered.json
function addToGiftsDelivered(cityInfo) {
  try {
    const fileName = "giftsdelivered.json";
    let data = [];
    if (fs.existsSync(fileName)) {
      data = JSON.parse(fs.readFileSync(fileName));
    }
    data.push(cityInfo);
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log("Added to giftsdelivered.json:", cityInfo);
  } catch (error) {
    console.error("Error adding to giftsdelivered.json:", error);
  }
}

function sendTrackerUpdate() {
  const trackerUpdate = generateTrackerUpdate();
  app.locals.clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(trackerUpdate)}\n\n`);
  });
}

function generateTrackerUpdate() {
  const currentCity = app.get("currentCity");
  const nextCityIndex = currentIndex;
  const nextCity = cities[nextCityIndex];
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;
  const timeLeft = Math.ceil(intervalInSeconds - elapsedTime / 1000);

  return {
    currentCity,
    timeLeft,
    nextCity,
    lastCity, // Include lastCity in the tracker update
  };
}

function sendTrackerStartEvent() {
  app.locals.clients.forEach((client) => {
    client.res.write("event: trackerStart\n");
    client.res.write('data: {"trackerStarted": true}\n\n');
  });
}

app.get("/starttracker", (req, res) => {
  startTracker("cities2.csv");
  res.send("Tracker started.");
  sendTrackerEvent({ trackerStarted: true });
});

// Endpoint to reset the index to 0
app.get("/restarttracker", (req, res) => {
  currentIndex = 0;
  saveIndexToFile(); // Save the index to file
  res.send("Tracker index reset.");
});

// Define a variable to track whether the site is locked
let isLocked = true;

// Endpoint to unlock the site
app.get("/unlock", (req, res) => {
  isLocked = false;
  res.send("Site unlocked");
  sendTrackerEvent({ unlocked: true });
});

// Endpoint to lock the site
app.get("/lock", (req, res) => {
  isLocked = true;
  res.send("Site locked");
  sendTrackerEvent({ unlocked: false });
});

// Default route handler
app.get("/", (req, res) => {
  // Check if the site is locked
  if (isLocked) {
    // If locked, redirect to comeback.html
    res.sendFile(path.join(__dirname, "src", "pages", "comeback.html"));
  } else {
    // If unlocked, serve the default page (index.html or tracker.html based on tracker status)
    if (!isTrackerStarted) {
      res.sendFile(path.join(__dirname, "src", "pages", "index.html"));
    } else {
      res.sendFile(path.join(__dirname, "src", "pages", "tracker.html"));
    }
  }
});

// Endpoint to reset the baskets
app.get("/resetbaskets", (req, res) => {
  try {
    fs.writeFileSync("giftsdelivered.json", "[]");
    res.send("Baskets reset.");
  } catch (error) {
    console.error("Error resetting baskets:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to get the baskets delivered in JSON format
app.get("/getbaskets", (req, res) => {
  try {
    const baskets = JSON.parse(fs.readFileSync("giftsdelivered.json"));
    res.json(baskets);
  } catch (error) {
    console.error("Error getting baskets:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add a function to send SSE events
function sendTrackerEvent(data) {
  app.locals.clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

app.get("/endtracker", (req, res) => {
  isTrackerStarted = false;
  console.log("Tracker ended.");
  app.set("currentCity", null);
  lastCity = null; // Reset lastCity when the tracker ends
  res.send("Tracker ended.");
  currentIndex = 0;
  saveIndexToFile(); // Save the index to file
  sendTrackerEvent({ trackerEnded: true });
});

app.get("/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const client = { id: Date.now(), res };
  if (!app.locals.clients) {
    app.locals.clients = [];
  }
  app.locals.clients.push(client);
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "controlpanel.html"));
});
app.get("/ended.html", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "ended.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
