
let currentunixtimeinmiliseconds = 0;

async function fetchUnixTime() {
  try {
    const response = await fetch('https://api.master-trackers.xyz/time');
    if (!response.ok) throw new Error('Failed to fetch time');

    const data = await response.json();
    currentunixtimeinmiliseconds = data.unixTime;

    // Start incrementing time locally
    setInterval(() => {
      currentunixtimeinmiliseconds += 1000;
    }, 1000);
  } catch (error) {
    console.error('Error fetching time:', error);
  }
}

// Fetch initial time
fetchUnixTime();
function getFlagImageUrl(countryCode) {
      // Check if countryCode starts with 'http://' or 'https://'
      if (countryCode.startsWith('http://') || countryCode.startsWith('https://')) {
        return countryCode;  // Return the link itself
      } else {
        return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;  // Otherwise, return flag image URL
      }
    }


    // Function to fetch the maximum number of presents
    async function getMaxPresents() {
      try {
        const response = await fetch('/getmaxpresents');
        const data = await response.json();
        return data.basketDelivered;
      } catch (error) {
        console.error('Error fetching max presents:', error);
        return 0; // Return 0 in case of error
      }

    }
    var source
    // Function to fetch the current city index
    async function getCurrentCityIndex() {
      try {
        const response = await fetch('/getindex');
        const data = await response.json();
        return data.index;
      } catch (error) {
        console.error('Error fetching current city index:', error);
        return 0; // Return 0 in case of error
      }
    }
    var presentsdeliverednumber = Infinity;
    // Function to update presents delivered every 10 milliseconds
    async function updatePresentsDelivered() {
      const maxPresents = await getMaxPresents();
      const maxPresentsNumber = Number(maxPresents);
      presentsdeliverednumber = maxPresentsNumber

    }

    // Call the function to start updating presents delivered
    updatePresentsDelivered();
    // Example usage:
    const countryCode = 'US'; // Replace with the country code you need


    var timeleft2
    // Function to get latitude and longitude from IP address
    async function getLatLongFromIPAddress() {
      // Check if IP address is already stored in local storage
      const storedIP = localStorage.getItem('storedIP');
      if (storedIP) {
        // If IP address is already stored, return the saved latitude and longitude
        const latitude = localStorage.getItem('latitude');
        const longitude = localStorage.getItem('longitude');
        return {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        };
      } else {
        try {
          // Fetch IP address details
          const response = await fetch('/ip-info');
          const data = await response.json();
          // Store IP address details in local storage
          localStorage.setItem('storedIP', true);
          localStorage.setItem('latitude', data.latitude);
          localStorage.setItem('longitude', data.longitude);
          // Return latitude and longitude
          return {
            latitude: data.latitude,
            longitude: data.longitude
          };
        } catch (error) {
          console.error('Error getting latitude and longitude:', error);
          return null;
        }
      }
    }
    var stopped = false;
    function openDonationScreen() {
      // Create the iframe element
      var iframe = document.createElement('iframe');

      // Set the source to "/donationiframe"
      iframe.src = "/donationiframe";

      // Set the iframe styles
      iframe.style.position = "fixed";
      iframe.style.top = "50%";
      iframe.style.left = "50%";
      iframe.style.transform = "translate(-50%, -50%)";
      iframe.style.width = "90vw";
      iframe.style.height = "90vh";
      iframe.style.border = "none";
      iframe.style.zIndex = "9999";

      // Create close button
      var closeButton = document.createElement('button');
      closeButton.textContent = "x";
      closeButton.style.position = "absolute";
      closeButton.style.top = "100px";
      closeButton.style.right = "10px";
      closeButton.style.padding = "5px";
      closeButton.style.background = "rgba(0, 0, 0, 0.5)";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "50%";
      closeButton.style.cursor = "pointer";
      closeButton.style.zIndex = "10000";
      closeButton.onclick = function () {
        document.body.removeChild(iframe);
        document.body.removeChild(closeButton);
      };

      // Append the iframe and close button to the body
      document.body.appendChild(iframe);
      document.body.appendChild(closeButton);
    }
    function openSubscriptionScreen() {
      // Create the iframe element
      var iframe = document.createElement('iframe');

      // Set the source to "/donationiframe"
      iframe.src = "/emails/subscribe";

      // Set the iframe styles
      iframe.style.position = "fixed";
      iframe.style.backgroundColor = "white";
      iframe.style.top = "50%";
      iframe.style.left = "50%";
      iframe.style.transform = "translate(-50%, -50%)";
      iframe.style.width = "90vw";
      iframe.style.height = "90vh";
      iframe.style.border = "none";
      iframe.style.zIndex = "9999";

      // Create close button
      var closeButton = document.createElement('button');
      closeButton.textContent = "x";
      closeButton.style.position = "absolute";
      closeButton.style.top = "100px";
      closeButton.style.right = "10px";
      closeButton.style.padding = "5px";
      closeButton.style.background = "rgba(0, 0, 0)";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "50%";
      closeButton.style.cursor = "pointer";
      closeButton.style.zIndex = "10000";
      closeButton.onclick = function () {
        document.body.removeChild(iframe);
        document.body.removeChild(closeButton);
      };

      // Append the iframe and close button to the body
      document.body.appendChild(iframe);
      document.body.appendChild(closeButton);
    }


    async function getTimeUntilArrival(latitude, longitude) {
      try {
        const response = await fetch(`/gettimeuntilarrival?lat=${latitude}&long=${longitude}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error getting time until arrival:', error);
        return null;
      }
    }


    // Function to format time until arrival
    function formatTimeUntilArrival(unixTime) {
      const hours = unixTime / 3600;

      if (hours < 1) {
        const minutes = Math.round(hours * 60);
        if (minutes % 15 === 0) {
          return `${minutes / 60} hours`;
        } else if (Math.ceil(hours) === 0) {
          return `Less than 15 minutes!`;
        } else {
          const quarters = Math.floor(minutes / 15);
          const fraction = (minutes % 15) / 60;
          return `${Math.round(hours)} hours`;
        }
      } else if (hours === 1) {
        return `1 hour`;
      } else {
        const wholeHours = Math.floor(hours);
        const remainingMinutes = Math.round((hours - wholeHours) * 60);

        // Determine the fraction of hours
        let fraction = '';
        if (remainingMinutes === 0) {
          fraction = `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'}`;
        } else if (remainingMinutes === 15) {
          fraction = `${wholeHours} 1/4 hours`;
        } else if (remainingMinutes === 30) {
          fraction = `${wholeHours} 1/2 hours`;
        } else if (remainingMinutes === 45) {
          fraction = `${wholeHours} 3/4 hours`;
        } else {
          // Find the nearest quarter-hour fraction
          const nearestQuarter = Math.round(remainingMinutes / 15);
          fraction = `${wholeHours} ${nearestQuarter}/4 hours`;
        }

        return fraction;
      }
    }

