// Get the current URL path
const path = window.location.pathname;

// Get the current date in UTC
const now = new Date();
const isDecemberUTC = now.getUTCMonth() === 11; // Check if it's December in UTC

if ((path === "/en" || path === "/map") && !isDecemberUTC) {
    // Redirect to "/" if it's not December in UTC
    window.location.href = "/";
} else if (path === "/" && isDecemberUTC) {
    // Redirect to "/en" if it's December in UTC
    window.location.href = "/en";
}
