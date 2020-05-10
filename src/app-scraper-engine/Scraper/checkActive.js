const moment = require('moment');

const checkLinkedin = require('./checkLinkedin');
const checkGlassdoor = require('./checkGlassdoor');
const checkMonster = require('./checkMonster');

const puppeteer = require('../../../node_modules/puppeteer');


async function checkActive() {
  const date = moment().format('DD/MM/YYYY HH:mm.ss');

  const browser = await puppeteer.launch({headless: false, userDataDir: __dirname+"/browserfolders/checkActive", ignoreDefaultArgs: ['--disable-extensions'], executablePath:'../../../node_modules/puppeteer/.local-chromium/win64-686378/chrome-win/chrome.exe'});
  const page = await browser.newPage();

  await checkLinkedin(date, page);
  await checkGlassdoor(date, page);
  await checkMonster(date, page);
}
module.exports = checkActive;
