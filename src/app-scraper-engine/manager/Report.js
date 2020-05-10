class Report {

  type;
  date;
  linkedin;
  glassdoor;
  monster;
  dataIntegration;

  constructor(type, date, reports) {
    this.type = type;
    this.date = date;
    this.linkedin = reports[0];
    this.glassdoor = reports[1];
    this.monster = reports[2];
    this.dataIntegration = reports[3];
  }

  createDocument() {
    let dataToSave = {
      type: this.type,
      date: this.date,
      details: {
        linkedin: this.linkedin,
        glassdoor: this.glassdoor,
        monster: this.monster,
        dataIntegration: this.dataIntegration
      },
      read: false
    }
    return dataToSave;
  }

} module.exports = Report
