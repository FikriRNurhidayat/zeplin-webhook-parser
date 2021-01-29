const express = require('express');
const app = express();

/*
 * Parse Request Body with application/json as Content-Type
 * into Javascript object on req.body
 */
app.use(express.json());

module.exports = app;
