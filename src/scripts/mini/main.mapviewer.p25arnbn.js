window.onload=function(){fetch("/visitsite").then(e=>e.json()).then(e=>{console.log("Number of people on the site:",e.peopleonthesite)}).catch(e=>{console.error("Error fetching data:",e)})};var url=new URL(window.location.href),level=url.searchParams.get("zoom"),level2=url.searchParams.get("nobaskets"),iframe=document.getElementById("iframe"),newSrc="/en-us/embed/map?zoom="+level+"&nobaskets="+level2;function toggleSettings(){var e=document.getElementById("settingsPopup");"block"===e.style.display?e.style.display="none":e.style.display="block"}let currentunixtimeinmiliseconds=0;async function fetchUnixTime(){try{var e=await fetch("https://api.master-trackers.xyz/time");if(!e.ok)throw new Error("Failed to fetch time");var t=await e.json();currentunixtimeinmiliseconds=t.unixTime,setInterval(()=>{currentunixtimeinmiliseconds+=1e3},1e3)}catch(e){console.error("Error fetching time:",e)}}function getTimeFromUnix(e,t){var t=(e=new Date(e+t)).getUTCHours(),n=e.getUTCMinutes(),e=e.getUTCSeconds(),i=12<=t?"PM":"AM";return{hours:(t%12||12).toString().padStart(2,"0"),minutes:n.toString().padStart(2,"0"),seconds:e.toString().padStart(2,"0"),ampm:i}}function updateTimeDisplays(){var e=-60*(new Date).getTimezoneOffset()*1e3,e=getTimeFromUnix(currentunixtimeinmiliseconds,e),t=getTimeFromUnix(currentunixtimeinmiliseconds,0),n=getTimeFromUnix(currentunixtimeinmiliseconds,0),i=getTimeFromUnix(currentunixtimeinmiliseconds,-18e6),o=getTimeFromUnix(currentunixtimeinmiliseconds,324e5);document.getElementById("local-time").textContent=`${e.hours}:${e.minutes}:${e.seconds} ${e.ampm} LOCAL`,document.getElementById("utc-time").textContent=`${t.hours}:${t.minutes}:${t.seconds} ${t.ampm} UTC/GMT`,document.getElementById("london-time").textContent=`${n.hours}:${n.minutes}:${n.seconds} ${n.ampm} LONDON`,document.getElementById("nyc-time").textContent=`${i.hours}:${i.minutes}:${i.seconds} ${i.ampm} NYC`,document.getElementById("tokyo-time").textContent=`${o.hours}:${o.minutes}:${o.seconds} ${o.ampm} TOKYO`}fetchUnixTime().then(()=>{setInterval(updateTimeDisplays,1e3)});var readyfordeployment=!1;setTimeout(function(){document.getElementById("logo").classList.add("spread"),document.getElementById("loading").classList.add("show")},1e3),setTimeout(function(){document.getElementById("logo").style.display="none",document.getElementById("loading").style.display="none",document.getElementById("iframe").style.visibility="visible",document.getElementById("srcimg").style.display="none",document.getElementById("iframe").style.opacity=1,readyfordeployment=!0},3e3);let ipapiUrl="/ip-info";async function fetchIpAndSendHit(){try{var e=await fetch(ipapiUrl);if(!e.ok)throw new Error("Failed to fetch IP information");var t=await e.json(),n=t.ip,i=t.country_code;if(console.log(`IP: ${n}, Country: `+i),!(await fetch("/hit/1?country="+i)).ok)throw new Error("Failed to send hit");console.log("Hit sent successfully")}catch(e){console.error("Error:",e)}}fetchIpAndSendHit();