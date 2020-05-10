class JobOffer {
  title;
  company;
  place;
  description;
  seniority;
  typeEmployment;
  workFunction;
  sectors;
  contract;
  publicationDate;
  headquarter;
  dimensions;
  foundationYear;
  type;
  companySector;
  segment;
  incomings;
  competitors;
  companyUrl;
  global;
  salaryAndBenefits;
  cultureAndValues;
  careerOpportunities;
  work_privateLifeBalance;
  seniorExecutives;
  benefitValutation;
  platform;
  url

  constructor(document)
    {
    this.title = document.title;
    this.company = document.company;
    this.place = document.place;
    this.description = document.description;
    this.seniority = "";
    this.typeEmployment = "";
    this.workFunction = "";
    this.sectors = "";
    this.contract = "";
    this.publicationDate = "";
    this.headquarter = "";
    this.dimensions = "";
    this.foundationYear = "";
    this.type = "";
    this.companySector = "";
    this.segment = "";
    this.incomings = "";
    this.competitors = "";
    this.companyUrl = "";
    this.global = "";
    this.salaryAndBenefits = "";
    this.cultureAndValues = "";
    this.careerOpportunities = "";
    this.work_privateLifeBalance = "";
    this.seniorExecutives = "";
    this.benefitValutation = "";
    this.platform = document.platform;
    this.url = document.url;
    if (document.platform === 'Linkedin') {
      this.seniority = document.seniority;
      this.typeEmployment = document.typeEmployment;
      this.workFunction = document.workFunction;
      this.sectors = document.sectors;
    } else if (document.platform === 'Glassdoor') {
      if(document.companyInfo !== undefined) {
        document.companyInfo.headquarter !== undefined ? this.headquarter = document.companyInfo.headquarter : this.headquarter = '';
        document.companyInfo.dimensions !== undefined ? this.dimensions = document.companyInfo.dimensions : this.dimensions = '';
        document.companyInfo.foundationYear !== undefined ? this.foundationYear = document.companyInfo.foundationYear : this.foundationYear = '';
        document.companyInfo.type !== undefined ? this.type = document.companyInfo.type : this.type = '';
        document.companyInfo.sector !== undefined ? this.companySector = document.companyInfo.sector : this.companySector = '';
        document.companyInfo.segment !== undefined ? this.segment = document.companyInfo.segment : this.segment = '';
        document.companyInfo.incomings !== undefined ? this.incomings = document.companyInfo.incomings : this.incomings = '';
        document.companyInfo.competitors !== undefined ? this.competitors = document.companyInfo.competitors : this.competitors = '';
        document.companyInfo.url !== undefined ? this.companyUrl = document.companyInfo.url : this.companyUrl = '';
      }
      if(document.valutation !== undefined) {
        document.valutation.global !== undefined ? this.global = document.valutation.global : this.global = '';
        document.valutation.salaryAndBenefits !== undefined ? this.salaryAndBenefits = document.valutation.salaryAndBenefits : this.salaryAndBenefits = '';
        document.valutation.cultureAndValues !== undefined ? this.cultureAndValues = document.valutation.cultureAndValues : this.cultureAndValues = '';
        document.valutation.careerOpportunities !== undefined ? this.careerOpportunities = document.valutation.careerOpportunities : this.careerOpportunities = '';
        document.valutation.work_privateLifeBalance !== undefined ? this.work_privateLifeBalance = document.valutation.work_privateLifeBalance : this.work_privateLifeBalance = '';
        document.valutation.seniorExecutives !== undefined ? this.seniorExecutives = document.valutation.seniorExecutives : this.seniorExecutives = '';
      }
      if(document.benefitValutation !== undefined) {
        this.benefitValutation = document.benefitValutation;
      }
    } else if (document.platform === 'Monster') {
      this.contract = document.contract;
      this.publicationDate = document.publicationDate;
      this.sectors = document.sectors;
    }

  }

  createDocument() {
    let dataToSave = {
      title: this.title,
      company: this.company,
      place: this.place,
      description: this.description,
      seniority: this.seniority,
      typeEmployment: this.typeEmployment,
      workFunction: this.workFunction,
      sectors: this.sectors,
      contract: this.contract,
      publicationDate: this.publicationDate,
      companyInfo: {
        headquarter: this.headquarter,
        dimensions: this.dimensions,
        foundationYear: this.foundationYear,
        type: this.type,
        sector: this.companySector,
        segment: this.segment,
        incomings: this.incomings,
        competitors: this.competitors,
        url: this.companyUrl
      },
      valutation: {
        global: this.global,
        salaryAndBenefits: this.salaryAndBenefits,
        cultureAndValues: this.cultureAndValues,
        careerOpportunities: this.careerOpportunities,
        work_privateLifeBalance: this.work_privateLifeBalance,
        seniorExecutives: this.seniorExecutives
      },
      benefitValutation: this.benefitValutation,
      platform: [this.platform],
      url: [this.url],
      status: true
    }
    return dataToSave;
  }

} module.exports = JobOffer
