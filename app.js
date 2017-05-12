const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const { IntroService } = require('./server/intro');
const app = express();

/* Setting static directory */
app.use(express.static('client/elements'));
app.use(express.static('clien/img'));
app.use(express.static('client/css'));
app.use(express.static('client/js'));
app.use(express.static('client/lib'));
app.use(express.static('client/fonts'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(bodyParser.json());

/* Redirect views path */
app.set('views', path.join(__dirname, 'client/views'));
app.use(require('express-session')({
    secret: 'donate cat',
    resave: true,
    saveUninitialized: true
}));

/* Modules */
IntroService.init(app);

const server = http.createServer(app);

server.listen(process.env.npm_package_config_port, function() {
    console.log("SCABER server listening on port " + process.env.npm_package_config_port);
});
