"use strict";
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const port =  process.env.PORT || 3000;
const NodeCache = require( "node-cache" );
const cache = new NodeCache();
const path = require('path');
const e = require('express');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    if(!cache.has("jsonScrapeData")){
        scrapeData();
    }
    else{
        res.render('index', {title: "ECO Chess Opening Codes:", jsonScrapeData: cache.get("jsonScrapeData")});
    }
    
});

app.get('/:key', (req, res) => {
    if(!cache.has("jsonScrapeData")){
        scrapeData();
    }
    else{
        const jsonData = cache.get("jsonScrapeData")[req.params.key];
        res.render('index', {title: jsonData.name, moves: jsonData.moves});
    }
    
});

app.get('/:key/*', (req, res) => {
    if(!cache.has("jsonScrapeData")){
        scrapeData();
    }
    else{
        const key = cache.get("jsonScrapeData")[req.params.key];
        const playedMoves = req.params;
        const keyMoves = key.moves.replace(",", "").split(" ").filter(x => isNaN(x)).join("/");
        
        let computerMove = playedMoves[0];
        if(computerMove[computerMove.length-1]==="/"){
            computerMove = computerMove.substring(0, computerMove.length-2);
        }
        if(computerMove === keyMoves.substring(0, computerMove.length)
            && (keyMoves.substring(computerMove.length, computerMove.length+1) ==="/")
            ){
            computerMove = keyMoves.replace(playedMoves[0], "").split("/");
            console.log(computerMove, computerMove[0], computerMove[0]);
            computerMove = computerMove[0] ? computerMove[0] : computerMove[1];
            res.render('index', {title : "Computer plays", moves: computerMove});
        }
        else{
            res.render('index', {title : "Computer plays", moves: "Invalid Move"});
        }
    }  
})


function scrapeData(){
    
    const ecoChessUrl = "https://www.chessgames.com/chessecohelp.html";
    const jsonScrapeData = {};

    request(ecoChessUrl, (err, res, html) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(html);
            const tableBody = $("tbody").find('tr');
            $(tableBody).each((_i, data) => {

                const columnOne = $(data).find('td:nth-child(1)');
                const columnTwo = $(data).find('td:nth-child(2)');

                const key = $(columnOne).find('font').text();
                const name = $(columnTwo).find('font > b').text();
                const moves = $(columnTwo).find('font > font').text();

                jsonScrapeData[key] = {
                    name,
                    moves
                }
            });
            cache.set("jsonScrapeData", jsonScrapeData, 180);
        }
    });
}

app.listen(port, () => {
     console.log(`Server app has started listening at http://localhost:${port}`); 
})