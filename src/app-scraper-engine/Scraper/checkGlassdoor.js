const MongoConnection = require('../DBConnection/MongoConnection');
const JobOfferService = require('../Query/JobOfferService');
const Utilities = require('../utilities');

async function checkOffer(page, url) {
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
    return true;
  }
  await page.waitFor(500);

  let result = await page.evaluate(() => {
    if(document.evaluate(`//*[@class='css-1iqg1r5 e1eh6fgm0' and contains(., 'Lavoro')]`,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue != null) {
      return true;
    } else if(document.evaluate("//span[@class='description' and contains(., 'This job has expired')]",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue != null) {
      return false;
    }
  });
  return result;
}

async function checkGlassdoor(date, page) {
  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let contaUpdate = 0;

  let links = [];
  try {
    links = await JobOfferService.getLinks(dbo, "Glassdoor");
    for(let i = 0; i < links.length; i++) {
      let status = await checkOffer(page, links[i].url[0]);
      if (status === true) {
        continue;
      }
      else if (status === false) {
        let query = {$set: {status: {active: false, suspired: date}}};
        contaUpdate += await JobOfferService.update(dbo, links[i]._id, query);
        console.log("Offerta scaduta!", links[i].url[0]);
      }
    }
    await Utilities.sleep(0.5);
    await mongoConnection.closeConnection(db);
    console.log("Glassdoor update: " +contaUpdate);
  } catch (error) { console.log(error); }
}
module.exports = checkGlassdoor;
