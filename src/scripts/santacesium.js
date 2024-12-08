
var url = new URL(window.location.href);
let placedBaskets = [];
let power;
let power2;
let startallowed = false;
let trackeneityenabled = true;
let alastthestop5;
let hereyecomesthestop5;
let allowedtotrackedentity = false;
let iscurrentlydelivering = true;
let allowedtohead = false;
let imageData;
let lastcitystopped;
let isrollingrandomly = false;
let isheadingchanging = false;
let prog1set = false;
let lastcitysantavillage = false;
let roll = 0;
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
(async function () {
  try {
    const response = await fetch('https://temp.master-trackers.xyz/images');

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    imageData = await response.json();
    //// console.log('Data loaded:', imageData);
  } catch (error) {
    console.error('Error fetching the JSON:', error);

    warnuserError("Error", "There was an error getting the route images.")
  }
})();

//// console.log(imageData)
var timeLeftValue = 0;
let presentsdeliverednumber;
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
      const response = await fetch('https://ipapi.co/json/');
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

      warnuserError("Error", "There was an error getting data for the arrival time.")
      return null;
    }
  }
}

// Function to handle Cesium Ion errors
function handleCesiumIonError(error) {
  console.error('Cesium Ion Error:', error); // Log the error message
  // Stop rendering or handle the error gracefully
  if (viewer) {
    location.reload()
  }
}
// Function to toggle settings popup visibility
function toggleSettings() {
  var settingsPopup = document.getElementById('settingsPopup');
  if (settingsPopup.style.display === 'block') {
    settingsPopup.style.display = 'none';
  } else {
    settingsPopup.style.display = 'block';
  }
}
function getFlagImageUrl(countryCode) {
  // Check if countryCode starts with 'http://' or 'https://'
  if (countryCode.startsWith('http://') || countryCode.startsWith('https://')) {
    return countryCode;  // Return the link itself
  } else {
    return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;  // Otherwise, return flag image URL
  }
}
let basketUpdateInterval;
const basketElement = document.getElementById("basketsInfo");

let currentCountry;
let currentCount = 0; // Initial count

function startBasketCounter(timeLeft, lastBasketCount, nextBasketCount) {


  // Convert all inputs to numbers
  timeLeft = Number(timeLeft);
  lastBasketCount = Number(lastBasketCount);
  nextBasketCount = Number(nextBasketCount);

  // console.log(timeLeft + lastBasketCount + nextBasketCount);

  // Object to hold the animated count
  let countObject = { count: lastBasketCount };

  TweenLite.to(countObject, timeLeft, {
    count: nextBasketCount, // Animate from lastBasketCount to nextBasketCount
    ease: power2, // Ensure linear progression over time
    onUpdate: function () {
      // Update the displayed count using countObject's count property
      basketElement.textContent = Math.round(countObject.count).toLocaleString();
    },
    onComplete: function () {
      // console.log('Basket counter complete');
    }
  });

}

function yourFunctionToRunWhenTrackerEnds() {
  //// console.log("ENDED")
  source.close();
  window.location.href = "/"
}

// Set your Cesium Ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyM2Q1MWUyYS1kMDcxLTRmNmEtOWEwNC0wZTE4MjgzNmIyYWMiLCJpZCI6MTk2NTMyLCJpYXQiOjE3MDgzNzQ0NzJ9.GEf0dmAehNxx5LwDn4vzMd-XuwXVgAFXxvHB6IwUKNc';
// Define the baselayer with Bing Maps Hybrid

var viewer = new Cesium.Viewer('cesiumContainer', {

  terrain: Cesium.Terrain.fromWorldTerrain({
    requestWaterMask: true,
  }),
  skyAtmosphere: false,
  baseLayerPicker: false, // Disable default base layer picker if you only want this base layer

  shouldAnimate: true // Ensure animations are on

  /*  clockViewModel: new Cesium.ClockViewModel(new Cesium.Clock({
     startTime: Cesium.JulianDate.now(),
     currentTime: Cesium.JulianDate.now(),
     stopTime: Cesium.JulianDate.addDays(Cesium.JulianDate.now(), 1, new Cesium.JulianDate()),
     clockRange: Cesium.ClockRange.LOOP_STOP, // Loop at the end
     clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
     multiplier: 1, // Real-time
     shouldAnimate: true
   })),
    */
});
// Google Maps Hybrid Tile Provider URL template
const googleMapsHybridUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

// Set Google Maps Hybrid as the default imagery layer
viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
  url: googleMapsHybridUrl
}));
// adjust time so scene is lit by sun
viewer.clock.currentTime = Cesium.JulianDate.now()
// Create the custom skybox
const skyBox = new Cesium.SkyBox({
  sources: {
    positiveX: '/assets/black.png',
    negativeX: '/assets/black.png',
    positiveY: '/assets/black.png',
    negativeY: '/assets/black.png',
    positiveZ: '/assets/black.png',
    negativeZ: '/assets/black.png'
  }
});
// Variables to store current position and target position
var currentLatitude = 83.6;
let citylocation213;
var currentLongitude = 168;
var targetLatitude = 0;
var targetLongitude = 0;

// Function to generate random latitude and longitude
function getRandomCoordinates() {
  const lat = Math.random() * 180 - 90; // Latitude between -90 and 90
  const lon = Math.random() * 360 - 180; // Longitude between -180 and 180
  return { lat, lon };
}

// Add an entity with a 3D model positioned above the Earth's surface
var santa2 = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), // 100 km above the surface
  id: "santa2",
  model: {
    uri: '/assets/againsanta.gltf',
    scale: 0.6 // Smaller scale
  },
  orientation: Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), new Cesium.HeadingPitchRoll(0, 0, 0))
});
// Add an entity with a 3D model positioned above the Earth's surface
var santa = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), // 100 km above the surface
  id: "santa",
  model: {
    uri: '/assets/invisible.glb',
    scale: 0.6 // Smaller scale
  },
  orientation: Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), new Cesium.HeadingPitchRoll(0, 0, 0))
});
santa.allowPicking = false;
santa2.allowPicking = false;
let alreadydone2 = false;
let pitch = 0;
let angle = 0;




let debounceTimeout;
function updaterollrandomly(timeleft, targetlatlong, string) {
  if (debounceTimeout && lastcitysantavillage == false) {
    return; // Prevent running if already debounced
  }

  // Check if the string contains any of the five least common letters in English
  const uncommonLetters = /[zqxjk]/i;
  const containsUncommonLetter = uncommonLetters.test(string);

  debounceTimeout = setTimeout(() => {
    const targetPosition = Cesium.Cartesian3.fromDegrees(targetlatlong[1], targetlatlong[0]);
    const currentPosition = santa.position.getValue(Cesium.JulianDate.now());

    const geodesic = new Cesium.EllipsoidGeodesic(
      Cesium.Cartographic.fromCartesian(currentPosition),
      Cesium.Cartographic.fromCartesian(targetPosition)
    );
    const targetHeading = geodesic.startHeading;

    const currentOrientation = Cesium.HeadingPitchRoll.fromQuaternion(santa.orientation.getValue(Cesium.JulianDate.now()));
    const currentHeading = currentOrientation.heading - (Math.PI / 2);

    // Calculate the shortest rotation direction
    let headingDifference = targetHeading - currentHeading;
    if (headingDifference > Math.PI) {
      headingDifference -= 2 * Math.PI;
    } else if (headingDifference < -Math.PI) {
      headingDifference += 2 * Math.PI;
    }

    // Set rotation direction (-1 for left, 1 for right)
    const direction = headingDifference < 0 ? -1 : 1;

    // Define max rotation value
    const maxRotation = 0.002;
    const rotationAmount = containsUncommonLetter ? maxRotation * direction : (Math.random() * maxRotation) * direction;


  }, 0); // Set timeout to 0 for immediate execution
}