//future map.getzoom
    async function main() {
      try {
        // Get latitude and longitude from client's IP address
        const { latitude, longitude } = await getLatLongFromIPAddress();

        if (latitude && longitude) {
          // Get time until arrival from server
          const { nearestCity, timeUntilArrival } = await getTimeUntilArrival(latitude, longitude);
          localStorage.setItem('nearestcity', nearestCity);

          // Update HTML elements with the obtained information
          const arrivalInfoElement = document.getElementById('arrivalTime');
          if (timeUntilArrival >= 0) {
            arrivalInfoElement.innerText = `Santa will arrive in: ${formatTimeUntilArrival(timeUntilArrival)}`;
          } else {
            arrivalInfoElement.innerText = `Santa arrived ${formatTimeUntilArrival(-timeUntilArrival)} ago`;
          }
        } else {
          console.error('Latitude and longitude not available.');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
    // Call the main function initially
    main();

    // Call the main function every 15 minutes
    setInterval(main, 1000); // 900000 milliseconds = 15 minutes


    var url = new URL(window.location.href);
    var zoom = 6
    var zoom2
    var isPanning = true
    var map = L.map('map-container', {
      center: [-27.1127, -109.3497], // Center map at Easter Island coordinates
      zoom: 7,
      worldCopyJump: true, // Enable world copy jump
    });
    closeButton.addEventListener("click", () => {
      chatPopup.style.display = "none";
    });
    function startCountdown(targetDate) {
      const countdownButton = document.getElementById("countdownButton");
      const chatPopup = document.getElementById("chatPopup");
      // Calculate the target date for the countdown (the day before the specified day to 3 am)
      const targetTime = new Date(targetDate);
      targetTime.setDate(targetTime.getDate() - 1);
      targetTime.setUTCHours(8, 0, 0, 0); // 3 AM CDT is 8 AM UTC



      // Update the countdown every second
      const countdownInterval = setInterval(function () {
        const now = new Date(currentunixtimeinmiliseconds)
        const distance = targetTime.getTime() - now;

        if (distance < 0) {
          // If the countdown is over, display "Expired" or take any appropriate action
          clearInterval(countdownInterval);
          document.querySelectorAll('.flip-digit').forEach(digit => digit.textContent = '00');
        } else {
          // Calculate days, hours, minutes, and seconds
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          if (days <= 5) {
            countdownButton.style.display = "block";
          }
          if (days >= 6) {
            countdownButton.style.display = "none";
          }

          // Display the countdown
          document.getElementById("days").textContent = padNumber(days);
          document.getElementById("hours").textContent = padNumber(hours);
          document.getElementById("minutes").textContent = padNumber(minutes);
          document.getElementById("seconds").textContent = padNumber(seconds);
        }

        if (distance < 0) {
          clearInterval(timerInterval);
          countdownButton.style.display = "none";
        }
      }, 1000);
    }
    countdownButton.addEventListener("click", () => {
      chatPopup.style.display = "block";
    });
    // Function to handle SSE messages for live chat
    function handleChatSSE(event) {
      const data = JSON.parse(event.data); // Parse the JSON data
      let message = data.message; // Extract the message from the parsed data

      // Check if the message is "[object PointerEvent]" regardless of case
      if (message.toLowerCase() === "[object pointerevent]") {
        const randomNumber = Math.floor(Math.random() * 10000);
        message = "Anonymous User " + randomNumber + ":";
      }

      appendMessage(message); // Pass the modified or original message to appendMessage function
    }
    // Function to fetch the maximum number of presents
    async function getMaxPresents() {
      try {
        const response = await fetch('/getmaxpresents');
        const data = await response.json();
        return data.maxpresents;
      } catch (error) {
        console.error('Error fetching max presents:', error);
        return 0; // Return 0 in case of error
      }

    }

    // Function to fetch the current city index
    async function getCurrentCityIndex() {
      try {
        const response = await fetch('/getindex');
        const data = await response.json();
        return data.index;
      } catch (error) {
        console.error('Error fetching current city index:', error);
        return 0; // Return 0 in case of error
      }
    }

    // Function to update presents delivered every 10 milliseconds
    async function updatePresentsDelivered() {
      const maxPresents = await getMaxPresents();
      const currentIndex = await getCurrentCityIndex();

      let timeLeft = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      let presentsDelivered = (currentIndex / 1004) * maxPresents;


    }

    // Call the function to start updating presents delivered
    updatePresentsDelivered();
    var LOCATIONHID;
    // Function to check locationHid status and hide the element accordingly
    function checkLocationHid() {
      var locationHid = localStorage.getItem('locationHid');
      LOCATIONHID = (locationHid === 'true');

      // Get the reference to the element
      var hidelocation = document.getElementById('hidelocation');

      // Hide or show the element based on LOCATIONHID value
      if (LOCATIONHID) {
        hidelocation.style.display = 'none';
      } else {
        hidelocation.style.display = 'block';
      }
    }


    // Call the function initially to set the initial value of LOCATIONHID
    checkLocationHid();

    // Add event listener for storage changes
    window.addEventListener('storage', function (event) {
      if (event.key === 'locationHid') {
        checkLocationHid();
      }
    });



    // Function to start listening for SSE messages for live chat
    function startChatSSE() {
      // const eventSource = new EventSource("/livechat");
      // eventSource.onmessage = handleChatSSE;
    }

    // Function to send a message to the server
    function sendMessage(message) {
      fetch(`/chatsend?message=${encodeURIComponent(message)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to send message');
          }
        })
        .catch(error => {
          console.error('Error sending message:', error);
        });
    }

    // Function to append a message to the chat box
    function appendMessage(message) {
      const chatMessages = document.getElementById('chatMessages');
      const messageElement = document.createElement('div');
      messageElement.textContent = message; // Set the text content to the received message
      chatMessages.appendChild(messageElement);
    }


    // Function to handle the send button click event
    function handleSendButtonClick() {
      const userInput = document.getElementById('userInput');
      const message = userInput.value.trim();
      if (message !== '') {
        sendMessage(message);
        userInput.value = '';
      }
    }
    var iscurrentlydelivering = false;
    // Function to handle the close button click event
    function handleCloseButtonClick() {
      document.getElementById('chatPopup').style.display = 'none';
    }

    // Add event listeners
    document.getElementById('sendButton').addEventListener('click', handleSendButtonClick);
    document.getElementById('closeButton').addEventListener('click', handleCloseButtonClick);

    // Start listening for SSE messages
    startChatSSE();

    // Convert the zoom value to an integer (default to 2 if not provided)
    zoom2 = parseInt(zoom) || 2;

    var nobaskets = url.searchParams.get("nobaskets");
    if (nobaskets === "1") {
      console.log("NO BASKETS");
    } else {
      fetchBaskets(); // Fetch all baskets onload
    }
    if (zoom !== null && !isNaN(zoom2)) {
      map.setZoom(parseInt(zoom2));
    } else {
      //map.setZoom(6);
    }

    var santaMarker
    // Function to set the tile layer based on the value in local storage
    function setTileLayerFromLocalStorage() {
      var mapType = localStorage.getItem('mapType');
      var tileLayerUrl;
      var tileLayerOptions = {
        attribution: '&copy; <span id="year"></span> Master Bunny Tracker contributors',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      };

      // Determine the tile layer URL based on the mapType
      switch (mapType) {
        case 'satellite':
          tileLayerUrl = 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
          break;
        case 'hybrid':
          tileLayerUrl = 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
          break;
        case 'GeoportailFrance_orthos':
          tileLayerUrl = 'https://data.geopf.fr/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';
          break;
        case 'USGS_USImageryTopo':
          tileLayerUrl = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}';
          break;
        case 'Stadia_AlidadeSatellite':
          tileLayerUrl = 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg';
          break;
        case 'Water':
          tileLayerUrl = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
          break;
        default:
          tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
      }

      // Add the tile layer to the map
      L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(map);
    }





    // Call the function to set the tile layer based on local storage when the page loads
    window.onload = setTileLayerFromLocalStorage;

    // Listen for changes in local storage
    window.addEventListener('storage', function (event) {
      if (event.key === 'mapType') {
        // If the mapType changes, remove the existing tile layer and add the new one
        map.eachLayer(function (layer) {
          if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
          }
        });
        setTileLayerFromLocalStorage();
      }
    });


    // Function to get the last coordinates from the server and spawn Santa
    async function getLastCoordinatesAndSpawnSanta() {
      try {
        const response = await fetch("/getlastcords"); // Assuming the endpoint is relative to your server domain
        const data = await response.json();

        if (response.ok) {
          // If coordinates are available, spawn Santa at those coordinates
          spawnSanta(data.latitude, data.longitude);
          console.log("Santa spawned at last coordinates.");
        } else {
          // If no coordinates available, spawn Santa at default coordinates
          spawnSanta(83.6, 168);
          console.log("Santa spawned at default coordinates.");
        }
      } catch (error) {
        console.error("Error fetching last coordinates:", error);
      }
    }

    // Function to spawn Santa marker on the map
    function spawnSanta(latitude, longitude) {
      if (santaMarker) {
        // If Santa marker already exists, update its coordinates
        santaMarker.setLatLng([latitude + .5, longitude - .37]);
      } else {
        // If Santa marker doesn't exist, create a new marker
        santaMarker = L.marker([latitude + 0.5, longitude - 0.37], {
          icon: L.icon({
            iconUrl: 'https://github.com/Haydenlogs/sources/blob/main/image-removebg-preview%20(3).png?raw=true',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
          }),
          zIndexOffset: 99999999 // Set a very high zIndexOffset to ensure it's above everything
        }).addTo(map);

      }
    }

    // Call the function to get the last coordinates and spawn Santa
    getLastCoordinatesAndSpawnSanta();

    function updateTweenSpeedText(SPEED) {
      // Calculate the new speed
      //var newSpeed = Math.round(SPEED * 100000 + Math.floor(Math.random() * 1000000) + 1);
      var newSpeed = Math.round(SPEED * 500);
      // Format the speed with commas for thousands separators
      var formattedSpeed = newSpeed.toLocaleString();

      // Get the element with the ID 'tween-speed'
      var tweenSpeedElement = document.getElementById('tween-speed');

      if (stopped === false) {
        // If stopped is false, set the text content to "0 mph"
        tweenSpeedElement.textContent = "0 mph";
      } else {
        // If stopped is true, update the text content with the formatted speed
        tweenSpeedElement.textContent = formattedSpeed + " mph.";
      }

    }

    // Function to create a new snowflake
    function createSnowflake() {
      const snowflake = document.createElement('div');
      snowflake.textContent = '*'; // Snowflake character
      snowflake.style.position = 'absolute';
      snowflake.style.color = '#fff'; // White color for snowflake
      snowflake.style.fontSize = `${Math.random() * 20 + 10}px`; // Random size
      snowflake.style.left = `${Math.random() * window.innerWidth}px`; // Random horizontal position
      snowflake.style.top = '-10%'; // Start above the viewport
      snowflake.style.animationName = 'fall'; // Use animation for falling effect
      snowflake.style.animationDuration = `${Math.random() * 2 + 1}s`; // Random falling speed (faster)
      snowflake.style.animationTimingFunction = 'ease-in'; // Easing animation for more intense falling
      snowflake.style.opacity = `${Math.random()}`; // Random opacity
      snowflake.style.zIndex = "99999999999"

      document.body.appendChild(snowflake);

      // Remove snowflake from DOM after it has fallen out of view
      snowflake.addEventListener('animationend', () => {
        snowflake.remove();
      });
    }

    // Function to create a new confetti piece
    function createConfetti() {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722']; // Array of possible colors
      const confetti = document.createElement('div');
      confetti.textContent = '•'; // Using a dot for confetti shape
      confetti.style.position = 'absolute';
      confetti.style.color = colors[Math.floor(Math.random() * colors.length)]; // Random color from colors array
      confetti.style.fontSize = `${Math.random() * 20 + 10}px`; // Random size
      confetti.style.left = `${Math.random() * window.innerWidth}px`; // Random horizontal position
      confetti.style.top = '-10%'; // Start above the viewport
      confetti.style.animationName = 'fall'; // Use animation for falling effect
      confetti.style.animationDuration = `${Math.random() * 4 + 1}s`; // Random falling speed (1-5 seconds)
      confetti.style.animationTimingFunction = 'ease-out'; // Easing animation for more natural falling
      document.body.appendChild(confetti);

      // Remove confetti from DOM after it has fallen out of view
      confetti.addEventListener('animationend', () => {
        confetti.remove();
      });
    }

    // Function to start snow effect from 11 PM to 11 AM
    function startSnowEffect() {
      const snowInterval = setInterval(createSnowflake, 1); // Interval to create snowflakes every 100ms

      // Stop snow effect after 12 hours (adjust as needed)
      setTimeout(() => {
        clearInterval(snowInterval);
      }, 12 * 60 * 60 * 1000); // Stop after 12 hours (11 AM)
    }

    // Function to check current time and start confetti at midnight for 3 minutes
    function checkTimeAndStartConfetti() {
      const now = new Date(currentunixtimeinmiliseconds);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Check if current time is exactly 12:00 AM
      if (hours === 0 && minutes === 0) {
        console.log('It\'s 12:00 AM. Starting confetti effect!');
        startConfetti();

        // Stop confetti effect after 3 minutes
        setTimeout(() => {
          console.log('Stopping confetti effect after 3 minutes.');
          clearInterval(confettiInterval);
        }, 180000); // 3 minutes
      } else {
        console.log('Not 12:00 AM yet.');
        // Check again in one minute
        setTimeout(checkTimeAndStartConfetti, 60000);
      }
    }

    // Function to start the timed confetti effect
    function startConfetti() {
      const confettiInterval = setInterval(createConfetti, 1); // Interval to create confetti every 100ms

      // Stop creating confetti after 3 minutes
      setTimeout(() => {
        clearInterval(confettiInterval);
      }, 180000); // 3 minutes
    }


    // CSS-like animation keyframes directly in JavaScript
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            from {
                transform: translateY(-10%);
            }
            to {
                transform: translateY(100vh);
            }
        }
    `;
    document.head.appendChild(style);


    var lastUpdateTime = Date.now(currentunixtimeinmiliseconds)
    // Global variables to store tweening parameters
    // Global variables to store tweening parameters
    let tweeningInterval;
    let tweeningSteps = 10000; // Adjust the number of steps for smoother animation
    let GIFTSDELIVERED = 0;

    const symbolImage = document.getElementById('symbolImage');

    function toggleSymbol() {
      if (isPanning) {
        symbolImage.src = 'data:image/jpeg;base64,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';
        isPanning = false;
      } else {
        symbolImage.src = 'https://github.com/Haydenlogs/sources/blob/main/image_2024-07-15_102605601.png?raw=true';
        isPanning = true;
      }
    }

    let basketUpdateInterval;
    const basketElement = document.getElementById("basketsInfo");

    let currentCountry;
    let currentCount = 0; // Initial count

    function startBasketCounter(country, timeLeft, lastBasketCount, nextBasketCount) {
      // Only allow function to run again if a new city is being set
      if (currentCountry === country) return;

      // Update the current country
      currentCountry = country;

      // Clear any existing intervals
      clearInterval(basketUpdateInterval);

      // Convert all inputs to numbers
      timeLeft = Number(timeLeft);
      lastBasketCount = Number(lastBasketCount);
      nextBasketCount = Number(nextBasketCount);

      // Set the initial basket count
      currentCount = lastBasketCount;
      basketElement.textContent = currentCount.toLocaleString();

      const updateFrequency = 10; // Update every 100ms
      const totalUpdates = Math.ceil(timeLeft * 1000 / updateFrequency); // Total number of updates
      const increment = (nextBasketCount - lastBasketCount) / totalUpdates;

      function updateBasketCount() {
        if (iscurrentlydelivering === true) {
          timesamount = 1
        } else {
          timesamount = 1
        }
        if (currentCount < nextBasketCount) {
          currentCount += increment * timesamount;
          if (currentCount >= presentsdeliverednumber) {
            window.location.href = "/"
            source.close();
          }
          basketElement.textContent = Math.round(currentCount).toLocaleString();
        } else {
          // If we reach or exceed nextBasketCount, stop the interval
          clearInterval(basketUpdateInterval);
        }
      }

      // Start updating the basket count immediately
      updateBasketCount();

      // Continue updating every updateFrequency milliseconds
      basketUpdateInterval = setInterval(updateBasketCount, updateFrequency);
    }

    // Example usage:


    // Define the updatePresents function
    // Function to update the basket
    function updateBasket(presentsDelivered) {
      // Calculate the number of baskets based on presents delivered
      var basketsToUpdate = Math.floor(presentsDelivered / 1004);

      // Send the data to update presents
      updatePresents(basketsToUpdate);

      // Log the number of baskets updated
      console.log("Updated " + basketsToUpdate + " baskets");
    }

    // Function to simulate updating presents
    function updatePresents(basketsToUpdate) {
      // Here you would implement the logic to send data to update presents
      // For demonstration purposes, we're just logging the data
      console.log("Updating presents with " + basketsToUpdate + " baskets");
    }

    // Simulate presents delivery every 10 milliseconds
    var presentsDelivered = 0;
    var interval = setInterval(function () {
      // Increment the number of presents delivered
      presentsDelivered++;

      // Update the basket every 1004 presents
      if (presentsDelivered % 1004 === 0) {
        updateBasket(presentsDelivered);
      }

      // Stop simulation after 10,000 presents (for demonstration purposes)
      if (presentsDelivered === 10000) {
        clearInterval(interval);
        console.log("Simulation ended");
      }
    }, 10);
    // Initialize the number of baskets delivered by Santa
    // Initialize variables
    async function farmdata(data) {
      let lastCityBasketsDelivered = parseFloat(data.lastCity.basketsdelivered) || 0;
      let nextCityBasketsDelivered = parseFloat(data.nextCity.basketsdelivered) || 0;
      let totalBasketsDelivered = lastCityBasketsDelivered;
      let startTimeLeft = data.timeLeft;

      // Function to update total baskets delivered
      function updateTotalBasketsDelivered() {
        // Calculate the elapsed time since the start in seconds
        const elapsedTime = startTime - new Date(currentunixtimeinmiliseconds)

        // Update timeLeft based on the elapsed time
        const timeLeft = startTimeLeft - elapsedTime / 1000;

        // Calculate the progress
        const progress = 1 - timeLeft / data.timeLeft;

        // Calculate the total baskets to be delivered
        const basketsToDeliver = nextCityBasketsDelivered - lastCityBasketsDelivered;

        // Update the total baskets delivered based on the progress
        totalBasketsDelivered = lastCityBasketsDelivered + progress * basketsToDeliver;

        // Update the HTML element with the updated total baskets delivered
        //   document.getElementById('basketsInfo').textContent = Math.round(totalBasketsDelivered).toLocaleString();
      }


      // Update starting time left whenever data.currentCity.country changes
      let lastCountry = data.currentCity.country;
    }
    function handleSSE(event) {
      const eventData = JSON.parse(event.data);
      const currentCountry = eventData.currentCity.country;
      if (data.trackerended === true) {
        window.open("/")
      }
      // If the current country has changed, update the starting time left
      if (currentCountry !== lastCountry) {
        startTimeLeft = eventData.timeLeft;
        lastCountry = currentCountry;
      }
    }

    let previousNextCity = null;
    var iszoomedalready = false
    // Example usage:
    var zoomamount
    var moving = true;
    var maxpresents1 = fetchMaxPresents();
// Assuming you have debounce function defined elsewhere
// Example debounce function
function debounce(func, delay) {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(func, delay);
    };
}
let nextLatLng;
    function handleSSE(event) {
console.log(nextLatLng)
      // Parse the event data
      const data = JSON.parse(event.data);
      // Check if the tracker has ended
      if (data.trackerEnded === true) {
        // Call your function to execute when the tracker ends
        console.log("ENDED")
        yourFunctionToRunWhenTrackerEnds();
      }
      const flagImageUrl = getFlagImageUrl(data.nextCity.cc);
      console.log(flagImageUrl); // Output: https://countryflags.io/US/flat/64.png
      document.getElementById("flag").src = flagImageUrl
      const flagImageUrl2 = getFlagImageUrl(data.lastCity.cc);
      console.log(flagImageUrl2); // Output: https://countryflags.io/US/flat/64.png
      document.getElementById("flag2").src = flagImageUrl2
      startBasketCounter(data.nextCity.country + data.nextCity.city, data.timeLeft, data.lastCity.basketsdelivered, data.nextCity.basketsdelivered);
      function formatTime(seconds) {
        const years = Math.floor(seconds / (3600 * 24 * 365));
        seconds -= years * 3600 * 24 * 365;

        const days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;

        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        let timeString = '';
        if (years > 0) {
          timeString += `${years} year${years > 1 ? 's' : ''} `;
        }
        if (days > 0) {
          timeString += `${days} day${days > 1 ? 's' : ''} `;
        }
        if (hours > 0) {
          timeString += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        if (minutes > 0) {
          timeString += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        }
        if (seconds > 0) {
          timeString += `${seconds} second${seconds > 1 ? 's' : ''}`;
        }

        return timeString.trim();
      }
      if (data.lastCity.country === "pt") {
        setInterval(() => {
          const now = new Date(currentunixtimeinmiliseconds);
          const targetTime = new Date(now); // Initialize with current local time
          targetTime.setUTCHours(9, 0, 0, 0); // Set target time to 4:00 AM CDT (9:00 UTC)

          // Check if current time is after 4 AM CDT
          if (now.getUTCHours() >= 9) {
            // Current time is after 4 AM CDT, use the next day
            targetTime.setUTCDate(now.getUTCDate() + 1);
          }

          // Calculate time remaining until target time
          const timeRemaining = targetTime - now;
          if (timeRemaining < 0) return; // Stop countdown if target time is reached

          // Format the remaining time
          const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

          // Display the remaining time
          document.getElementById('launchTimer').textContent = hours.toString().padStart(2, '0') + ":" +
            minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
        }, 1000);



        // If timeleft is more than 1 hour, hide the elements
        document.getElementById('hideavailable').hidden = true;
        document.getElementById('launchID').hidden = false;
      } else {
        document.getElementById('hideavailable').hidden = false;
        document.getElementById('launchID').hidden = true;
      }
      function addCommaOrNot(inputString) {
        if (inputString.toLowerCase().includes("pt")) {
          return ""; // No comma if "pt" is found
        } else {
          return ","; // Add comma if "pt" is not found
        }
      }
      document.getElementById('nextCityInfo').textContent = data.nextCity ?
        (data.timeLeft <= parseInt(data.currentCity.Arrival_Stoppage_Time)
          ?
          (`${data.nextCity.city.replace(/^"(.*)"$/, '$1')}, ${data.nextCity.country.replace(/^"(.*)"$/, '$1')} in ${formatTime(data.timeLeft)}.`) :
          (data.nextCity.country.endsWith('"') ?
            (data.nextCity.country.includes('pt') ?
              `${data.nextCity.country.replace(/^"(.*)"$/, '$1')}` :
              `${data.nextCity.city.replace(/^"(.*)"$/, '$1')}, ${data.nextCity.country.replace(/^"(.*)"$/, '$1')} in ${formatTime(data.timeLeft)}.`)
            : `${data.nextCity.city.replace(/^"(.*)"$/, '$1')}, ${data.nextCity.country.replace(/^"(.*)"$/, '$1')} in ${formatTime(data.timeLeft)}.`))
        : "";


      if (data.timeLeft <= parseInt(data.currentCity.Arrival_Stoppage_Time)) {
        iscurrentlydelivering = true
        moving = false;
        stopped = false;
        // Check if the icon URL is not already set to the specified value
        if (santaMarker.options.icon.options.iconUrl !== 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2tuOW43cnV4a3ltbm9jZmxiNzcycTgycGl3anN2OHVhcG0wanp0NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/0z3sfa0imiLkBTxaFi/giphy.webp') {
          santaMarker.setIcon(L.icon({
            iconUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2tuOW43cnV4a3ltbm9jZmxiNzcycTgycGl3anN2OHVhcG0wanp0NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/0z3sfa0imiLkBTxaFi/giphy.webp', // Change to delivering.gif
            iconSize: [50, 50], // size of the icon
            iconAnchor: [25, 25] // point of the icon which will correspond to marker's location
          }));
        }
        // + .5-0.7319 - .37+0.3283
        santaMarker.setLatLng([data.nextCity.latitude, data.nextCity.longitude]);
      } else {
        iscurrentlydelivering = false
        stopped = true;
        moving = true;
        santaMarker.setIcon(L.icon({
          iconUrl: 'https://github.com/Haydenlogs/sources/blob/main/image-removebg-preview%20(3).png?raw=true', // Change to delivering.gif
          iconSize: [50, 50], // size of the icon
          iconAnchor: [25, 25] // point of the icon which will correspond to marker's location
        }));
        if (iszoomedalready === false) {
          iszoomedalready = true
        }

      }
      function getifitistrueorfalse(inputString) {
        if (inputString.toLowerCase() === "pt") {
          return false; // No comma if "pt" is found
        } else {
          return true; // Add comma if "pt" is not found
        }

      }

      timeleft2 = data.timeLeft
      document.getElementById('lastCityInfo').textContent = data.lastCity ? `${data.lastCity.city}${addCommaOrNot(data.lastCity.country)} ${removeQuotation(data.lastCity.country)}` : "";

      console.log(getifitistrueorfalse(data.lastCity.country))
      if (getifitistrueorfalse(data.lastCity.country) == false) {
        // If timeleft is more than 1 hour, hide the elements

        document.getElementById('hideavailable').style.display = 'none';
      } else {
        document.getElementById('hideavailable').style.display = 'block';
      }
      function removeQuotation(text) {
        // Check if the text ends with 'pt"'
        if (text.endsWith('pt')) {
          // Remove the last two characters ('pt')
          return text.slice(0, -2);
        } else {
          // Replace any quotation marks with an empty string
          return text.replace(/"/g, '');
        }
      }

      GIFTSDELIVERED = data.presentsDelivered;
      // Add basket to the map
      if (!nobaskets) {
        if (data.lastCity) {
          addBasket(data.lastCity);
        }
      }

      if (data.currentCity && data.nextCity && data.lastCity) {
        const currentLatLng = santaMarker.getLatLng(); // Get the current Santa location
        if (data.nextCity.city === "International Space Station") {
        // Debounced function to fetch new coordinates once
        const fetchNewCoordinates = debounce(() => {
            // Make a request to Open Notify or relevant API to get ISS coordinates
            // Example of fetching ISS coordinates from Open Notify (requires appropriate handling)
            fetch('http://api.open-notify.org/iss-now.json')
                .then(response => response.json())
                .then(data => {
                    // Extract latitude and longitude from the response
                    const { latitude, longitude } = data.iss_position;
                    nextLatLng = L.latLng(latitude, longitude);
                    // Now use nextLatLng as the new coordinates
                    // Ensure to update your application logic accordingly
                })
                .catch(error => console.error('Error fetching ISS coordinates:', error));
        }, 1000); // Adjust debounce delay as needed

        // Trigger the debounced function to fetch coordinates once
        fetchNewCoordinates();
    } else {
        // Use provided next city coordinates if not ISS
        nextLatLng = L.latLng(data.nextCity.latitude, data.nextCity.longitude);
    }
        const latDiff = nextLatLng.lat - currentLatLng.lat;
        const lngDiff = nextLatLng.lng - currentLatLng.lng;

        const originalDistance = Math.sqrt(latDiff ** 2 + lngDiff ** 2);
        const distance = originalDistance * 1; // Doubling the original distance

        const tweeningDuration = data.timeLeft * 1000 - data.nextCity.Arrival_Stoppage_Time; // Convert time left to milliseconds

        const steps = tweeningSteps; // Total number of steps

        const latStep = ((latDiff) / steps) * 5;
        const lngStep = ((lngDiff) / steps) * 5;

        let stepCount = 0;
        const currentNextCity = data.nextCity;
        if (JSON.stringify(currentNextCity) !== JSON.stringify(previousNextCity)) {
          // Next city has changed, perform actions here
          console.log('Next city has changed');
          previousNextCity = currentNextCity;
          lastUpdateTime = new Date(currentunixtimeinmiliseconds)
        }

        // Clear any existing tweening interval
        clearInterval(tweeningInterval);

        // Start tweening interval
        tweeningInterval = setInterval(() => {
          const SPEED = Math.sqrt(latStep ** 2 + lngStep ** 2) * (1000000 / (tweeningDuration / steps));
          updateTweenSpeedText(SPEED);
          if (stepCount >= steps) {
            clearInterval(tweeningInterval);
          } else {
            if (moving === true) {
              const newLat = currentLatLng.lat + latStep * stepCount;
              const newLng = currentLatLng.lng + lngStep * stepCount;
              const newLatLng = L.latLng(newLat, newLng);
              santaMarker.setLatLng(newLatLng);

              stepCount++;

              // Update tween speed text
            }
          }

        }, tweeningDuration / steps); // Adjust timing based on calculated duration
      }




      var basketsDelivered = data.nextCity.basketsdelivered; // Assuming data.nextCity.basketsdelivered is a number or can be parsed as one

      // Check if basketsDelivered is a valid number
      if (!isNaN(parseFloat(basketsDelivered)) && isFinite(basketsDelivered)) {
        // Convert to number and then format with commas

        var formattedBaskets = parseFloat(basketsDelivered).toLocaleString();
        //  document.getElementById('basketsInfo').textContent = formattedBaskets;
      } else {
        //  document.getElementById('basketsInfo').textContent = "";
      }



      var debounce2 = false;
      let zoomExecuted = false;
      // Calculate the number of baskets to add per millisecond




    }


    async function fetchMaxPresents() {
      try {
        const response2 = await fetch('/getmaxpresents');
        if (!response2.ok) {
          throw new Error('Failed to fetch max presents');
        }
        const data2 = await response.json();
        console.log(data2.maxpresents)
        // Return the maxpresents value from the response
        return data2.maxpresents;
      } catch (error) {
        console.error('Error fetching max presents:', error);
        return null;
      }
    }


    // Check if intervalDuration is already set in localStorage
    let intervalDuration = localStorage.getItem('intervalDuration');

    // If not set, default it to 75
    if (!intervalDuration) {
      intervalDuration = 75;
      localStorage.setItem('intervalDuration', intervalDuration);
    } else {
      intervalDuration = parseInt(intervalDuration); // Parse to integer if retrieved from localStorage
    }




    // Start interval
    panningInterval = setInterval(() => {
      console.log(isPanning)
      if (isPanning === true) {
        // Get Santa marker's current position
        var santaLatLng = santaMarker.getLatLng();

        // Calculate the new target position just above the Santa marker
        var targetLatLng = L.latLng(santaLatLng.lat, santaLatLng.lng);

        // Smoothly pan to the target position
        map.panTo(targetLatLng);
      }
    }, intervalDuration);



    /*// Start listening for SSE messages
    const eventSource = new EventSource("/updates");
    eventSource.onmessage = handleSSE;
    source = eventSource
    */// Define an array to store the coordinates of already placed baskets
    const placedBaskets = [];
    function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}
    function addBasket(cityInfo) {
      if (cityInfo.country !== "pt") {


      // Check if the coordinates are already present in the placedBaskets array
      const isAlreadyPlaced = placedBaskets.some(coords => coords[0] === cityInfo.latitude && coords[1] === cityInfo.longitude);

      // If the basket is already placed at these coordinates, do not add it again
      if (isAlreadyPlaced) {
        console.log('Basket already placed at these coordinates');
        return;
      }

      // Create a marker for the basket
      const basketMarker = L.marker([cityInfo.latitude, cityInfo.longitude], {
        icon: L.divIcon({
          className: 'basket-icon',
          iconSize: [50, 50], // size of the icon
          iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
          html: '<img src="https://github.com/Haydenlogs/sources/blob/main/comhiclipartydzgx-removebg-preview.png?raw=true" width="50px" height="50px">'
        })
      }).addTo(map);

      // Add the coordinates to the placedBaskets array
      placedBaskets.push([cityInfo.latitude, cityInfo.longitude]);

      // Convert unix arrival time to a readable format
      const arrivalTime = new Date(cityInfo.unixdeparture * 1000).toLocaleString();


// Function to truncate the Wikipedia attribute if it exceeds 60 characters
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

// Function to round the weather data to three decimal places
function roundToThreeDecimalPlaces(value) {
  return parseFloat(value).toFixed(1);
}

// Function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

// Create Wikipedia link (description) and attribute (link)
const wikipediaLink = cityInfo.Wikipedia_attr;
const wikipediaAttribute = cityInfo.wikipedia_link;

let weatherdata;
if (cityInfo.weather) {
  const roundedCelsius = roundToThreeDecimalPlaces(cityInfo.weather.temperature);
  const roundedFahrenheit = roundToThreeDecimalPlaces(celsiusToFahrenheit(cityInfo.weather.temperature));
  weatherdata = `
    <strong>Weather:</strong> ${roundedCelsius}&#176; Celsius (${roundedFahrenheit}&#176; Fahrenheit)<br/>
    ${cityInfo.weather.description.toUpperCase()}
  `;
} else {
  weatherdata = `Weather data is not available yet. Come back later for weather data.`;
}

// Truncate Wikipedia attribute if necessary
let truncatedWikipediaAttribute = truncateText(wikipediaAttribute, 60);

// Bind a popup to the marker with city, country, arrival time, Wikipedia link, and Wikipedia attribute
basketMarker.bindPopup(`
  <div style="font-family: Arial, sans-serif; padding: 10px;">
    <div style="display: flex; align-items: center;">
      <img src="${getFlagImageUrl(cityInfo.cc)}" id="flag5" width="20px;" style="margin-right: 10px;">
      <b>${cityInfo.city}, ${cityInfo.country}</b>
    </div>
    <div style="margin-top: 5px;">
      <strong>Arrival Time:</strong> ${arrivalTime}
    </div>
    <div style="margin-top: 5px;">
      <a href="${wikipediaLink}" target="_blank" style="color: #007BFF; text-decoration: none;">${truncatedWikipediaAttribute}</a>
    </div>
    <div style="margin-top: 5px;">
      ${weatherdata}
    </div>
  </div>
`);



      // Open popup on marker click
      basketMarker.on('click', function () {
        this.openPopup();
      });
    }

  }

    // Function to fetch all baskets from the server
    async function fetchBaskets() {
      try {
        const response = await fetch("/getbaskets");
        const data = await response.json();
        console.log("Response data:", data); // Log the response data
        data.forEach((basket) => {
          addBasket(basket);
        });
      } catch (error) {
        console.error("Error fetching baskets:", error);
      }
    }
    document.addEventListener("DOMContentLoaded", function () {
      const popupContainer = document.getElementById("popup-container");
      const closeBtn = document.getElementById("close-btn");

      // Check if the popup was closed before
      const popupClosed = localStorage.getItem("popupClosed");

      if (!popupClosed) {
        // If the popup was never closed, show it
        popupContainer.classList.remove("hidden");
      }

      // Close the popup when close button is clicked
      closeBtn.addEventListener("click", function () {
        popupContainer.classList.add("hidden");
        // Store in local storage that popup was closed
        localStorage.setItem("popupClosed", "true");
      });
    });
    // Function to toggle settings popup visibility
    function toggleSettings() {
      var settingsPopup = document.getElementById('settingsPopup');
      if (settingsPopup.style.display === 'block') {
        settingsPopup.style.display = 'none';
      } else {
        settingsPopup.style.display = 'block';
      }
    }
    // Function to handle incoming SSE events
    function handleSSEEvent3(event) {
      const announcement = JSON.parse(event.data);

      const announcementContainer = document.getElementById('announcementContainer');
      const announcementMessage = document.getElementById('announcementMessage');
      const announcementDetails = document.getElementById('announcementDetails');

      // Display the announcement message
      announcementMessage.textContent = announcement.message;

      // Display the announcement details
      let detailsText = ``;
      if (announcement.country) {
        detailsText += `, Country: ${announcement.country}`;
      }
      if (announcement.targetIp) {
        detailsText += `, Target IP: ${announcement.targetIp}`;
      }
      announcementDetails.textContent = detailsText;

      // Show the announcement container
      announcementContainer.style.display = 'block';

      // Close the announcement after the specified time
      setTimeout(() => {
        announcementContainer.style.display = 'none';
      }, announcement.time * 1000); // Convert time to milliseconds
    }


    // Event listener for SSE events
    // const eventSource3 = new EventSource('/getliveannouncements');
    // eventSource3.addEventListener('message', handleSSEEvent3);

    console.log(source)
    function yourFunctionToRunWhenTrackerEnds() {
      console.log("ENDED")
      source.close();
      window.location.href = "/"
    }