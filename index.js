"use strict";
const express = require('express');
const app = express();
const port =  process.env.PORT || 3000;
const path = require('path');
const { getComputerMovesPage, getOpeningMovePage, getIndexPage } = require('./service');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async(req, res) => {
    await getIndexPage(req, res);
});

app.get('/:key', async(req, res) => {
    await getOpeningMovePage(req, res);
});

app.get('/:key/*', async(req, res) => {
    await getComputerMovesPage(req, res);  
});

app.listen(port, () => {
    console.log(`Server app has started listening at http://localhost:${port}`); 
})