const frequency = 1; // Frequency of oscillation in Hz
const amplitude = 0.09; // Amplitude of the oscillation
function up() {
  TweenLite.to({ progress: -amplitude }, 5, {
    progress: amplitude,
    ease: Power1.easeInOut,
    onUpdate: function () {
      pitch = this.target.progress
    },
    onComplete: function () {
      down()
    }
  })

}
function down() {
  TweenLite.to({ progress: amplitude }, 5, {
    progress: -amplitude,
    ease: Linear.easeInOut,
    onUpdate: function () {
      pitch = this.target.progress
    },
    onComplete: function () {
      up()
    }
  })

}
up()


// Configure the clock to loop continuously
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.multiplier = 1;
viewer.clock.shouldAnimate = true;
const scene = viewer.scene;
/*
// Create a BillboardCollection for the particles
// Function to update particle position with random colors
function updateParticles(particle, dt) {
  particle.color = Cesium.Color.fromRandom({ alpha: 1.0 });
}
// Function to create particle system
function createParticleSystem() {
  return new Cesium.ParticleSystem({
      image: '/assets/sparkle.png', // Ensure you have a particle image
      startColor: Cesium.Color.RED.withAlpha(0.7),
      endColor: Cesium.Color.BLUE.withAlpha(0.3),
      startScale: 1.0,
      endScale: 0.0,
      minimumParticleLife: 0.3, // Shorter lifetime
      maximumParticleLife: 0.3, // Shorter lifetime
      minimumSpeed: 1.0,
      maximumSpeed: 4.0,
      emissionRate: 100.0,
      imageSize: new Cesium.Cartesian2(25.0, 25.0),
      lifetime: 5.0,
      emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)), // Spread in an outward cone
      updateCallback: updateParticles,
  });
}

// Create and attach the particle system to the model
const particleSystem = createParticleSystem();
scene.primitives.add(particleSystem);

// Update the particle system's position to follow the model
viewer.clock.onTick.addEventListener(() => {
  const position = santa.position.getValue(viewer.clock.currentTime);
  particleSystem.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
});
/* 
// Snow parameters
const snowParticleSize = 3.0;
const snowRadius = 100000.0;
const minimumSnowImageSize = new Cesium.Cartesian2(
    snowParticleSize,
    snowParticleSize
);
const maximumSnowImageSize = new Cesium.Cartesian2(
    snowParticleSize * 2.0,
    snowParticleSize * 2.0
);

let snowGravityScratch = new Cesium.Cartesian3();
const snowUpdate = function (particle, dt) {
    snowGravityScratch = Cesium.Cartesian3.normalize(
        particle.position,
        snowGravityScratch
    );
    Cesium.Cartesian3.multiplyByScalar(
        snowGravityScratch,
        Cesium.Math.randomBetween(-30.0, -30.0),
        snowGravityScratch
    );
    particle.velocity = Cesium.Cartesian3.add(
        particle.velocity,
        snowGravityScratch,
        particle.velocity
    );
    const distance = Cesium.Cartesian3.distance(
        scene.camera.position,
        particle.position
    );
    
        particle.endColor.alpha = 1.0 / (distance / snowRadius + 1.1);
    
};

function startSnow() {
    
    const snowSystem = new Cesium.ParticleSystem({
        modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position),
        minimumSpeed: -1.0,
        maximumSpeed: 0.0,
        lifetime: 4.0,
        emitter: new Cesium.SphereEmitter(snowRadius),
        startScale: 3,
        endScale: 1.0,
        image: "/assets/sparkle.png",
        emissionRate: 2000.0,
        startColor: Cesium.Color.WHITE.withAlpha(1.0),
        endColor: Cesium.Color.WHITE.withAlpha(1.0),
        minimumImageSize: minimumSnowImageSize,
        maximumImageSize: maximumSnowImageSize,
        updateCallback: snowUpdate,
    });
    scene.primitives.add(snowSystem);

    let position = santa.position.getValue(Cesium.JulianDate.now());

    viewer.clock.onTick.addEventListener(() => {
      const position = santa.position.getValue(viewer.clock.currentTime);
      snowSystem.modelMatrix = Cesium.Matrix4.fromTranslation(position);
    });
}
startSnow()
// Gravity function to make particles fall
function applyGravity(particle, dt) {
  const gravity = -9.8;
  particle.velocity.y += gravity * dt;
}*/


let currentPos
let heading;

let hasRun1234124514 = false;
// let santaorientation = Cesium.Transforms.headingPitchRollQuaternion(santa.position.getValue(Cesium.JulianDate.now()), new Cesium.HeadingPitchRoll(0, 0, 0));
if (allowedtotrackedentity === true && trackeneityenabled === true) {
  viewer.trackedEntity = santa;
}
var allowedtofly2 = true;
var validStepSize;

var time12983748923714 = 0;
function startValidStepSize() {
  setInterval(() => {
    time12983748923714++
  }, 1000);

}

