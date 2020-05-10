const platform = "Monster";


async function scraperDetailsMonster(url, searchedJob, searchedPlace, date, page) {
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
      return url;
    }
    await page.waitFor(1000);

    let jobData = await page.evaluate(async () => {
      let jobJson = {};
      try {
        if(document.querySelector('h1.job_title') == null) {
          jobJson.title = await document.querySelector('h1.title').innerText;
        } else {
          jobJson.title = await document.querySelectorAll('h1.job_title')[0].innerText;
        }
        if(document.querySelector('div.location.c-gray-6') == null) {
          jobJson.place = await document.querySelector('h2.subtitle').innerText;
        } else {
          jobJson.place = await document.querySelector('div.location.c-gray-6').innerText;
        }


        if (document.querySelector('div.job_company_name.tag-line.c-primary') == null) {
          jobJson.company = document.querySelector('h3.name').innerText;
        } else {
          jobJson.company = document.querySelector('div.job_company_name.tag-line.c-primary').innerText;
        }
        if (document.querySelector('div.job-description.col-md-8.col-sm-12.order-2.order-sm-2.order-md-1') == null) {
          jobJson.description = document.querySelector('div.details-content').innerText;
        } else {
          jobJson.description = document.querySelector('div.job-description.col-md-8.col-sm-12.order-2.order-sm-2.order-md-1').innerText;
        }


        if (document.evaluate("//div[@class='job-details container col-md-4 col-sm-12 order-1 order-sm-1 order-md-2']",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue==null) {
          jobJson.contract = await document.evaluate("//dl[@class='header' and contains(.,'Tipo di contratto')]",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue.innerText.split("\n")[1];
          jobJson.publicationDate = await document.evaluate("//dl[@class='header' and contains(.,'Data di pubblicazione')]",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue.innerText.split("\n")[1];
          jobJson.sectors = await document.evaluate("//dl[@class='header' and contains(.,'Settori')]",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue.innerText.split("\n")[1];
        } else{
        jobJson.contract = await document.getElementsByName('value_job_type')[0].innerText;
        jobJson.publicationDate = await document.getElementsByName('value_posted')[0].innerText;
        jobJson.sectors = '';
        }

      }
      catch (error) { console.log(error); console.log(jobJson.title); }
      return jobJson;
    });
    jobData.platform = platform;
    let prefix = url.split('?')[0] + '?';
    let suffix = url.split('&')[url.split('&').length-1];
    let cutUrl = prefix.concat(suffix);
    jobData.url = cutUrl;
    jobData.search = [ {searchedJob:searchedJob, searchedPlace: searchedPlace, date: date} ];
    return jobData;
  }
  catch (error) { console.log(error); }
}
module.exports = scraperDetailsMonster;
