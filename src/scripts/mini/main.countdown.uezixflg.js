let currentunixtimeinmiliseconds=0;async function fetchUnixTime(){try{var e=await fetch("https://api.master-trackers.xyz/time");if(!e.ok)throw new Error("Failed to fetch time");var t=await e.json();currentunixtimeinmiliseconds=t.unixTime,setInterval(()=>{currentunixtimeinmiliseconds+=10},10)}catch(e){console.error("Error fetching time:",e)}}function gtag(){dataLayer.push(arguments)}function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:"en",layout:google.translate.TranslateElement.InlineLayout.SIMPLE},"google_translate_element")}fetchUnixTime(),window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","G-DQEVD4L8PJ"),document.addEventListener("DOMContentLoaded",function(){let e=document.getElementById("popup-container"),t=document.getElementById("close-btn");localStorage.getItem("popupClosed")||e.classList.remove("hidden"),t.addEventListener("click",function(){e.classList.add("hidden"),localStorage.setItem("popupClosed","true")})}),window.onload=function(){11!==(new Date).getMonth()&&(window.location.href="/")};let audio=document.getElementById("audio"),playPauseBtn=document.getElementById("play-pause-btn"),isPlaying=!1;function handleClick(){window.location.href="https://santa.master-trackers.xyz/map"}function togglePlayPause(){isPlaying?(audio.pause(),playPauseBtn.textContent="▶️"):(audio.play(),playPauseBtn.textContent="⏸️"),isPlaying=!isPlaying}function openDonationScreen(){var e=document.createElement("iframe"),t=(e.src="/donationiframe",e.style.position="fixed",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",e.style.width="90vw",e.style.height="90vh",e.style.border="none",e.style.zIndex="9999",document.createElement("button"));t.textContent="x",t.style.position="absolute",t.style.top="100px",t.style.right="10px",t.style.padding="5px",t.style.background="rgba(0, 0, 0, 0.5)",t.style.color="#fff",t.style.border="none",t.style.borderRadius="50%",t.style.cursor="pointer",t.style.zIndex="10000",t.onclick=function(){document.body.removeChild(e),document.body.removeChild(t)},document.body.appendChild(e),document.body.appendChild(t)}var lastAdjustmentTime=0;window.onload=function(){fetch("/visitsite").then(e=>e.json()).then(e=>{console.log("Number of people on the site:",e.peopleonthesite)}).catch(e=>{console.error("Error fetching data:",e)})};let countdownDate;function getTimezoneAbbreviation(){var e=new Intl.DateTimeFormat("en-US",{timeZoneName:"short"}).formatToParts(new Date).find(e=>"timeZoneName"===e.type);return e?e.value:"UTC"}function formatCountdown(e){var t=Math.floor(e/1e3%60),n=Math.floor(e/6e4%60),a=Math.floor(e/36e5%24),o=[];return 0<(e=Math.floor(e/864e5))&&o.push(e),(0<a||0<e)&&o.push(a),(0<n||0<a||0<e)&&o.push(n),o.push(0<n||0<a||0<e?t.toString().padStart(2,"0"):t),o.join(":")}let timezone=getTimezoneAbbreviation();function toggleSettings(){var e=document.getElementById("settingsPopup");"block"===e.style.display?e.style.display="none":e.style.display="block"}fetch("/getcountdowndate").then(e=>e.text()).then(e=>{let i=1e3*parseInt(e,10),l=new Date(i-108e5),s=setInterval(function(){var e,t=currentunixtimeinmiliseconds,t=l-t,n=(Math.floor(t%6e4/1e3),Math.floor(t%36e5/6e4)),a=Math.floor(t%864e5/36e5),o=Math.floor(t%2592e6/864e5);Math.floor(t/2592e6),0<t?(e=formatCountdown(t),document.getElementById("countdown").innerHTML=e):clearInterval(s),document.getElementById("countdownButton5").style.display=n<55&&a<1&&o<1?"block":"none",t<=432e6?(document.getElementById("launchestimate2").style.display="block",document.getElementById("launchestimate").style.display="block",e=l.toLocaleTimeString("en-US",{hour12:!0,hour:"numeric",minute:"2-digit"}),document.getElementById("localtime2").innerHTML=e+" "+timezone):(document.getElementById("launchestimate2").style.display="none",document.getElementById("launchestimate").style.display="none"),t<=11232e5?(n=new Date(i).toLocaleTimeString("en-US",{hour12:!0,hour:"numeric",minute:"2-digit"}),document.getElementById("localtime").innerHTML=n+" "+timezone,document.getElementById("launchestimate").style.display="block",document.getElementById("launchestimate3").style.display="none"):(document.getElementById("launchestimate").style.display="none",document.getElementById("launchestimate3").style.display="block"),t<0&&(clearInterval(s),setTimeout(()=>{window.location.href="/map"},1e3),document.getElementById("countdown").innerHTML="Waiting in Redirect Queue.")},50)}).catch(e=>{console.error("Error fetching countdown date:",e),document.getElementById("countdown").innerHTML="Error fetching countdown date."});let ipapiUrl="https://ipapi.co/json/";async function fetchIpAndSendHit(){try{var e=await fetch(ipapiUrl);if(!e.ok)throw new Error("Failed to fetch IP information");var t=await e.json(),n=t.ip,a=t.country_code;if(console.log(`IP: ${n}, Country: `+a),!(await fetch("/hit/3?country="+a)).ok)throw new Error("Failed to send hit");console.log("Hit sent successfully")}catch(e){console.error("Error:",e)}}fetchIpAndSendHit();var amountofdays=25,daysleft=10,timeforeachflip=50,waittime=1,timetillclose=3;function spawncalender(){var e=new Date,t=new Date(e.getFullYear(),11,25);daysleft=Math.ceil((t-e)/864e5),amountofdays<daysleft&&(amountofdays=daysleft+25),console.log(daysLeft+" days left until Christmas Eve.");let n=document.getElementById("calendar"),a=document.getElementById("daysLeftMessage"),o=(t=document.getElementById("daysLeft"),document.getElementById("showitself"));t.textContent=daysleft,n.innerHTML="";for(let e=1;e<=amountofdays-1;e++){var i=document.createElement("div");i.className="day",i.textContent=e+1,n.appendChild(i)}let l=amountofdays;setTimeout(()=>{let t=setInterval(()=>{var e;l<daysleft?(clearInterval(t),a.classList.add("visible"),setTimeout(()=>{o.style.transition="opacity 2s",o.style.opacity=0,setTimeout(()=>{o.style.display="none"},2e3)},1e3*timetillclose)):((e=n.children[l-1])&&e.classList.add("rotateUp"),l--)},timeforeachflip)},1e3*waittime)}spawncalender();let decemberStatuses={1:"Santa is working on his sleigh for flight modifications.",2:"Santa is reviewing his naughty and nice list.",3:"Santa is testing out toys for quality assurance.",4:"Santa is checking the weather forecast for the big night.",5:"Santa is organizing the North Pole workshop.",6:"Santa is ensuring the reindeer are ready for their long journey.",7:"Santa is starting to wrap presents for children.",8:"Santa is making sure all gifts are properly labeled.",9:"Santa is reviewing the list of gifts for each child.",10:"Santa is making sure the workshop is running smoothly.",11:"Santa is preparing hot chocolate for the elves and himself.",12:"Santa is fixing any issues with the sleigh before takeoff.",13:"Santa is making a final check on all presents for delivery.",14:"Santa is checking the map to ensure a smooth flight path.",15:"Santa is giving the reindeer their final check-up.",16:"Santa is reviewing his flight route to avoid bad weather.",17:"Santa is organizing the elves to help pack the sleigh.",18:"Santa is confirming the final details with the elves.",19:"Santa is double-checking the list to ensure no one is missed.",20:"Santa is ensuring that the sleigh’s lights are working perfectly.",21:"Santa is getting the sleigh ready for launch.",22:"Santa is finalizing preparations and checking the weather again.",23:"Santa is almost done preparing for Christmas. It's almost time to fly!"};function getTodaysStatus(){var e=(new Date).getDate();return decemberStatuses[e]||"Santa is preparing for Christmas Eve. Time to get ready!"}console.log(getTodaysStatus()),document.getElementById("currentstatus").innerText=getTodaysStatus();