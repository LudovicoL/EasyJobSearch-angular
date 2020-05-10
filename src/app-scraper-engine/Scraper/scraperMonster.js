const puppeteer = require('../../../node_modules/puppeteer');
const fs = require('fs');

const MongoConnection = require('../DBConnection/MongoConnection');
const PlatformService = require('../Query/PlatformService');
const config = require('../config.json');
const scraperDetailsMonster = require('./scraperDetailsMonster');


async function scraperLinksMonster(url, page) {
  try {
    let success = false;
    let attempt = 0;
    while(attempt < 10 && !success) {
      try {
        await page.goto(url, {timeout: 10*1000});
        success = true;
      }
      catch(e) {
        attempt++;
      }
    }
    if(!success) {
      console.log("TIMEOUT SKIP", url);
      return [];
    }
    let [checkResult] = await page.$x("//*[@class='pivot block' and (contains(., 'Nessun risultato') or contains(., 'No result'))]")
    if(checkResult)
    {
      console.log('No results on Monster')
      return []
    }
    let jobData = await page.evaluate(() => {
      let jobLinks = [];
      let body= document.body.textContent;
      let jobElms = document.querySelectorAll('section.card-content[data-jobid]');
      console.log(jobElms);
      jobElms.forEach((jobElement) => {
        let jobJson = {};
        try {
          jobJson.link = jobElement.querySelector('h2.title > a').href;
        }
        catch (exception){}
        jobLinks.push(jobJson);
      });
      return jobLinks;
    });
    if(!jobData) {
      jobData = [];
    }
    return jobData;
  }
  catch (error) { console.log(error); }
}

async function saveCollectionInMongo (platform) {
  let collection = config.MonsterCollection;
  let mongoConnection = new MongoConnection();
  let connection = await mongoConnection.createConnection();
  let db = connection[0];
  let dbo = connection[1];
  try {
    let conta = [];
    let contaSave = 0;
    let contaUpdate = 0;
    let contaSkipped = 0;
    let skipped = [];
    for(let i = 0; i<platform.length;i++){

      if(platform[i]==null || platform[i].title === undefined || platform[i].company === undefined || platform[i].place === undefined) {
        contaSkipped++;
        skipped.push(platform[i]);
        continue;
      }

      let id = await PlatformService.getId(dbo, collection, platform[i]);
      if(id === -1) {
        contaSave += await PlatformService.saveCollections(dbo, collection, platform[i]);
      }
      else {
        let countUpdate = await PlatformService.update(dbo, collection, platform[i], id);
        if(countUpdate>0) {
          contaUpdate++;
        }
      }

    }
    console.log("MONSTER: Saved documents: "+contaSave +", Updated documents: "+contaUpdate);
    await mongoConnection.closeConnection(db);
    return [contaSave, contaUpdate, contaSkipped, skipped];
  } catch (error) { console.log(error); }
}


async function scraperMonster(searchedJob, searchedPlace, date) {
  console.log("\nMONSTER: Scraping started");
  var url = `https://www.monster.it/lavoro/cerca/?q=${searchedJob}&where=${searchedPlace}&client=classic&cy=it&rad=20&intcid=swoop_Hero_Search`;
  const browser = await puppeteer.launch({headless: true, userDataDir: __dirname+"/browserfolders/scraperMonster", ignoreDefaultArgs: ['--disable-extensions'], executablePath:'../../../node_modules/puppeteer/.local-chromium/win64-686378/chrome-win/chrome.exe'});   // HEADLESS
  const page = await browser.newPage();
  var links = await scraperLinksMonster(url, page);
  console.log("\nMONSTER: Analyzing",links.length,"links");
  let promise = [];
  for(let i = 0; i<links.length;i++)
  {
    await updateProgressMONSTER(i+1, links.length, false)
    promise[i] = await scraperDetailsMonster(links[i].link, searchedJob, searchedPlace, date, page);
    await updateProgressMONSTER(i+1, links.length, false);
  }
  updateProgressMONSTER(1, links.length, true);
  let monsterData = Promise.all(promise)
  .then(async (jsondata) => {
    await browser.close();
    let data = await saveCollectionInMongo(jsondata);
    return data;
  });
  return monsterData;
}


function updateProgressMONSTER(i,total,finalize){
  let appdata = JSON.parse(fs.readFileSync(__dirname+'/../API/status-data.json'));
  if(finalize) {
    i = total;
    appdata.hasFinishedMonster = 1;
  }
  else {
    appdata.hasFinishedMonster = 0;
  }
  appdata.doneMonster = i;
  appdata.totalMonster = total;
  fs.writeFileSync(__dirname+'/../API/status-data.json',JSON.stringify(appdata));
}

module.exports = scraperMonster;
