const puppeteer = require('../../../node_modules/puppeteer');
const fs = require('fs');
const Apify = require('apify');

const config = require('../config.json');
const scraperDetailsGlassdoor = require('./scraperDetailsGlassdoor');
const MongoConnection = require('../DBConnection/MongoConnection');
const PlatformService = require('../Query/PlatformService');
const parallelize = false;
const url = `https://www.glassdoor.com/blog/tag/job-search/`;


async function scraperLinksGlassdoor(url, searchedJob, searchedPlace, page) {
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
    try {
      await page.waitForSelector('input[name="sc.keyword"]',{timeout:30000});
    }
    catch(err){return [];}
    await page.waitFor(1000);
    await page.type('input[name="sc.keyword"]', searchedJob);
    await page.type('input[id="sc.location"]', searchedPlace);
    await page.click('button[type="submit"]');
    await page.waitFor(1000);
    try {
      await page.waitForNavigation();
    }
    catch(err){console.log(err,'waited for navigation')}

    let jobData = await page.evaluate(() => {
      let jobLinks = [];
      let jobElms = document.getElementsByClassName('jobHeader');
      console.log("Elementi di scraping: " +jobElms.length);
      for (let i = 0; i<jobElms.length; i++){
        let jobJson = {};
        jobJson.link = document.querySelectorAll('div.jobHeader > a')[i].href;
        jobLinks.push(jobJson);
      }
      return jobLinks;
    });
    return jobData;
  }
  catch (error) { console.log(error); }
}

async function saveCollectionInMongo (platform) {
  let collection = config.GlassdoorCollection;
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
    console.log("GLASSDOOR: Saved documents: "+contaSave +", Updated documents: "+contaUpdate);
    await mongoConnection.closeConnection(db);
    return [contaSave, contaUpdate, contaSkipped, skipped];
  } catch (error) { console.log(error); }
}


async function scraperGlassdoor(searchedJob, searchedPlace, date) {
  console.log("\nGLASSDOOR: Scraping started!");
  let error;
  let browser;
  let page;
  do {
    error = false;
    try {
      // Temporarily disables console logs
      const clog = console.log;
      const clogwarn = console.warn;
      const clogerror = console.error;
      const cloginfo = console.info;
      const clogassert = console.assert;
      console.log =  function(){};
      console.warn =  function(){};
      console.error = function(){};
      console.info = function(){};
      console.assert = function(){};
      //
      browser = await Apify.launchPuppeteer({
        headless: true,
        userDataDir: __dirname+"/browserfolders/scraperGlassdoor",
        args: [
          "--no-sandbox",
          // "--disable-gpu",
          "--enable-low-res-tiling",
          "--fast-start",
          "--blink-settings=imagesEnabled=false",
          '--window-size=1920,4000'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        executablePath:'../../../node_modules/puppeteer/.local-chromium/win64-686378/chrome-win/chrome.exe'
      });


      // Re-enable console logs
      console.log = await clog;
      console.warn = await clogwarn;
      console.error = await clogerror;
      console.info = await cloginfo;
      console.assert = await clogassert;
      //


      page = await browser.newPage();
      const session = await page.target().createCDPSession();
      await session.send('Page.enable');
      await session.send('Page.setWebLifecycleState', {state: 'active'});
      await page.setViewport({ width: 1920, height: 3000 });
    }
    catch(e) {
      error = true;
      // await browser.close();
      console.log("ApyError in Glassdoor!");
    }
  } while(error == true);
  var links = await scraperLinksGlassdoor(url, searchedJob, searchedPlace, page);
  console.log("\nGLASSDOOR: Analyzing",links.length,"links");
  let promise = [];
  if(!parallelize){
    for(let i = 0; i<links.length;i++)
    {
      promise[i] = await scraperDetailsGlassdoor(links[i].link, searchedJob, searchedPlace, date, page);
      await updateProgressGLASSDOOR(i+1,links.length,false)
    }
  }
  else{
      console.log('Parallel scraping')
      await links.forEach(function(entry, i) {

          promise[i] = scraperDetailsGlassdoor(entry.link, searchedJob, searchedPlace, date, page);
          process.stdout.write(" . ");
          updateProgressGLASSDOOR(i,links.length,false)

      });
    console.log('End parallel scraping')
  }
await updateProgressGLASSDOOR(0,links.length,true)
 let glassdoorData = Promise.all(promise)
  .then(async (jsondata) => {
    await browser.close();
    let data = await saveCollectionInMongo(jsondata);
    return data;
  });
  return glassdoorData;
}



async function updateProgressGLASSDOOR(i,total,finalize) {
  let appdata = JSON.parse(fs.readFileSync(__dirname+'/../API/status-data.json'));
  if(finalize) {
    i=total;
    appdata.hasFinishedGlassdoor = 1;
    appdata.doneGlassdoor = i;
    appdata.totalGlassdoor = total;
  } else {
    appdata.hasFinishedGlassdoor = 0;
    appdata.doneGlassdoor = appdata.doneGlassdoor + 1;
    appdata.totalGlassdoor = total;
  }
  fs.writeFileSync(__dirname+'/../API/status-data.json', JSON.stringify(appdata));
}

module.exports = scraperGlassdoor;