let isrollingnow = false;
let isTweening = false;
let allowedtoroll = true;
var prog1 = 0;
let ishead1 = false;
// Update the camera orientation periodically
let hasRun1515 = false; // Flag to track if the code has been executed
function flyToSanta(lat, lng, time, city, lng2, lat2, elv1, elv2) {

  //// console.log("FLYING")
  if (typeof time !== 'number' || time <= 0) {
    console.error('Invalid time value');
    return;
  }
  // console.log(alastthestop5)
  if (
    city.includes("z") || city.includes("k") || city.includes("q") || city.includes("x") || city.includes("j")
  ) {
    if (
      alastthestop5.includes("z") || alastthestop5.includes("k") || alastthestop5.includes("j") || alastthestop5.includes("q") || alastthestop5.includes("x")
    ) {
      power = Power1.easeInOut; // Both city and alastthestop5 include at least one letter
      power2 = Power2.easeInOut; // Both city and alastthestop5 include at least one letter
    } else {
      power = Power1.easeOut; // Only city includes at least one letter
      power2 = Power2.easeOut; // Both city and alastthestop5 include at least one letter
    }
  } else if (
    alastthestop5.includes("z") || alastthestop5.includes("k") || alastthestop5.includes("j") || alastthestop5.includes("q") || alastthestop5.includes("x")
  ) {
    power = Power1.easeIn; // Only alastthestop5 includes at least one letter
    power2 = Power2.easeIn; // Both city and alastthestop5 include at least one letter
  } else {
    power = Linear.easeNone; // Neither includes any of the specified letters
    power2 = Linear.easeNone; // Both city and alastthestop5 include at least one letter
  }


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

  var citylocation = city
  var start = Cesium.JulianDate.now(); // Current time
  var stop = Cesium.JulianDate.addSeconds(start, time, new Cesium.JulianDate()); // Time after the specified duration

  // Calculate the total number of steps based on the desired frequency (e.g., 60 steps per second)
  var totalSteps = time * 60;
  var totalSteps2;
  var posStepCounter = 0; // New step counter for currentPos
  var hasPosCounterStarted = false; // Flag to track when posStepCounter starts

  // Calculate the start and end positions
  var startPos = Cesium.Cartographic.fromDegrees(lng2, lat2, elv2 * 40000);
  var endPos = Cesium.Cartographic.fromDegrees(lng, lat, elv1 * 40000);

  // Create a geodesic path between the start and end positions
  var geodesic = new Cesium.EllipsoidGeodesic(startPos, endPos);
  // Initialize the orientation to 0
  var geodesic2;
  var i = 0; // Initialize step counter
  if (!hasRun1515) {

    heading = (geodesic.startHeading + (Math.PI + (Math.PI / 2)) + (Math.PI / 365) * 2);
    hasRun1515 = true; // Set the flag to true after execution
  }
  let debounce124124 = false
  // Update Santa's position at regular intervals
  var intervalId = setInterval(function () {

    if (i > totalSteps) {
      clearInterval(intervalId); // Stop the interval when the time has elapsed
    } else {
      if (city === citylocation213) {
        // Calculate the current step size, making it smaller as the time decreases
        var currentStepSize = i / totalSteps;
        /* var now = Cesium.JulianDate.now();
         var timeElapsed = Cesium.JulianDate.secondsDifference(now, start); // Time passed since start
         var timeFraction = timeElapsed / time; // Fraction of the total time
         //var validStepSize = 1 - currentStepSize;
         if (timeFraction >= 1) {
           // If time has elapsed, finalize position
           currentPos = endPos;
           clearInterval(intervalId); // Stop the interval
         } else {
           // Interpolate position along the geodesic based on time fraction
           currentPos = geodesic.interpolateUsingFraction(timeFraction);
         }
 */
        function updateHeading2(progress) {
          // Turn left (negative direction)
          heading = progress;
          //  updateCameraOrientation(-headingIncrement)

        }
        function updateroll2(progress) {
          // Turn left (negative direction)
          roll = progress;
          //  updateCameraOrientation(-headingIncrement)

        }
        function resetroll2() {
          TweenLite.to({ progress: roll }, 1, {
            progress: 0,
            ease: Linear.ease,
            onUpdate: function () {
              updateroll2(this.target.progress)
            },
            onComplete: function () {
              isrollingnow = false

            }
          })
        }
        // Function to update positions based on tween progress
        function updatePosition(progress) {
          // Interpolate position based on progress (0 to 1)
          var currentPos = geodesic.interpolateUsingFraction(progress);

          // Ensure currentPos is defined
          if (!currentPos) {
            console.error('currentPos is undefined at progress:', progress);
            return; // Exit if currentPos is undefined
          }

          // Convert to Cartesian coordinates with a fixed altitude of 15,080 meters (10 km above the surface)
          var cartesianPosition = Cesium.Cartesian3.fromRadians(
            currentPos.longitude,
            currentPos.latitude,
            15020 // Altitude in meters
          );
          // Convert to Cartesian coordinates with a fixed altitude of 15,080 meters (10 km above the surface)
          var cartesianPosition2 = Cesium.Cartesian3.fromRadians(
            currentPos.longitude,
            currentPos.latitude,
            15000 // Altitude in meters
          );

          // Update positions of Santa and overlays
          santa.position = cartesianPosition;
          santa2.position = cartesianPosition2; // Update second Santa model if necessary
          santaOverlay.position = cartesianPosition; // Update overlay position if needed
        }
        if (!isTweening) {
          isTweening = true
          if (prog1set === true) {

            prog1 = 0;
          }
          // Start the tween animation
          // console.log("TWEEN STARTING");
          allowedtoroll = false;
          TweenLite.to({ progress: prog1 }, time, {
            progress: 1, // Animate from 0 to 1
            ease: power, // Ensure linear progression over time
            onUpdate: function () {
              if (ishead1 === false) {
                const targetPosition3 = Cesium.Cartographic.fromDegrees(lng, lat, elv1 * 40000);
                const currentCartesian3 = santa.position.getValue(Cesium.JulianDate.now());
                const currentPosition3 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(currentCartesian3);
                
                const geodesic3 = new Cesium.EllipsoidGeodesic(currentPosition3, targetPosition3);
                
                let goalHeading2 = geodesic3.startHeading - Math.PI + Math.PI / 2 + (Math.PI / 365) * 2;
                 heading = goalHeading2
              }
              updatePosition(this.target.progress); // Update Santa's position based on tween progress
            },
            onComplete: function () {
              // console.log('Flight to target completed');
              isTweening = false; // Reset flag when the tween completes

              allowedtohead = true;
              allowedtoroll = true;
            }
          });
        }

        // Calculate a new roll based on the current step



        //// console.log(currentStepSize)

        //console.warn(actualstepsize)
        // console.warn(totalSteps)
        //console.warn(totalSteps2)
        // If allowedtofly2 is true and posStepCounter has started, update position




        // Convert the interpolated position to Cartesian coordinates and add the altitude

        // Get the initial heading

        // Set Santa's orientation
        // Current heading is already in radians
        var currentHeading = heading;

        // Goal heading calculation (keep everything in radians)
        var goalHeading = geodesic.startHeading - Math.PI + (Math.PI / 2) + (Math.PI / 365) * 2;

        // Calculate the shortest path to the goal heading (left or right)
        var headingDifference = goalHeading - currentHeading;

        // Normalize headingDifference to be within -π and π (i.e., shortest path)
        /*if (isrollingrandomly === false) {
          if (headingDifference > Math.PI) {
            headingDifference -= 2 * Math.PI;
            roll -= 0.0001
          } else if (headingDifference < -Math.PI) {
            headingDifference += 2 * Math.PI;
            roll += 0.0001
          }
        }*/
        let determinedtime = 0;
        // Adjust heading by a small increment in radians
        var headingIncrement = Cesium.Math.toRadians(0.864699); // Increment of ~0.001 rad
        var rollIncrement = Cesium.Math.toRadians(0.00015); // Roll increment in radians
        var bufferRange = Cesium.Math.toRadians(3); // Buffer range of 1.5 degrees in radians
        const maxRoll = Cesium.Math.toRadians(30); // Maximum roll in radians
        const rollSpeed = 0.020; // Adjust this value for how quickly it rolls
        //// console.log("CALC TO HEADING")
        //// console.log(heading)
        let maxroll2;
        // Update the heading variable based on the heading difference

        if (Math.abs(headingDifference) > bufferRange && allowedtohead === true) { // Check if adjustment is needed
          if (!isheadingchanging) {
            if (debounce124124 === false) {
              debounce124124 = true
              isheadingchanging = true
              //  viewer.trackedEntity = undefined
              // console.log(headingDifference)

              // Determine the turning direction
              var turnDirection;
              if (headingDifference < (2 * (Math.PI) * -1)) {
                maxroll2 = -maxRoll
                determinedtime = (-6.28 - headingDifference) * -1
                // console.log("Left")
                // console.log(headingDifference)
              } else if (headingDifference < 0) {
                maxroll2 = maxRoll
                // console.log("Right")
                // console.log(headingDifference)
                determinedtime = (-6.28 - headingDifference) * -1
              } else {
                turnDirection = "aligned"; // Optional: if exactly zero difference
              }


              TweenLite.to({ progress: 0 }, 1, {
                progress: maxroll2,
                ease: Linear.ease,
                onUpdate: function () {
                  isrollingnow = true
                  updateroll2(this.target.progress)

                },
                onComplete: function () {
                  // console.log("Done")
                }
              });
             

              TweenLite.to({ progress: currentHeading }, 7, {
                progress: (geodesic.startHeading + (Math.PI + (Math.PI / 2)) + (Math.PI / 365) * 2), // Animate from 0 to 1
                ease: Linear.easeInOut, // Ensure linear progression over time
                onUpdate: function () {
                  ishead1 = true
                  updateHeading2(this.target.progress); // Update Santa's position based on tween progress
                },
                onComplete: function () {
                  ishead1 = false
                  resetroll2()
                  // console.log('Flight to target completed');
                }
              });


              isheadingchanging = false
            } else {

              if (!hasRun1234124514) {

                //// console.log("LET IT RUN!!")
                geodesic2 = new Cesium.EllipsoidGeodesic(startPos, endPos);
                hasRun1234124514 = true; // Set flag to true after running


                allowedtohead = false;
                allowedtofly2 = true
                totalSteps2 = (time) * 60
                //  startValidStepSize(timeLeftValue)
              }
              // Now, gradually bring roll back to 0
              // Function to gradually bring roll back to zero

            }

          }
        }
        i++; // Increment step counter
      } else {
        return;
      }

    }

  }, time * 1000 / totalSteps); // Interval time in milliseconds

  // Make sure Santa is visible

  // Make sure the viewer is tracking Santa
  if (allowedtotrackedentity === true && trackeneityenabled === true) {
    viewer.trackedEntity = santa;
  }
}


