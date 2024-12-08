let currentunixtimeinmiliseconds = 0;

async function fetchUnixTime() {
  try {
    const response = await fetch('https://api.master-trackers.xyz/time');
    if (!response.ok) throw new Error('Failed to fetch time');
    
    const data = await response.json();
    currentunixtimeinmiliseconds = data.unixTime;
    
    // Start incrementing time locally
    setInterval(() => {
      currentunixtimeinmiliseconds += 10;
    }, 10);
  } catch (error) {
    console.error('Error fetching time:', error);
  }
}

// Fetch initial time
fetchUnixTime();

window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-DQEVD4L8PJ'); 
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
            // Check if the current month is not December
            window.onload = function () {
                const currentMonth = new Date().getMonth(); // 0 = January, 11 = December
                if (currentMonth !== 11) {
                    // Redirect to another page or URL
                    window.location.href = "/";
                }
            };
            function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
            }
            const audio = document.getElementById('audio');
            const playPauseBtn = document.getElementById('play-pause-btn');
            let isPlaying = false; // Track if audio is playing
            function handleClick() {
    
    
                window.location.href = "https://santa.master-trackers.xyz/map"
    
            }
            function togglePlayPause() {
                if (isPlaying) {
                    audio.pause();
                    playPauseBtn.textContent = '▶️'; // Play symbol
                } else {
                    audio.play();
                    playPauseBtn.textContent = '⏸️'; // Pause symbol
                }
                isPlaying = !isPlaying; // Toggle state
            }
    
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
            var lastAdjustmentTime = 0; // Variable to store the last adjustment timestamp
    
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
            let countdownDate; // Variable to store the countdown timestamp
            // Function to get the local timezone abbreviation
            function getTimezoneAbbreviation() {
                const options = { timeZoneName: 'short' };
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const parts = formatter.formatToParts(new Date());
    
                // Find the 'timeZoneName' part and return its value
                const timeZonePart = parts.find(part => part.type === 'timeZoneName');
                return timeZonePart ? timeZonePart.value : 'UTC';
            }
            function formatCountdown(distance) {
                // Calculate total time in days, hours, minutes, and seconds
                const seconds = Math.floor((distance / 1000) % 60);
                const minutes = Math.floor((distance / (1000 * 60)) % 60);
                const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
                const days = Math.floor((distance / (1000 * 60 * 60 * 24)));
    
                // Create an array to hold the countdown parts
                const parts = [];
    
                if (days > 0) {
                    parts.push(days); // Add days without padding
                }
                if (hours > 0 || days > 0) {
                    parts.push(hours); // Add hours without padding (only if days are present or hours > 0)
                }
                if (minutes > 0 || hours > 0 || days > 0) {
                    parts.push(minutes); // Add minutes without padding (only if higher units are present)
                }
    
                // Add seconds with conditional padding
                if (minutes > 0 || hours > 0 || days > 0) {
                    // Always show seconds as two digits if there are higher units
                    parts.push(seconds.toString().padStart(2, '0'));
                } else {
                    // Show seconds without padding if less than a minute
                    parts.push(seconds);
                }
    
                // Join the parts with ':' to create the countdown string
                return parts.join(':');
            }
    
    
    
            const timezone = getTimezoneAbbreviation();
            // Fetch the countdown date from the server once
            fetch('/getcountdowndate')
                .then(response => response.text()) // Assuming the response is text (Unix timestamp as string)
                .then(timestamp => {
                    const countdownDate = parseInt(timestamp, 10) * 1000; // Parse Unix timestamp and convert to milliseconds
                    const threeHoursBeforeLaunch = new Date(countdownDate - 3 * 60 * 60 * 1000);
    
                    // Start the countdown update interval
                    const x = setInterval(function () {
                        // Get the current date and time in UTC
                        const now = currentunixtimeinmiliseconds
    
                        // Calculate days, hours, minutes, and seconds for the countdown
                        const distance = threeHoursBeforeLaunch - now;
                        // Calculate time components
                        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        let days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
                        let months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
                        // Format the countdown string
                        // Format the countdown string
                        let countdownString = "";
                        if (distance > 0) {
                            let countdownString = formatCountdown(distance)
                            document.getElementById("countdown").innerHTML = countdownString;
    
                        } else {
                            clearInterval(x); // Stop the countdown
                            countdownString = "Waiting in Redirect Queue." // Final message
                        }
    
    
                        // Display the countdown
    
    
                        if (minutes < 55 && hours < 1 && days < 1) {
                            document.getElementById("countdownButton5").style.display = "block";
                        } else {
                            document.getElementById("countdownButton5").style.display = "none";
                        }
                        const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
                        if (distance <= fiveDaysInMillis) {
                            document.getElementById("launchestimate2").style.display = "block";
                            document.getElementById("launchestimate").style.display = "block";
                            // Calculate the time one hour before the local launch time
                            const oneHourBeforeLaunchString = threeHoursBeforeLaunch.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
                            document.getElementById("localtime2").innerHTML = oneHourBeforeLaunchString + " " + timezone;
                        } else {
                            document.getElementById("launchestimate2").style.display = "none";
                            document.getElementById("launchestimate").style.display = "none";
                        }
                        const fiveDaysInMillis2 = 13 * 24 * 60 * 60 * 1000;
                        if (distance <= fiveDaysInMillis2) {
                            // Calculate the local time based on the countdown date
                            const localLaunchTime = new Date(countdownDate);
                            const localLaunchTimeString = localLaunchTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
                            document.getElementById("localtime").innerHTML = localLaunchTimeString + " " + timezone;
                            document.getElementById("launchestimate").style.display = "block";
                            document.getElementById("launchestimate3").style.display = "none";
                        } else {
                            document.getElementById("launchestimate").style.display = "none";
                            document.getElementById("launchestimate3").style.display = "block";
                        }
    
                        // If the countdown is finished, display a message
                        if (distance < 0) {
                            clearInterval(x);
    
                            setTimeout(() => {
                                window.location.href = "/map"
                            }, 1000);
    
    
                            document.getElementById("countdown").innerHTML = "Waiting in Redirect Queue.";
                        }
                    }, 50); // Update every 50 milliseconds
                })
                .catch(error => {
                    console.error('Error fetching countdown date:', error);
                    document.getElementById("countdown").innerHTML = "Error fetching countdown date.";
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
            // Replace with your IP geolocation API endpoint
            const ipapiUrl = 'https://ipapi.co/json/'; // ipapi endpoint
    
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
                    const hitResponse = await fetch(`/hit/3?country=${country}`);
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
            var amountofdays = 25;
            var daysleft = 10; // will be autoset
            var timeforeachflip = 50; //miliseconds
            var waittime = 1; //time in seconds to wait before starting to flip
            var timetillclose = 3; //seconds to wait until the thing closes after all flips.
            function spawncalender() {
                // Get today's date
                var today = new Date();
    
                // Set the target date to Christmas Eve (December 24th)
                var christmasEve = new Date(today.getFullYear(), 11, 25); // Month is 0-indexed, so 11 = December
    
                // Calculate the difference in time (milliseconds)
                var timeDifference = christmasEve - today;
    
                // Convert the difference to days
                daysleft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
                if (daysleft > amountofdays) {
                    amountofdays = daysleft + 25;
                }
                console.log(daysLeft + " days left until Christmas Eve.");
    
                const calendar = document.getElementById('calendar');
                const daysLeftMessage = document.getElementById('daysLeftMessage');
                const daysLeftSpan = document.getElementById('daysLeft');
                const showitself = document.getElementById('showitself'); // Reference to the main container
    
                // Set "Days Left" text
                daysLeftSpan.textContent = daysleft;
    
                // Clear calendar and generate days
                calendar.innerHTML = '';
                for (let i = 1; i <= amountofdays - 1; i++) {
                    const day = document.createElement('div');
                    day.className = 'day';
                    day.textContent = i + 1;
                    calendar.appendChild(day);
                }
    
                // Start flipping animation
                let currentDay = amountofdays;
                setTimeout(() => {
                    const interval = setInterval(() => {
                        if (currentDay < daysleft) {
                            clearInterval(interval);
    
                            // Show "Days Left" message after animation
                            daysLeftMessage.classList.add('visible');
    
                            // Fade out `#showitself` after a delay
                            setTimeout(() => {
                                showitself.style.transition = 'opacity 2s';
                                showitself.style.opacity = 0;
    
                                // Remove `#showitself` from the DOM after the fade-out
                                setTimeout(() => {
                                    showitself.style.display = 'none';
                                }, 2000); // Match the fade-out duration
                            }, timetillclose * 1000); // Wait 3 seconds before fading out
                            return;
                        }
    
                        const dayElement = calendar.children[currentDay - 1];
                        if (dayElement) {
                            dayElement.classList.add('rotateUp');
                        }
    
                        currentDay--;
                    }, timeforeachflip); // Flip speed
                }, waittime * 1000); // Delay before flipping starts
            }
            spawncalender()
    
    
            const decemberStatuses = {
                1: "Santa is working on his sleigh for flight modifications.",
                2: "Santa is reviewing his naughty and nice list.",
                3: "Santa is testing out toys for quality assurance.",
                4: "Santa is checking the weather forecast for the big night.",
                5: "Santa is organizing the North Pole workshop.",
                6: "Santa is ensuring the reindeer are ready for their long journey.",
                7: "Santa is starting to wrap presents for children.",
                8: "Santa is making sure all gifts are properly labeled.",
                9: "Santa is reviewing the list of gifts for each child.",
                10: "Santa is making sure the workshop is running smoothly.",
                11: "Santa is preparing hot chocolate for the elves and himself.",
                12: "Santa is fixing any issues with the sleigh before takeoff.",
                13: "Santa is making a final check on all presents for delivery.",
                14: "Santa is checking the map to ensure a smooth flight path.",
                15: "Santa is giving the reindeer their final check-up.",
                16: "Santa is reviewing his flight route to avoid bad weather.",
                17: "Santa is organizing the elves to help pack the sleigh.",
                18: "Santa is confirming the final details with the elves.",
                19: "Santa is double-checking the list to ensure no one is missed.",
                20: "Santa is ensuring that the sleigh’s lights are working perfectly.",
                21: "Santa is getting the sleigh ready for launch.",
                22: "Santa is finalizing preparations and checking the weather again.",
                23: "Santa is almost done preparing for Christmas. It's almost time to fly!"
              };
              
              // Function to get today's status
              function getTodaysStatus() {
                const currentDate = new Date();
                const currentDay = currentDate.getDate(); // Get the current day of the month
                
                if (decemberStatuses[currentDay]) {
                  return decemberStatuses[currentDay];
                } else {
                  return "Santa is preparing for Christmas Eve. Time to get ready!";
                }
              }
              
              // Display today's status
              console.log(getTodaysStatus());
            document.getElementById("currentstatus").innerText = getTodaysStatus()