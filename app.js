const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const { IntroService } = require('./server/intro');
const { WebSocket } = require('./server/ws');
const { Manager } = require('./server/manager');
const { MongoDBService } = require('./server/dbmodule');

/* Setting static directory */
app.use(express.static(path.join(__dirname,'client','elements')));
app.use(express.static(path.join(__dirname,'client','css')));
app.use(express.static(path.join(__dirname,'client','img')));
app.use(express.static(path.join(__dirname,'client','js')));

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
Manager.init(app);

const server = http.createServer(app);
WebSocket.init(server);

server.listen(process.env.npm_package_config_port, function() {
    console.log("SHARE-u-Life server listening on port " + process.env.npm_package_config_port);
});
