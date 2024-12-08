window.onload = function () {
      // Function to make a GET request to /visitsite endpoint
      function getVisits() {
        fetch('/visitsite')
          .then(response => response.json())
          .then(data => {
            console.log('Number of people on the site:', data.peopleonthesite);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }

      // Call the getVisits function when the page loads
      getVisits();
    }
    // Parse the URL to get the value of the "level" parameter
    var url = new URL(window.location.href);
    var level = url.searchParams.get("zoom");
    var level2 = url.searchParams.get("nobaskets");

    // Get the iframe element
    var iframe = document.getElementById("iframe");

    // Construct the new source URL for the iframe with the level and level2 parameters
    var newSrc = "/en-us/embed/map?zoom=" + level + "&nobaskets=" + level2;
    // Function to toggle settings popup visibility
    function toggleSettings() {
      var settingsPopup = document.getElementById('settingsPopup');
      if (settingsPopup.style.display === 'block') {
        settingsPopup.style.display = 'none';
      } else {
        settingsPopup.style.display = 'block';
      }
    }
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
function getTimeFromUnix(unixTimeMillis, offsetMillis) {
  const adjustedTime = new Date(unixTimeMillis + offsetMillis); // Add the offset
  const hours = adjustedTime.getUTCHours();
  const minutes = adjustedTime.getUTCMinutes();
  const seconds = adjustedTime.getUTCSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return {
    hours: ((hours % 12) || 12).toString().padStart(2, '0'), // Convert to 12-hour format
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    ampm
  };
}


function updateTimeDisplays() {
  const localOffsetMillis = new Date().getTimezoneOffset() * -60 * 1000; // Local offset in ms
  const local = getTimeFromUnix(currentunixtimeinmiliseconds, localOffsetMillis);
  const utc = getTimeFromUnix(currentunixtimeinmiliseconds, 0); // UTC = no offset
  const london = getTimeFromUnix(currentunixtimeinmiliseconds, 0); // London = same as UTC
  const nyc = getTimeFromUnix(currentunixtimeinmiliseconds, -5 * 60 * 60 * 1000); // NYC = UTC-5
  const tokyo = getTimeFromUnix(currentunixtimeinmiliseconds, 9 * 60 * 60 * 1000); // Tokyo = UTC+9

  document.getElementById('local-time').textContent =
    `${local.hours}:${local.minutes}:${local.seconds} ${local.ampm} LOCAL`;
  document.getElementById('utc-time').textContent =
    `${utc.hours}:${utc.minutes}:${utc.seconds} ${utc.ampm} UTC/GMT`;
  document.getElementById('london-time').textContent =
    `${london.hours}:${london.minutes}:${london.seconds} ${london.ampm} LONDON`;
  document.getElementById('nyc-time').textContent =
    `${nyc.hours}:${nyc.minutes}:${nyc.seconds} ${nyc.ampm} NYC`;
  document.getElementById('tokyo-time').textContent =
    `${tokyo.hours}:${tokyo.minutes}:${tokyo.seconds} ${tokyo.ampm} TOKYO`;
}


// Fetch initial time and start updates
fetchUnixTime().then(() => {
  setInterval(updateTimeDisplays, 1000);
});



    var readyfordeployment = false
    // Update local time, UTC time, London time, New York City time, and Tokyo time every second
    

    setTimeout(function () {
      document.getElementById("logo").classList.add("spread");
      document.getElementById("loading").classList.add("show");
    }, 1000);

    setTimeout(function () {
      document.getElementById("logo").style.display = "none";
      document.getElementById("loading").style.display = "none";
      document.getElementById("iframe").style.visibility = "visible";
      document.getElementById("srcimg").style.display = "none";
            document.getElementById("iframe").style.opacity = 1;
      readyfordeployment = true
    }, 3000); // Adjust the timing as needed

        // Assuming you want to send a GET request to "/hit/"
   // Replace with your IP geolocation API endpoint
const ipapiUrl = '/ip-info'; // ipapi endpoint

// Function to fetch IP and country, then send a hit
async function fetchIpAndSendHit() {
  try {
    // Step 1: Get IP and country
    const ipResponse = await fetch(ipapiUrl);
    if (!ipResponse.ok) {
      throw new Error('Failed to fetch IP information');
    }

    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    const country = ipData.country_code; // Or ipData.country_name for country name

    console.log(`IP: ${ip}, Country: ${country}`);

    // Step 2: Send hit with number and country
    const hitResponse = await fetch(`/hit/1?country=${country}`);
    if (!hitResponse.ok) {

      throw new Error('Failed to send hit');
    }

    // Handle successful response
    console.log('Hit sent successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to perform the operations
fetchIpAndSendHit();