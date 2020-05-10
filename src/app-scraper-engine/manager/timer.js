const checkActive = require('../Scraper/checkActive');
const automaticScraper = require('../Scraper/automaticScraper');
const Utilities = require('../utilities');

function convertDate(date) {
  let year = date.getFullYear();
  let month = date.getMonth()+1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return year +"/" +month +"/" +day +" " +hours +":" +minutes +":" +seconds;
}

async function checkoclock(hour) {
  while(true)
  {
      let date = new Date();
      if(date.getHours() === hour && date.getMinutes() >= 0 ) {
          console.log("Fine dell'attesa!");
          break;
      }
      else{
          console.log("Bisogna aspettare!");
          await Utilities.sleep(60);
      }
  }
}



async function timer() {
  while(true)
  {
    let date = new Date();
    let hour = date.getHours();
    if( hour === 17 ) {
      await automaticScraper();
      await checkActive();
    }
    if( hour === 00 ){
      console.log(convertDate(date) + " Aspetto le "+(hour+1)+":00...");
      await checkoclock();
      continue;
    }
    if( hour >= 02 ) {
      console.log(convertDate(date) + " Attendo un'ora...");
      await Utilities.sleep(3600);
      continue;
    }
  }
} module.exports = timer

timer()