function myFunctio2() {
  //// console.log(currentPos.elevation)
  var start = Cesium.JulianDate.now(); // Current time
  santa2.orientation = Cesium.Transforms.headingPitchRollQuaternion(santa2.position.getValue(start), new Cesium.HeadingPitchRoll(heading, pitch, roll));
  santa.orientation = Cesium.Transforms.headingPitchRollQuaternion(santa.position.getValue(start), new Cesium.HeadingPitchRoll(heading, pitch, roll));
  santaOverlay.orientation = Cesium.Transforms.headingPitchRollQuaternion(santa.position.getValue(start), new Cesium.HeadingPitchRoll(heading, pitch, roll));
}

setInterval(myFunctio2, 30);

var nobaskets = url.searchParams.get("nobaskets");
if (nobaskets === "1") {
  //// console.log("NO BASKETS");
} else {
  fetchBaskets(); // Fetch all baskets onload
}

async function fetchBaskets() {
  try {
    const response = await fetch("/getbaskets");
    const data = await response.json();
    //// console.log("Response data:", data); // Log the response data
    data.forEach((basket) => {
      addBasket(basket);
    });
  } catch (error) {
    console.error("Error fetching baskets:", error);

    warnuserError("Error", "There was an error getting old gifts delivered.")
  }
}

// Define an array to store the coordinates of already placed baskets


// Function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

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
// Disable default double-click action (untracking)
viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
// Create a BillboardCollection to manage multiple billboards
const billboardCollection = new Cesium.BillboardCollection({
  scene: viewer.scene,
  maximumBillboards: 1078 // Adjust the maximum number of billboards as needed
});
viewer.scene.primitives.add(billboardCollection);
// Add a basket with optimized click functionality for custom popup
// Add a basket with optimized click functionality for custom popup
// Add a basket with optimized click functionality for custom popup
// Add a basket with optimized click functionality for custom popup
// Add an entity with a billboard image and custom data
// Add an entity with a billboard image and custom data
function addBasket(cityInfo) {
  if (cityInfo.country !== "pt") {
    // Check if the city has already been added based on its coordinates
    const isAlreadyPlaced = placedBaskets.some(coords => coords[0] === cityInfo.latitude && coords[1] === cityInfo.longitude);
    if (isAlreadyPlaced) {
      return;
    }
    placedBaskets.push([cityInfo.latitude, cityInfo.longitude]);

    // Determine which icon to display based on the Wikipedia link (you can adjust this logic)
    const isYouTubeLink = cityInfo.Wikipedia_attr.includes("youtube.com");
    const iconImage = isYouTubeLink ? '/assets/camera.png' : '/assets/present.png';

    // Create an entity with a billboard (image)
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(cityInfo.longitude, cityInfo.latitude, 15000), // Adjust height as needed
      billboard: {
        image: iconImage,   // Set the image for the billboard
        scale: 0.1          // Adjust scale if needed
      },
      // Attach custom data to the entity
      cityInfo: cityInfo  // Store the city info (including Wikipedia link) on the entity
    });
  }
}

// Function to display the custom popup
function showPopup(content) {
  // Close the popup when the close button is clicked
  const closeButton = document.getElementById('custom-close-btn');
  const popupContainer = document.getElementById('custom-popup-container');

  closeButton.addEventListener('click', function () {
    popupContainer.style.display = 'none'; // Hide the popup
  });
  const popupContent = document.getElementById('custom-popup-content');

  if (popupContainer && popupContent) {
    popupContent.innerHTML = content;
    popupContainer.style.display = 'block';  // Show the popup
  } else {
    console.error('Popup elements not found!');
  }
}

