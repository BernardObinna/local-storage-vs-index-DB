const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const secure = require('express-force-https');

// create the express app
const app = express();

// Add SSL as a layer to the middleware
app.use(secure);

// create middleware to handle the serving the app
app.use('/', serveStatic(path.join(__dirname, '/dist')));

// Catch all routes and redirect to the index file
app.get('*', function (req, res) {
    // eslint-disable-next-line no-path-concat
    res.sendFile(__dirname + '/dist/index.html')
});

// Create default port to serve the app on
const port = process.env.PORT || 5000;
app.listen(port);

// Log a feedback that this is actually running
console.log('Server started on port ' + port);
