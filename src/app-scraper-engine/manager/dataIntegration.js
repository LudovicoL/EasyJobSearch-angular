const MongoConnection = require('../DBConnection/MongoConnection');
const config = require('../config.json');
const PlatformService = require('../Query/PlatformService');
const JobOfferService = require('../Query/JobOfferService');
const ReportService = require('../Query/ReportService');
const JobOffer = require('./JobOffer');
const Report = require('./Report');
const Utilities = require('../utilities');

const defaultPerc = 0.94;

function quasiEquals(s, t, perc) {
  if(!s) {
    s = "";
  }
  if(!t) {
    t = "";
  }
  if (!perc) {
    perc = defaultPerc;
  }
  let len = Math.min(s.length, t.length);
  th = (len * (1 - perc)).toFixed(0);
  th = parseInt(th);
  if (getEditDistance(s.toLowerCase(), t.toLowerCase()) > th) {
    return false;
  } else {
    return true;
  }
}

function getEditDistance (a, b) {
  if(a.length == 0) return b.length;
  if(b.length == 0) return a.length;

  var matrix = [];

  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

async function dataIntegration(date, linkedinReport, glassdoorReport, monsterReport) {
  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];
  let contaSave = 0;
  let contaUpdate = 0;
  var query = { search: { $elemMatch: {date: date }}};
  let linkedinData = await PlatformService.getDocuments(dbo, config.LinkedinCollection, query);
  for(let i = 0; i < linkedinData.length; i++) {
    let jobOffer = new JobOffer(linkedinData[i]).createDocument();
    query = {company: linkedinData[i].company, place: linkedinData[i].place};
    let g2 = await PlatformService.getDocuments(dbo, config.JobOfferCollection, query);
    if(g2 != -1) {
      for(let j = 0; j < g2.length; j++) {
        let g1 = g2[j];
        if (quasiEquals(jobOffer.title, g1.title, null)) {
          if(jobOffer.seniority != "" && g1.seniority == "") {
            query = {$set: {seniority: jobOffer.seniority}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          if(jobOffer.typeEmployment != "" && g1.typeEmployment == "") {
            query = {$set: {typeEmployment: jobOffer.typeEmployment}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          if(jobOffer.workFunction != "" && g1.workFunction == "") {
            query = {$set: {workFunction: jobOffer.workFunction}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          if(jobOffer.sectors != "" && g1.sectors == "") {
            query = {$set: {sectors: jobOffer.sectors}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          query = {$addToSet: {platform: jobOffer.platform[0]}};
          contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          query = {$addToSet: {url: jobOffer.url[0]}};
          contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          break;
        }
        else if(j == g2.length-1) {
          contaSave += await JobOfferService.saveCollections(dbo, jobOffer);
        }
      }
    }
    else {
      contaSave += await JobOfferService.saveCollections(dbo, jobOffer);
    }
  }

  query = { search: { $elemMatch: {date: date }}};
  let glassdoorData = await PlatformService.getDocuments(dbo, config.GlassdoorCollection, query);
  for(let i = 0; i < glassdoorData.length; i++) {
    let jobOffer = new JobOffer(glassdoorData[i]).createDocument();;
    query = {company: glassdoorData[i].company, place: glassdoorData[i].place};
    let g2 = await PlatformService.getDocuments(dbo, config.JobOfferCollection, query);
    if(g2 != -1) {
      for(let j = 0; j < g2.length; j++) {
        let g1 = g2[j];
        if (quasiEquals(jobOffer.title, g1.title, null)) {
          if(jobOffer.companyInfo !== undefined) {
            if(jobOffer.companyInfo.headquarter != "" && g1.companyInfo.headquarter == "") {
              query = {$set: {"companyInfo.headquarter": jobOffer.companyInfo.headquarter}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.dimensions != "" && g1.companyInfo.dimensions == "") {
              query = {$set: {"companyInfo.dimensions": jobOffer.companyInfo.dimensions}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.foundationYear != "" && g1.companyInfo.foundationYear == "") {
              query = {$set: {"companyInfo.foundationYear": jobOffer.companyInfo.foundationYear}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.type != "" && g1.companyInfo.type == "") {
              query = {$set: {"companyInfo.type": jobOffer.companyInfo.type}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.sector != "" && g1.companyInfo.sector == "") {
              query = {$set: {"companyInfo.sector": jobOffer.companyInfo.sector}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.segment != "" && g1.companyInfo.segment == "") {
              query = {$set: {"companyInfo.segment": jobOffer.companyInfo.segment}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.incomings != "" && g1.companyInfo.incomings == "") {
              query = {$set: {"companyInfo.incomings": jobOffer.companyInfo.incomings}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.competitors != "" && g1.companyInfo.competitors == "") {
              query = {$set: {"companyInfo.competitors": jobOffer.companyInfo.competitors}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.companyInfo.url != "" && g1.companyInfo.url == "") {
              query = {$set: {"companyInfo.url": jobOffer.companyInfo.url}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
          }
          if(jobOffer.valutation !== undefined) {
            if(jobOffer.valutation.global != "" && g1.valutation.global == "") {
              query = {$set: {"valutation.global": jobOffer.valutation.global}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.valutation.salaryAndBenefits != "" && g1.valutation.salaryAndBenefits == "") {
              query = {$set: {"valutation.salaryAndBenefits": jobOffer.valutation.salaryAndBenefits}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.valutation.cultureAndValues != "" && g1.valutation.cultureAndValues == "") {
              query = {$set: {"valutation.cultureAndValues": jobOffer.valutation.cultureAndValues}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.valutation.careerOpportunities != "" && g1.valutation.careerOpportunities == "") {
              query = {$set: {"valutation.careerOpportunities": jobOffer.valutation.careerOpportunities}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.valutation.work_privateLifeBalance != "" && g1.valutation.work_privateLifeBalance == "") {
              query = {$set: {"valutation.work_privateLifeBalance": jobOffer.valutation.work_privateLifeBalance}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
            if(jobOffer.valutation.seniorExecutives != "" && g1.valutation.seniorExecutives == "") {
              query = {$set: {"valutation.seniorExecutives": jobOffer.valutation.seniorExecutives}};
              contaUpdate += await JobOfferService.update(dbo, g1._id, query);
            }
          }
          if(jobOffer.benefitValutation !== undefined & jobOffer.benefitValutation != "" && g1.benefitValutation == "") {
            query = {$set: {benefitValutation: jobOffer.benefitValutation}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          query = {$addToSet: {platform: jobOffer.platform[0]}};
          contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          query = {$addToSet: {url: jobOffer.url[0]}};
          contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          break;
        }
        else if(j == g2.length-1) {
          contaSave += await JobOfferService.saveCollections(dbo, jobOffer);
        }
      }
    }
    else {
      contaSave += await JobOfferService.saveCollections(dbo, jobOffer);
    }
  }

  query = { search: { $elemMatch: {date: date }}};
  let monsterData = await PlatformService.getDocuments(dbo, config.MonsterCollection, query);
  for(let i = 0; i < monsterData.length; i++) {
    let jobOffer = new JobOffer(monsterData[i]).createDocument();
    query = {company: monsterData[i].company, place: monsterData[i].place};
    let g2 = await PlatformService.getDocuments(dbo, config.JobOfferCollection, query);
    if(g2 != -1) {
      for(let j = 0; j < g2.length; j++) {
        let g1 = g2[j];
        if (quasiEquals(jobOffer.title, g1.title, null)) {
          if(jobOffer.contract != "" && g1.contract == "") {
            query = {$set: {contract: jobOffer.contract}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          if(jobOffer.publicationDate != "" && g1.publicationDate == "") {
            query = {$set: {publicationDate: jobOffer.publicationDate}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          if(jobOffer.sectors != "" && g1.sectors == "") {
            query = {$set: {sectors: jobOffer.sectors}};
            contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          }
          query = {$addToSet: {platform: jobOffer.platform[0]}};
          contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          query = {$addToSet: {url: jobOffer.url[0]}};
          contaUpdate += await JobOfferService.update(dbo, g1._id, query);
          break;
        }
        else if(j == g2.length-1) {
          contaSave += await JobOfferService.saveCollections(dbo, jobOffer);
        }
      }
    }
    else {
      contaSave += await JobOfferService.saveCollections(dbo, jobOffer);
    }
  }

  console.log("DATA INTEGRATION: Saved documents: "+contaSave +", Updated documents: "+contaUpdate);

  let dataIntegrationReport = [contaSave, contaUpdate];
  let reports = [linkedinReport, glassdoorReport, monsterReport, dataIntegrationReport];
  let report = new Report("Report", date, reports).createDocument();

  await ReportService.saveCollections(dbo, report);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);
}
module.exports = dataIntegration;