// Event listener for clicks on the scene
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (event) {
  const pickedObject = viewer.scene.pick(event.position);

  if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.cityInfo) {
    const cityInfo = pickedObject.id.cityInfo;

    // Get screen position for the popup based on the entity's world position
    const cartesian = pickedObject.id.position.getValue(Cesium.JulianDate.now());
    const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian);

    // Helper function to convert Celsius to Fahrenheit
    function convertToFahrenheit(celsius) {
      return (celsius * 9 / 5) + 32;
    }

    // Function to get the user's preferred temperature unit
    function getTemperatureUnit() {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      return locale === 'en-US' ? 'Fahrenheit' : 'Celsius'; // Assume 'en-US' uses Fahrenheit, otherwise Celsius
    }

    /// Function to format the temperature based on the locale
    function getFormattedTemperature(cityInfo) {
      const tempInCelsius = cityInfo.weather && cityInfo.weather.temperature;

      // If the temperature is missing or invalid, return the default message
      if (tempInCelsius === undefined || tempInCelsius === null) {
        return "Come back later for weather information.";
      }

      const unit = getTemperatureUnit();

      // Convert to Fahrenheit if needed
      if (unit === 'Fahrenheit') {
        const tempInFahrenheit = convertToFahrenheit(tempInCelsius);
        return `${tempInFahrenheit.toFixed(1)} °F, it was ${cityInfo.weather.description.toLowerCase()}`;  // Display with one decimal point
      } else {
        return `${tempInCelsius.toFixed(1)} °C, it was ${cityInfo.weather.description.toLowerCase()}`;  // Display Celsius with one decimal point
      }
    }

    const isYouTubeLink = cityInfo.Wikipedia_attr.includes("youtube.com");
    // Function to convert a YouTube URL to an embed URL
    function convertToYouTubeEmbedUrl(url) {
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([^"&?\/\s]*))|(?:watch\?v=([^"&?\/\s]*)))|(?:youtu\.be\/([^"&?\/\s]*))/i;

      // Match both youtube.com and youtu.be formats
      const match = url.match(youtubeRegex);

      if (match) {
        // Extract the video ID from the matching group
        const videoId = match[1] || match[2] || match[3]; // Handles all possible match groups
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }

      return url; // Return the original URL if it's not a valid YouTube URL
    }

    const iframeSource = isYouTubeLink ? convertToYouTubeEmbedUrl(cityInfo.Wikipedia_attr) : cityInfo.Wikipedia_attr;

    const popupContent = `
  <div style="font-family: Arial, sans-serif;">
    <div style="display: flex; align-items: center;">
      <img 
        src="https://flagcdn.com/w40/${cityInfo.cc.toLowerCase()}.png" 
        alt="${cityInfo.country} flag" 
        style="height: 1em; margin-right: 8px;"
      />
      <b>${cityInfo.city}, ${cityInfo.country}</b>
    </div>
    <div><strong>Arrival Time:</strong> ${new Date(cityInfo.unixarrivalarrival * 1000).toLocaleString()}</div>
    <div><strong>Weather on Arrival:</strong> ${getFormattedTemperature(cityInfo)}</div>
    <div>
      <iframe src="${iframeSource}" width="100%" max-width="900px" height="600px;" max-height="600px"></iframe>
    </div>
  </div>
`;



    // Display the custom popup
    showPopup(popupContent, screenPosition);
  } else {
    // console.log('No entity picked');
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);




// CSS for custom popup styling
/*
#popup-container {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: none;
}

#popup-content {
  font-family: Arial, sans-serif;
}

#close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
}
*/



let arrivalTime; // Store the Unix arrival time

async function getTimeOfArrival(latitude, longitude) {
  try {
    const response = await fetch(`/gettimeuntilarrival?lat=${latitude}&long=${longitude}`);
    const data = await response.json();
    arrivalTime = data.arrivalTime; // Set the Unix arrival time
    return data;
  } catch (error) {
    console.error('Error getting time of arrival:', error);
    warnuserError("Error", "There was an error fetching the time of arrival.");
    return null;
  }
}

// Function to format time until arrival based on Unix timestamp difference
function formatTimeUntilArrival(unixTimeDifference) {
  const hours = unixTimeDifference / 3600;

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    if (minutes % 15 === 0) {
      return `${minutes / 60} hour${minutes / 60 !== 1 ? 's' : ''}`;
    } else if (Math.ceil(hours) === 0) {
      return `Less than 15 minutes!`;
    } else {
      const quarters = Math.floor(minutes / 15);
      const fraction = (minutes % 15) / 60;
      return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? 's' : ''}`;
    }
  } else if (hours === 1) {
    return `1 hour`;
  } else {
    const wholeHours = Math.floor(hours);
    const remainingMinutes = Math.round((hours - wholeHours) * 60);
    
    // Small fractions: 15 minutes (1/4 hour), 30 minutes (1/2 hour), 45 minutes (3/4 hour)
    let fraction = '';
    if (remainingMinutes === 0) {
      fraction = `${wholeHours} hour${wholeHours === 1 ? '' : 's'}`;
    } else if (remainingMinutes === 15) {
      fraction = `${wholeHours} ¼ hour`;
    } else if (remainingMinutes === 30) {
      fraction = `${wholeHours} ½ hour`;
    } else if (remainingMinutes === 45) {
      fraction = `${wholeHours} ¾ hour`;
    } else {
      // Nearest fraction for other minutes
      const nearestQuarter = Math.round(remainingMinutes / 15);
      fraction = `${wholeHours} ${nearestQuarter}/4 hour${nearestQuarter !== 1 ? 's' : ''}`;
    }

    return fraction;
  }
}

// Function to update arrival time display every second
function updateArrivalTimeDisplay() {
  if (arrivalTime) {
    const timeDifference = Math.floor((arrivalTime - new Date(currentunixtimeinmiliseconds) / 1000)); // Get difference in seconds
    const arrivalInfoElement = document.getElementById('arrivalTime');
    if (timeDifference >= 0) {
      arrivalInfoElement.innerText = `Santa will arrive in: ${formatTimeUntilArrival(timeDifference)}`;
    } else {
      arrivalInfoElement.innerText = `Santa arrived ${formatTimeUntilArrival(-timeDifference)} ago`;
    }
  }
}

async function main() {
  try {
    // Get latitude and longitude from client's IP address
    const { latitude, longitude } = await getLatLongFromIPAddress();

    if (latitude && longitude) {
      // Fetch time of arrival from server (once)
      await getTimeOfArrival(latitude, longitude);

      // Update the arrival time display immediately
      updateArrivalTimeDisplay();

      // Start updating every second
      setInterval(updateArrivalTimeDisplay, 1000);
    } else {
      console.error('Latitude and longitude not available.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    warnuserError("Error", "There was an error getting data for arrival time.");
  }
}

// Call the main function initially
main();

async function fetchRouteData() {
  try {
    const response = await fetch('/route'); // Replace with your actual endpoint
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.text(); // Get response as text first
    //// console.log('Response Data:', data); // Log the raw response
    setInterval(() => {

      // Parse the route data
      const routeData = parseRouteData(data); // Convert to appropriate format

      // Process the route data to fit the expected SSE format
      const processedData = processRouteData(routeData);

      // Call handleSSE with the processed data
      handleSSE(processedData);
    }, 1000);
  } catch (error) {
    console.error('Error fetching route data:', error);

    warnuserError("Error", "There was an error getting the route data.")
  }
}

// Function to align execution to the next whole second
function runFetchAtNextSecond() {
  const now = new Date(currentunixtimeinmiliseconds);
  const millisUntilNextSecond = 1000 - now.getMilliseconds(); // Calculate milliseconds until the next second

  setTimeout(() => {
    fetchRouteData();
  }, millisUntilNextSecond);
}

// Start the fetching process
runFetchAtNextSecond();

let hasHandledNoNextCity = false; // Flag to track if handleNoNextCity has run

function parseRouteData(data) {
  try {
    // Assuming the data is in a JSON format, adjust as necessary
    return JSON.parse(data); // Adjust to JSON or appropriate parsing method
  } catch (error) {
    console.error('Error parsing route data:', error);

    warnuserError("Error", "There was an error parsing the route data.")
    return []; // Return an empty array on error
  }
}
let hasStarted = false; // Flag to track if startview has run
function processRouteData(routeData) {
  const currentUnixTime = Math.floor(new Date(currentunixtimeinmiliseconds) / 1000); // Current time in seconds
  let nextCity = null;
  let currentCity = null;
  let lastCity = null;
  let nextNextCity = null;
  // Process route data to find next, nextNext, and current cities
  for (let i = 0; i < routeData.length; i++) {
    const stop = routeData[i];
    const unixArrival = stop["Unix Arrival Arrival"];

    // Skip empty or invalid entries
    if (!unixArrival || isNaN(unixArrival)) continue;

    // Update lastCity to currentCity before checking next conditions
    if (currentCity) {
      lastCity = currentCity; // Store the last seen city
    }

    // Check if the arrival time is in the future
    if (unixArrival > currentUnixTime) {
      nextCity = stop; // Found the next city
      if (!currentCity) {
        currentCity = stop; // Set currentCity to the nextCity if currentCity is not set
      }

      // Check if there is a city after the next city
      if (i + 1 < routeData.length) {
        const nextStop = routeData[i + 1];
        nextNextCity = nextStop; // Set the next city after the next one
      }
      break; // Exit loop once nextCity is found
    }

    // Always update currentCity
    currentCity = stop; // Update current city
  }

  // If no nextCity is found, we can consider currentCity as the last one seen
  if (!nextCity && currentCity) {
    lastCity = currentCity; // Update lastCity to the last known currentCity
  }

  if (nextCity && !hasStarted) {
    startallowed = true;
    startview();
    hasStarted = true; // Set the flag to true after running startview
  }

  // If no current city is found, set it to an empty object
  currentCity = currentCity || {};

  // Function to delete an entity by its ID
  function deleteEntityById(viewer, entityId) {
    const entity = viewer.entities.getById(entityId);
    if (entity) {
      viewer.entities.remove(entity); // Remove the entity
      //// console.log(`Entity with ID '${entityId}' has been removed.`);
    } else {
      //console.warn(`Entity with ID '${entityId}' not found.`);
    }
  }

  // Check if nextCity is not found and call a custom function
  if (!nextCity) {
    // If time left is more than 1 hour, hide the elements
    document.getElementById('endingtext').style.visibility = "visible";
    document.getElementById('hideavailable').style.visibility = "hidden";
    document.getElementById('lastseeninfobox').style.visibility = "hidden";
    document.getElementById('lastseeninfobox3').style.visibility = "hidden";
    deleteEntityById(viewer, 'santa');
    deleteEntityById(viewer, 'santa2');

    if (!hasHandledNoNextCity) {
      hasHandledNoNextCity = true; // Set the flag to true after running
      startallowed = false;
      handleNoNextCity(); // Call your function of choice
    }
    setInterval(() => {
      deleteEntityById(viewer, 'santa');
      deleteEntityById(viewer, 'santa2');
      deleteEntityById(viewer, 'santaoverlaythingy');
    }, 1000);
  }

  // Convert to desired format
  return convertData({
    currentCity: extractCityData(currentCity),
    timeLeft: calculateTimeLeft(nextCity), // Ensure this function handles undefined nextCity
    nextCity: extractCityData(nextCity || currentCity), // Use nextCity if available
    nextNextCity: extractCityData(nextNextCity || currentCity), // Use nextCity if available
    lastCity: extractCityData(lastCity),
    newBasket: extractCityData(currentCity) // Assuming this should reflect currentCity
  });
}

// Example function to be called if no next city is found
function handleNoNextCity() {
  //// console.log("No next city found. Executing custom function.");
  allowedtotrackedentity = false
  trackeneityenabled = false
  viewer.trackedEntity = undefined; // Stop tracking the entity
  setTimeout(() => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 30000000.0), // Center of the globe at a high altitude
      duration: 3 // Duration of the fly-to animation in seconds
    });

  }, 1000);
  setTimeout(() => {

    deleteEntityById(viewer, 'santaOverlay');
  }, 10000);
  // Add your custom logic here
}

let obj = {
  trackeneityenabled: false
};

const handler2 = {
  set(target, prop, value) {
    if (prop === 'trackeneityenabled') {
      // console.log(`trackeneityenabled changed to ${value}`);
      // Call your custom functions here
      if (value) {
        // console.log("track enabled")
      } else {
        disableTracking();
      }
    }
    target[prop] = value;
    return true;
  }
};

const proxy = new Proxy(obj, handler2);


function disableTracking() {
  viewer.trackedEntity = undefined; // Stop tracking the entity
  setTimeout(() => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 30000000.0), // Center of the globe at a high altitude
      duration: 3 // Duration of the fly-to animation in seconds
    });

  }, 1000);
}
function triggerFunctions() {
  // Add your functions here
  if (trackeneityenabled === true) {
    trackeneityenabled = false
    document.getElementById("FollowButtonImage").src = "/assets/followcam.png"
    disableTracking()
  } else {
    document.getElementById("FollowButtonImage").src = "/assets/unfollowicon.png"
    trackeneityenabled = true

    viewer.trackedEntity = santa;

  }
}


function extractCityData(city) {
  //// console.log('City Data:', city); // Log the incoming city data for verification
  return {
    unixArrivalArrival: city["Unix Arrival Arrival"] || 0, // Default to 0 if not present
    unixArrival: city["Unix Arrival"] || 0, // Default to 0 if not present
    unixDeparture: city["Unix Departure"] || 0, // Adjusted from "Unix Arrival Departure" to "Unix Departure"
    city: city["City"] || "Unknown", // Default to "Unknown" if not present
    country: city["Region"] || "Unknown", // Changed from "Country" to "Region"
    cc: city["CC"] || "None", // Default to "None" if not present
    timezone: city["Timezone"] || "Unknown", // Default to "Unknown" if not present
    basketsdelivered: city["Eggs Delivered"] || 0, // Default to 0 if not present
    carrotsEaten: city["Carrots eaten"] || 0, // Default to 0 if not present
    latitude: city["Latitude"] || "0", // Default to "0" if not present
    longitude: city["Longitude"] || "0", // Default to "0" if not present
    popNum: city["Population Num"] || 0, // Default to 0 if not present
    popYear: city["Population Year"] || "Unknown", // Default to "Unknown" if not present
    elevationMeter: city["Elevation Meter"] || 0, // Default to 0 if not present
    arrivalStoppageTime: city["Arrival Stoppage Time"] || 0, // Default to 0 if not present
    wikipediaAttr: city["Wikipedia attr"] || "None", // Default to "None" if not present
    wikipediaLink: city["Wikipedia Link"] || "None" // Default to "None" if not present
  };
}


function calculateTimeLeft(nextCity) {
  const nextArrival = nextCity ? nextCity["Unix Arrival Arrival"] : 0; // Adjust to match your data structure
  return nextArrival - Math.floor(new Date(currentunixtimeinmiliseconds) / 1000); // Return the time left until the next city arrives
}

function convertData(inputData) {
  return {
    currentCity: {
      unixarrivalarrival: inputData.currentCity.unixArrivalArrival,
      unixarrival: inputData.currentCity.unixArrival,
      unixdeparture: inputData.currentCity.unixDeparture,
      city: inputData.currentCity.city,
      country: inputData.currentCity.country,
      cc: inputData.currentCity.cc,
      timezone1: inputData.currentCity.timezone,
      basketsdelivered: inputData.currentCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.currentCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.currentCity.latitude,
      longitude: inputData.currentCity.longitude,
      pop_num: inputData.currentCity.popNum, // Change to population number
      pop_year: inputData.currentCity.popYear, // Change to population year
      Elevation_Meter: inputData.currentCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.currentCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.currentCity.timezone,
      Wikipedia_attr: inputData.currentCity.wikipediaAttr,
      wikipedia_link: inputData.currentCity.wikipediaLink
    },
    timeLeft: inputData.timeLeft,
    nextCity: {
      unixarrivalarrival: inputData.nextCity.unixArrivalArrival,
      unixarrival: inputData.nextCity.unixArrival,
      unixdeparture: inputData.nextCity.unixDeparture,
      city: inputData.nextCity.city,
      country: inputData.nextCity.country,
      cc: inputData.nextCity.cc,
      timezone1: inputData.nextCity.timezone,
      basketsdelivered: inputData.nextCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.nextCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.nextCity.latitude,
      longitude: inputData.nextCity.longitude,
      pop_num: inputData.nextCity.popNum, // Change to population number
      pop_year: inputData.nextCity.popYear, // Change to population year
      Elevation_Meter: inputData.nextCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.nextCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.nextCity.timezone,
      Wikipedia_attr: inputData.nextCity.wikipediaAttr,
      wikipedia_link: inputData.nextCity.wikipediaLink
    },
    nextNextCity: {
      unixarrivalarrival: inputData.nextNextCity.unixArrivalArrival,
      unixarrival: inputData.nextNextCity.unixArrival,
      unixdeparture: inputData.nextNextCity.unixDeparture,
      city: inputData.nextNextCity.city,
      country: inputData.nextNextCity.country,
      cc: inputData.nextNextCity.cc,
      timezone1: inputData.nextNextCity.timezone,
      basketsdelivered: inputData.nextNextCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.nextNextCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.nextNextCity.latitude,
      longitude: inputData.nextNextCity.longitude,
      pop_num: inputData.nextNextCity.popNum, // Change to population number
      pop_year: inputData.nextNextCity.popYear, // Change to population year
      Elevation_Meter: inputData.nextNextCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.nextNextCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.nextNextCity.timezone,
      Wikipedia_attr: inputData.nextNextCity.wikipediaAttr,
      wikipedia_link: inputData.nextNextCity.wikipediaLink
    },
    lastCity: {
      unixarrivalarrival: inputData.lastCity.unixArrivalArrival,
      unixarrival: inputData.lastCity.unixArrival,
      unixdeparture: inputData.lastCity.unixDeparture,
      city: inputData.lastCity.city,
      country: inputData.lastCity.country,
      cc: inputData.lastCity.cc,
      timezone1: inputData.lastCity.timezone,
      basketsdelivered: inputData.lastCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.lastCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.lastCity.latitude,
      longitude: inputData.lastCity.longitude,
      pop_num: inputData.lastCity.popNum, // Change to population number
      pop_year: inputData.lastCity.popYear, // Change to population year
      Elevation_Meter: inputData.lastCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.lastCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.lastCity.timezone,
      Wikipedia_attr: inputData.lastCity.wikipediaAttr,
      wikipedia_link: inputData.lastCity.wikipediaLink
    },
    newBasket: {
      unixarrivalarrival: inputData.newBasket.unixArrivalArrival,
      unixarrival: inputData.newBasket.unixArrival,
      unixdeparture: inputData.newBasket.unixDeparture,
      city: inputData.newBasket.city,
      country: inputData.newBasket.country,
      cc: inputData.newBasket.cc,
      timezone1: inputData.newBasket.timezone,
      basketsdelivered: inputData.newBasket.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.newBasket.carrotsEaten, // Change to carrots eaten
      latitude: inputData.newBasket.latitude,
      longitude: inputData.newBasket.longitude,
      pop_num: inputData.newBasket.popNum, // Change to population number
      pop_year: inputData.newBasket.popYear, // Change to population year
      Elevation_Meter: inputData.newBasket.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.newBasket.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.newBasket.timezone,
      Wikipedia_attr: inputData.newBasket.wikipediaAttr,
      wikipedia_link: inputData.newBasket.wikipediaLink
    }
  };
}

let debounceTimeout2;
const presetCityUrl = 'https://theelevatedmoments.com/wp-content/uploads/2023/12/A63I8240.jpg'; // Preset fallback image URL

let lastCity44444 = null;

function setCityImage(nextCity2) {
  if (debounceTimeout2 || lastCity44444 === nextCity2) return; // Debounce check with last city

  const imageElement = document.getElementById("flag3");

  if (imageData[nextCity2] && imageData[nextCity2].length > 0) {
    // Randomly select an image from the available images
    const cityImages = imageData[nextCity2];
    const randomImage = cityImages[Math.floor(Math.random() * cityImages.length)];
    imageElement.src = randomImage.url;
    imageElement.setAttribute('alt', `Image for ${nextCity2}`);
    document.getElementById('lastCityInfo3').innerHTML = `© ${randomImage.attribution}`
  } else {
    // Fallback to preset city image if city not found or no images available
    imageElement.src = presetCityUrl;
    imageElement.setAttribute('alt', 'Default city image');
    document.getElementById('lastCityInfo3').innerHTML = "No image available.";
  }

  // Update the last city
  lastCity44444 = nextCity2;

  debounceTimeout2 = setTimeout(() => {
    debounceTimeout2 = null; // Reset debounce after 20 seconds
  }, 20000);
}




function handleSSE(event) {
  // Parse the event data

  let data;
  if (typeof event === 'string') {
    try {
      data = JSON.parse(event);
    } catch (error) {
      console.error('Error parsing event data:', error);

      warnuserError("Error", "An unknown error occured.")
      return; // Exit if parsing fails
    }
  } else if (typeof event === 'object') {
    data = event; // Use the object directly
  } else {
    console.error('Unexpected event format:', event);
    warnuserError("Error", "An unknown error occured.")
    return; // Exit if the format is unexpected
  }
  hereyecomesthestop5 = data.nextNextCity.city
  if (startallowed === true) {

    if (parseInt(data.timeLeft, 10) <= parseInt(data.currentCity.Arrival_Stoppage_Time, 10)) {
      //// console.log("RUNNING@!")
      isrollingrandomly = true
      let nextNextCityCoords = [data.nextNextCity.latitude, data.nextNextCity.longitude];

      //     updaterollrandomly(data.timeLeft, nextNextCityCoords, data.nextCity.city + data.nextCity.country);


    } else {

      isrollingrandomly = false
    }

    //// console.log("timeleft: " + data.timeLeft)
    //// console.log("arrival time: " + data.currentCity.Arrival_Stoppage_Time)
    if (data.trackerended === true) {
      window.open("/")
    }
    citylocation213 = data.nextCity.city

    // Check if the tracker has ended
    timeLeftValue = data.timeLeft
    if (data.trackerEnded === true) {
      // Call your function to execute when the tracker ends
      //// console.log("ENDED")

    }
    if (data.nextCity) {


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
      if (!nobaskets) {
        if (data.lastCity) {
          addBasket(data.lastCity);
        }
      }
      if (data.lastCity.country === "pt") {
        setInterval(() => {
          const now = new Date(currentunixtimeinmiliseconds)
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
        santaOverlay.billboard.image = "/assets/santaoverlay.png"
        moving = true;
        stopped = true;

      } else {
        iscurrentlydelivering = false
        stopped = true;
        moving = true;
        santaOverlay.billboard.image = "/assets/santaoverlay.png"

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
      let nextCity2 = data.nextCity.city
      if (prog1set === false) {
        prog1 = (parseInt(data.lastCity.unixarrivalarrival) / parseInt(data.nextCity.unixarrivalarrival))
        prog1set = true
        // console.log(parseInt(data.lastCity.unixarrivalarrival) / parseInt(data.nextCity.unixarrivalarrival))
      }
      setCityImage(nextCity2);
      let image = document.getElementById("flag3")
      const flagImageUrl = getFlagImageUrl(data.nextCity.cc);
      //// console.log(flagImageUrl); // Output: https://countryflags.io/US/flat/64.png
      document.getElementById("flag").src = flagImageUrl
      const flagImageUrl2 = getFlagImageUrl(data.lastCity.cc);
      //// console.log(flagImageUrl2); // Output: https://countryflags.io/US/flat/64.png
      document.getElementById("flag2").src = flagImageUrl2
      //// console.log(getifitistrueorfalse(data.lastCity.country))

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
      alastthestop5 = data.lastCity.city
      if (data.lastCity.city !== lastcitystopped) {

        startBasketCounter(data.timeLeft, data.lastCity.basketsdelivered, data.nextCity.basketsdelivered);
        lastcitystopped = data.lastCity.city; // Corrected assignment operator
        flyToSanta(data.nextCity.latitude, data.nextCity.longitude, data.timeLeft, data.nextCity.city, data.lastCity.longitude, data.lastCity.latitude); // Move Santa to New York City in 5 seconds
      } else {

      }

    }
  }
}
// Example cityInfo object
const cityInfo = {
  longitude: -75.59777,
  latitude: 40.03883
};



// Add the billboard entity for the overlay
const santaOverlay = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(cityInfo.longitude, cityInfo.latitude),
  billboard: {
    image: '/assets/santaoverlay.png',
    width: 50,
    height: 50,
    show: false, // Initially hidden

  },
  EyeOffset: new Cesium.Cartesian3(0, 0, 15000), // Bring to front
  id: "santaoverlaythingy"
});

santaOverlay.allowPicking = false;
viewer.camera.changed.addEventListener(() => {
  const zoomLevel = viewer.camera.getMagnitude();
  if (zoomLevel > 100000) { // Adjust the threshold as needed
    santaOverlay.billboard.show = true;
  } else {
    santaOverlay.billboard.show = false;
  }
});


// Assuming 'viewer' is your Cesium Viewer instance
// and 'entity' is the entity you want to fly to
function startview() {
  setTimeout(() => {
    // Ensure the 'santa' entity has a valid position
    if (santa && santa.position) {
      const position = santa.position.getValue(Cesium.JulianDate.now());

      // Check if the position is valid
      if (position) {
        viewer.camera.flyTo({
          destination: position,
          duration: 3 // Duration of the fly to animation in seconds
        });
        setTimeout(() => {
          allowedtotrackedentity = true
          viewer.trackedEntity = santa;
          // Function to get the value of a specific query parameter by name
          function getQueryParam(param) {
            const currentUrl = new URL(window.location.href);
            return currentUrl.searchParams.get(param);
          }

          // Set the minimum zoom distance based on the `eyeoffset` query parameter
          const eyeOffsetParam = getQueryParam('eyeoffset'); // Get the value of 'eyeoffset'
          const eyeOffsetValue = eyeOffsetParam ? parseFloat(eyeOffsetParam) * 1000 : 300; // Multiply by 1000 or default to 1200

          viewer.scene.screenSpaceCameraController.minimumZoomDistance = eyeOffsetValue; // Set the minimum zoom distance

          // Set the minimum zoom distance to 30 after 5 seconds
          setTimeout(() => {
            viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1; // Adjusted minimum zoom distance
          }, 3000); // 5000 milliseconds = 5 seconds
        }, 3300);
      } else {
        console.error('Santa position is not valid.');
      }
    } else {
      console.error('Santa entity or position is not defined.');
    }
  }, 2500); // 2 seconds delay

};

// Function to set the tile layer to Bing Maps Aerial with Labels

// Bing Aerial with Labels URL
// const tileLayerUrl = 'https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/{y}/{x}/{z}?mapSize=256,256&key=Ajp5EmHUiLfChanekLlwaiT8pCRVwAx9vIacAkCPdbt8dVcJ1qaOGvbbpMMCPbK9';
//  const tileLayerUrl = "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"

// Add a tile layer from an XYZ tile service
// Function to set the tile layer to Bing Maps Aerial with Labels
// Function to set the tile layer to Google Satellite
// Function to set the Bing Maps Aerial with Labels layer
// Function to set the Google Hybrid layer
// Function to set the Stamen Toner hybrid layer
// Function to set the Bing Maps Hybrid layer
// Function to set the Bing Maps Hybrid layer
// Function to set the OpenStreetMap layer
// Function to set the Google Maps Hybrid layer

// Function to set the NASA GIBS VIIRS City Lights 2012 layer
// Function to set Bing Maps Aerial with Labels layer



// Set the custom skybox to the scene
viewer.scene.skyBox = skyBox;

// Optionally, remove the atmosphere for a clearer view of the skybox


// Start listening for SSE messages
/*const eventSource = new EventSource("/updates");
eventSource.onmessage = handleSSE;
source = eventSource

*/
// Error handling setup
Cesium.Ion.onError = handleCesiumIonError;
