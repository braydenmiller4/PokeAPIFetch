//Import expressjs into our file
const express = require('express');
//Import the path variable from node
const path = require('path');
//Import fs and https for SSL setup
const fs = require('fs');
const https = require('https');

//Setup express inside a constant name app
const app = express();
//Save port address in a variable for an easy change later
const PORT = 3000;

//Tell express to use its static server method and set the path to /public
app.use(express.static(path.join(__dirname, 'public')));

// HTTPS Server
const key = fs.readFileSync('./apiapp.test-key.pem');
const cert = fs.readFileSync('./apiapp.test.pem');
https.createServer({ key, cert }, app).listen(443, () => {
console.log('HTTPS server running on https://apiapp.test');
});

// HTTP Server
//Start the express server on port 3000 and run a callback that logs out that ithas started
//app.listen(PORT, ()=> {
//console.log(`Listening on port ${PORT}`);
//})
