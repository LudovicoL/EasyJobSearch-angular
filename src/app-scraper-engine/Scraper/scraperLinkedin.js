const puppeteer = require('../../../node_modules/puppeteer');
const fs = require('fs');

const MongoConnection = require('../DBConnection/MongoConnection');
const config = require('../config.json');
const scraperDetailsLinkedin = require('./scraperDetailsLinkedin');
const PlatformService = require('../Query/PlatformService');


async function scraperLinksLinkedin(url, page) {
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
    let jobData = await page.evaluate(() => {
      let jobLinks = [];
      let jobElms = document.getElementsByClassName('result-card__full-card-link');
      for (let i = 0; i<jobElms.length; i++){
        let jobJson = {};
        jobJson.link = jobElms[i].href;
        jobLinks.push(jobJson);
      }
      return jobLinks;
    });
    return jobData;
  }
  catch (error) { console.log(error); }
}

async function saveCollectionInMongo (platform) {
  let collection = config.LinkedinCollection;
  let mongoConnection = new MongoConnection();
  let connection = await mongoConnection.createConnection();
  let db = connection[0];
  let dbo = connection[1];
  try {
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
    console.log("LINKEDIN: Saved documents: "+contaSave +", Updated documents: "+contaUpdate);
    await mongoConnection.closeConnection(db);
    return [contaSave, contaUpdate, contaSkipped, skipped];
  } catch (error) { console.log(error); }
}


async function scraperLinkedin(searchedJob, searchedPlace, date) {
  console.log("LINKEDIN: Scraping started!");
  var url = `https://it.linkedin.com/jobs/search?keywords=${searchedJob}&location=${searchedPlace}&pageNum=0&position=1`;
  const browser = await puppeteer.launch({headless: true, userDataDir: __dirname+"/browserfolders/scraperLinkedin", ignoreDefaultArgs: ['--disable-extensions'], executablePath:'../../../node_modules/puppeteer/.local-chromium/win64-686378/chrome-win/chrome.exe'});
  const page = await browser.newPage();
  ///
  const session = await page.target().createCDPSession();
  const {windowId} = await session.send('Browser.getWindowForTarget');
  await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
  ///
  var links = await scraperLinksLinkedin(url, page);
  console.log("LINKEDIN: Analyzing",links.length,"links");
  let promise = [];
  for(let i = 0; i<links.length;i++)
  {
    await updateProgressLINKEDIN(i+1, links.length, false);
    promise[i] = await scraperDetailsLinkedin(links[i].link, searchedJob, searchedPlace, date, page);
  }
  await updateProgressLINKEDIN(1, links.length, true);
  let linkedinData = Promise.all(promise)
  .then(async (jsondata) => {
    await browser.close();
    let data = await saveCollectionInMongo(jsondata);
    return data;
  });
  return linkedinData;
}

function updateProgressLINKEDIN(i,total,finalize){
  let appdata = JSON.parse(fs.readFileSync(__dirname+'/../API/status-data.json'));
  if(finalize) {
    i = total;
    appdata.hasFinishedLinkedin = 1;
  }
  else {
    appdata.hasFinishedLinkedin = 0;
  }
  appdata.doneLinkedin = i;
  appdata.totalLinkedin = total;
  fs.writeFileSync(__dirname+'/../API/status-data.json',JSON.stringify(appdata));
}

module.exports = scraperLinkedin;
