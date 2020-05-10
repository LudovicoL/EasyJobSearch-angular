const scraperGlassdoor = require('./scraperGlassdoor');
const scraperLinkedin = require('./scraperLinkedin');
const scraperMonster = require('./scraperMonster');
const dataIntegration = require('../manager/dataIntegration');

const fs = require('fs');
const moment = require('moment');



function delay(time) {
  return new Promise(function(resolve) {
      setTimeout(resolve, time)
  });
}


async function scraper(searchedJob, searchedPlace) {
  let date = moment().format('DD/MM/YYYY HH:mm.ss');
  console.log('::',moment().format('DD/MM/YYYY HH:mm.ss'));
  let linkedinData = scraperLinkedin(searchedJob, searchedPlace, date).then((data) => {linkedinData = data;});
  let glassdoorData = scraperGlassdoor(searchedJob, searchedPlace, date).then((data) => {glassdoorData = data;});
  let monsterData = scraperMonster(searchedJob, searchedPlace, date).then((data) => {monsterData = data;});
  console.log("SCRAPING: SCRITTURA COMPLETATA!");
  var finishAll = false;
  while(!finishAll) {
    let appdata = await JSON.parse(fs.readFileSync(__dirname+'/../API/status-data.json'));
    let sum = appdata.hasFinishedLinkedin + appdata.hasFinishedGlassdoor + appdata.hasFinishedMonster;
    if(sum==3)
    {
      console.log('Operation complete');
      finishAll=true;
    }
    await delay(500);
  }
  await dataIntegration(date, linkedinData, glassdoorData, monsterData);

}
module.exports = scraper;
