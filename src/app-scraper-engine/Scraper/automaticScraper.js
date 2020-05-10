const scraper = require('./scraper');
const PlatformService = require("../Query/PlatformService");
const MongoConnection = require('../DBConnection/MongoConnection');
const config = require('../config.json');
const fs = require('fs');

const reset = {
  "progress":"-1",
  "doneLinkedin": 0,
  "totalLinkedin": 0,
  "hasFinishedLinkedin": 0,
  "doneGlassdoor": 0,
  "totalGlassdoor": 0,
  "hasFinishedGlassdoor": 0,
  "doneMonster": 0,
  "totalMonster": 0,
  "hasFinishedMonster": 0
}

function dedupe(arr) {
  return arr.reduce(function(p, c) {
    var id = [c._id.searchJob, c._id.searchPlace].join('|');
    if (p.temp.indexOf(id) === -1) {
      p.out.push(c);
      p.temp.push(id);
    }
    return p;
  }, {
    temp: [],
    out: []
  }).out;
}

async function getSearch() {
  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];
  let slinkedin = await PlatformService.getSearch(dbo, config.LinkedinCollection);
  let sglassdoor = await PlatformService.getSearch(dbo, config.GlassdoorCollection);
  let smonster = await PlatformService.getSearch(dbo, config.MonsterCollection);
  let total = slinkedin.concat(sglassdoor, smonster);
  let couple = dedupe(total);
  await mongoConnection.closeConnection(db);
  return couple;
}

async function automaticScraper() {
  let searches = await getSearch();
  for(let i = 0; i < searches.length; i++) {
    fs.writeFileSync(__dirname+'/../API/status-data.json', JSON.stringify(reset));
    console.log(searches[i]._id.searchJob, searches[i]._id.searchPlace);
    await scraper(searches[i]._id.searchJob, searches[i]._id.searchPlace);
  }
} module.exports = automaticScraper
