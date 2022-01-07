"use strict"
const request = require('request');
const cheerio = require('cheerio');
const NodeCache = require( "node-cache" );
const cache = new NodeCache();

module.exports = {
    scrapeData(){
    
        const ecoChessUrl = "https://www.chessgames.com/chessecohelp.html";
        const jsonScrapeData = {};
    
        return new Promise((resolve, reject) => {
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
                    resolve(true);
                }
                else{
                    reject(err);
                }
            });
        });
    },

    async checkCache(){
        if(!cache.has("jsonScrapeData")){
            return await module.exports.scrapeData();
        }
        return true;
        
    },

    async getComputerMovesPage(req, res){
        if(await module.exports.checkCache()===true){
        
            const key = cache.get("jsonScrapeData")[req.params.key];
            const playedMoves = req.params;
            const keyMoves = key.moves.replace(",", "").split(" ").filter(x => isNaN(x)).join("/");
            
            let computerMove = playedMoves[0];
            if(computerMove[computerMove.length-1]==="/"){
                computerMove = computerMove.substring(0, computerMove.length-1);
            }
            if(computerMove === keyMoves.substring(0, computerMove.length)
                && (keyMoves.substring(computerMove.length, computerMove.length+1) ==="/")
                ){
                computerMove = keyMoves.replace(playedMoves[0], "").split("/");
                computerMove = computerMove[0] ? computerMove[0] : computerMove[1];
                return res.render('index', {title : "Computer plays", moves: computerMove});
            }
            else{
                return res.render('index', {title : "Computer plays", moves: "Invalid Move"});
            }
        }
    },

    async getIndexPage(req, res){
        if(await module.exports.checkCache()===true){
            return res.render('index', {title: "ECO Chess Opening Codes:", jsonScrapeData: cache.get("jsonScrapeData")});
        }
    },
    
    async getOpeningMovePage(req, res){
        if(await module.exports.checkCache()===true){
            const jsonData = cache.get("jsonScrapeData")[req.params.key];
            return res.render('index', {title: jsonData.name, moves: jsonData.moves});
        }
    }
}