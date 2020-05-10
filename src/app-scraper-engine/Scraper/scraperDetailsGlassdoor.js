const platform = "Glassdoor";


async function scraperDetailsGlassdoor(url, searchedJob, searchedPlace, date, page) {
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
    await page.waitFor(50);
    try {
      await page.waitForXPath("//*[@id='onetrust-accept-btn-handler']", {timeout: 6*1000});
    } catch(e) {}
    let cookieButton;
    [cookieButton] = await page.$x(`//*[@id='onetrust-accept-btn-handler']`);
    if(cookieButton) {
      await cookieButton.click();
    }
    let jobData = await page.evaluate(() => {
      let jobJson = {};
      try {
        jobJson.title = document.querySelector('div.css-17x2pwl.e11nt52q5').innerText;
        jobJson.company = document.getElementsByClassName('css-16nw49e e11nt52q1')[0].innerText.split("\n")[0];
        jobJson.place = document.getElementsByClassName('css-13et3b1 e11nt52q2')[0].innerText;
        jobJson.description = document.querySelector('div.desc.css-58vpdc.ecgq1xb3').innerText;
      }
      catch (error) { console.log(error); }
      return jobJson;
    });
    let tabsName = ['Azienda', 'Valutazione', 'Stipendio', 'Recensioni', 'Perché lavorare con noi', 'Benefit'];
    var [tabs] = [];

    for (let i = 0; i<tabsName.length; i++)
    {

      [tabs] = await page.$x(`//*[@class='css-1iqg1r5 e1eh6fgm0' and contains(., '${tabsName[i]}')]`);
      if (tabs) {
        await tabs.click();
        await page.waitFor(10);
        if (tabsName[i] == 'Azienda') {
          await page.waitForXPath("//div[@class='css-vugejy es5l5kg0']", {timeout: 6*1000});
          let jobData1 = await page.evaluate(() => {
            let jobJson = {};
            try {
              let allTitles = ['Sede centrale', 'Dimensioni', 'Fondata nel', 'Tipo', 'Settore', 'Segmento', 'Entrate', 'Concorrenti'];
              let titlesContent = [];
              let divs = document.getElementsByClassName('css-vugejy es5l5kg0');
              for(let i = 0; i < allTitles.length; i++) {
                for(let j = 0; j < divs.length; j++) {
                  if (divs[j].firstChild.innerText == allTitles[i]) {
                    titlesContent.push(divs[j].lastChild.innerText);
                    break;
                  }
                  if(j === divs.length - 1) {
                    titlesContent.push('');
                  }
                }
              }
              let b = (document.getElementsByClassName('value website')[0] == null || document.getElementsByClassName('value website')[0] === undefined ) ? '' : document.evaluate("//*[contains(@class,'website')]/..",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue.innerHTML.split('href="')[1].split('"')[0];
              jobJson.companyInfo = {
                headquarter: titlesContent[0],
                dimensions: titlesContent[1],
                foundationYear: titlesContent[2],
                type: titlesContent[3],
                sector: titlesContent[4],
                segment: titlesContent[5],
                incomings: titlesContent[6],
                competitors: titlesContent[7],
                url: b
              }
            } catch (error) { console.log(error, "AZIENDA"); }
            return jobJson;
          });
          jobData = Object.assign(jobData, jobData1);
        }
        else if (tabsName[i] == 'Valutazione') {
          await page.keyboard.press('End');
          await page.waitForXPath("//div[@class='empStatsBody']", {timeout: 6*1000});
          try {
            await page.waitForXPath("//*[@class='ratingType']", {timeout: 6*1000});
          } catch(e) {}
          await page.keyboard.press('Home');
          let jobData1 = await page.evaluate(() => {
            let jobJson = {};
            try {
              let allTitles = ['Stipendio e benefit', 'Cultura e valori', 'Opportunità di carriera', 'Equilibrio lavoro/vita privata', 'Dirigenti senior'];
              let titlesContent = [];
              let titles = document.getElementsByClassName('ratingType');
              let values = document.getElementsByClassName('ratingValue');
              for(let i = 0; i < allTitles.length; i++) {
                for(let j = 0; j < titles.length; j++) {
                  if (titles[j].innerText == allTitles[i]) {
                    titlesContent.push(titles[j].innerText + ': ' + values[j].innerText);
                    break;
                  }
                  if(j === titles.length - 1) {
                    titlesContent.push('');
                  }
                }
              }
              let globalValutation = document.evaluate("//div[@class='empStatsBody' and contains(.,'.')]",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue.innerText.split("\n")[0];
              jobJson.valutation = {
                global: globalValutation,
                salaryAndBenefits: titlesContent[0],
                cultureAndValues: titlesContent[1],
                careerOpportunities: titlesContent[2],
                work_privateLifeBalance: titlesContent[3],
                seniorExecutives: titlesContent[4]
              }
            } catch (error) { console.log(error); }
            return jobJson;
          });
          jobData = Object.assign(jobData, jobData1);
        }
        else if (tabsName[i] == 'Benefit') {
          await page.waitForXPath("//div[@class='mr-sm css-1orme9v eptb8nw1']", {timeout: 6*1000});
          let jobData1 = await page.$$('.mr-sm.css-1orme9v.eptb8nw1');
          jobData.benefitValutation = await (await jobData1[0].getProperty('textContent')).jsonValue();
        }

      }
    }
    jobData.platform = platform;
    jobData.url = url;
    jobData.search = [ {searchedJob:searchedJob, searchedPlace: searchedPlace, date: date} ];
    return jobData;
  }
  catch (error) { console.log(error); }
}
module.exports = scraperDetailsGlassdoor;
