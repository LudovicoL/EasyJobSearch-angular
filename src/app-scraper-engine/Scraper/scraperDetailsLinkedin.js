const platform = "Linkedin";


async function scraperDetailsLinkedin(url, searchedJob, searchedPlace, date, page) {
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
    await page.waitFor(500);
    let jobData = await page.evaluate(() => {
      let jobJson = {};
      try {
        jobJson.title = document.querySelector('h1.topcard__title').innerText;
        jobJson.company = document.querySelector('a.topcard__org-name-link').innerText;
        jobJson.place = document.getElementsByClassName('topcard__flavor topcard__flavor--bullet')[0].innerText;
        jobJson.description = document.getElementsByClassName('description__text description__text--rich')[0].innerText;
        var a = document.getElementsByClassName('job-criteria__subheader');
        for (let i = 0; i<a.length; i++)
        {
          if(a[i].innerText == "Livello di anzianità")
            jobJson.seniority = document.getElementsByClassName('job-criteria__text job-criteria__text--criteria')[i].innerText;
          else if(a[i].innerText == "Tipo di impiego")
            jobJson.typeEmployment = document.getElementsByClassName('job-criteria__text job-criteria__text--criteria')[i].innerText;
          else if(a[i].innerText == "Funzione lavorativa")
            jobJson.workFunction = document.getElementsByClassName('job-criteria__text job-criteria__text--criteria')[i].innerText;
          else if(a[i].innerText == "Settori")
            jobJson.sectors = document.getElementsByClassName('job-criteria__text job-criteria__text--criteria')[i].innerText;
        }
      }
      catch (error) { console.log(error); }
      return jobJson;
    });
    jobData.platform = platform;
    let interrogativePosition = url.indexOf('?');
    let cutUrl = url.substr(0, interrogativePosition);
    jobData.url = cutUrl;
    jobData.search = [ {searchedJob:searchedJob, searchedPlace: searchedPlace, date: date} ];
    return jobData;
  }
  catch (error) { console.log(error); }
}
module.exports = scraperDetailsLinkedin;
