const express = require('express');
const fs = require('fs')
const app = express();
var cors = require('cors');
const path = require('path');
const PORT = 3000;

const MongoConnection = require('../DBConnection/MongoConnection');
const JobOfferService = require('../Query/JobOfferService');
const ReportService = require('../Query/ReportService');
const UserService = require('../Query/UserService');
const Utilities = require('../utilities');

var child=null;
const reset={ "progress":"-1",
"doneLinkedin": 0,
"totalLinkedin": 0,
"hasFinishedLinkedin": 0,
"doneGlassdoor": 0,
"totalGlassdoor": 0,
"hasFinishedGlassdoor": 0,
"doneMonster": 0,
"totalMonster": 0,
"hasFinishedMonster": 0
}

app.use(cors());
app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/resources'));



app.post('/scraper', async function (req, res) {
  console.log('Scraper request received')
  if(typeof req.body.mestiere === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: Job', mestiere: null, localita: null });
    return;
  }
  let mestiere = req.body.mestiere;
  let localita = req.body.localita;
  console.log('\nQuery:');
  console.log('Job query:',mestiere);
  console.log('Location query:',localita);
  console.log(' ');
  if(child!=null) {
    child.kill()
    child=null
  }
  fs.writeFileSync('./status-data.json', JSON.stringify(reset));
  child = require('child_process').fork('../Scraper/scraperFork.js',[mestiere,localita])
  res.json({ error: null, mestiere: mestiere, localita: localita});
});

app.get('/progress', async function (req, res) {
  let progress = await fs.readFileSync('./status-data.json');
  res.send(progress);
});

app.get('/delete', async function (req, res) {
  fs.writeFileSync('./status-data.json', JSON.stringify(reset));
  console.log('RESETTED')
  res.sendStatus(200)
});

app.get('/resetProgress', async function (req, res) {
  fs.writeFileSync('./status-data.json', JSON.stringify(reset));
  console.log('progress resetted')
});

// App in ascolto sulla porta 3000:
var server = app.listen(PORT, function () {
  console.log("Easy Job Search (Dev)");
  console.log(`Server is listening on port: ${PORT}!`);
});

function killChild(child) {
  if(child!=null) {
    child.kill()
    child=null
  }
}

// USER REST API
app.post('/User/login', async function (req, res) {
  if(typeof req.body.email === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: Email', email: null, password: null });
    return;
  }
  if(typeof req.body.password === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: Password', email: null, password: null });
    return;
  }
  let email = req.body.email;
  let password = req.body.password;

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let user = await UserService.login(dbo, email, password);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(user);
});

app.post('/User/disable', async function (req, res) {
  if(typeof req.body.id === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: id', id: null});
    return;
  }
  let id = req.body.id;

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let update = await UserService.disable(dbo, id);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(update);
});

app.post('/User/update', async function (req, res) {
  if(typeof req.body.id === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: id', id: null});
    return;
  }

  let id = req.body.id;

  var query = {};
  if (req.body.name) query.name = req.body.name;
  if (req.body.surname) query.cognome = req.body.cognome;
  if (req.body.dob) query.dob = req.body.dob;
  if (req.body.email) query.email = req.body.email;
  if (req.body.username) query.username = req.body.username;
  if (req.body.password) query.password = req.body.password;
  if (req.body.address) query.address = req.body.address;
  if (req.body.phone) query.address = req.body.phone;

  query = { $set: query }

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let update = await UserService.update(dbo, id, query);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(update);
});

app.post('/User/saveUser', async function (req, res) {
  if(typeof req.body.email === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: email', email: null});
    return;
  }
  if(typeof req.body.password === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: password', password: null});
    return;
  }

  var query = {};
  if (req.body.name) query.name = req.body.name;
  if (req.body.surname) query.cognome = req.body.cognome;
  if (req.body.dob) query.dob = req.body.dob;
  if (req.body.email) query.email = req.body.email;
  if (req.body.username) query.username = req.body.username;
  if (req.body.password) query.password = req.body.password;
  if (req.body.type) query.type = req.body.type;
  query.enable = true;
  if (req.body.address) query.address = req.body.address;
  if (req.body.phone) query.address = req.body.phone;

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let update = await UserService.saveUser(dbo, query);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(update);
});

// JOBOFFER REST API
app.post('/JobOffer/getDocuments', async function (req, res) {
  let titolo = "";
  let luogo = "";
  let query;
  if (req.body.title) titolo = req.body.title;
  if (req.body.place) luogo = req.body.place;

  if(titolo != "" && luogo != "") {
    query = {title: {$regex: titolo}, place: luogo};
  } else if(titolo != "" && luogo == "") {
    query = {title: {$regex: titolo}};
  } else if(titolo == "" && luogo != "") {
    query = {place: luogo};
  } else {
    res.status(400).json({ error: 'Enter at least one parameter', titolo: null, luogo: null});
    return;
  }

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let documents = await JobOfferService.getDocuments(dbo, query);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(documents);
});

app.get('/JobOffer/getLinksLinkedin', async function (req, res) {
  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let links = await JobOfferService.getLinks(dbo, "Linkedin");
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);
  res.send(links);
});

app.get('/JobOffer/getLinksGlassdoor', async function (req, res) {
  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let links = await JobOfferService.getLinks(dbo, "Glassdoor");
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);
  res.send(links);
});

app.get('/JobOffer/getLinksMonster', async function (req, res) {
  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let links = await JobOfferService.getLinks(dbo, "Monster");
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);
  res.send(links);
});

app.post('/JobOffer/count', async function (req, res) {
  let titolo = "";
  let luogo = "";
  let query;
  if (req.body.title) titolo = req.body.title;
  if (req.body.place) luogo = req.body.place;

  if(titolo != "" && luogo != "") {
    query = {title: {$regex: titolo}, place: luogo};
  } else if(titolo != "" && luogo == "") {
    query = {title: {$regex: titolo}};
  } else if(titolo == "" && luogo != "") {
    query = {place: luogo};
  } else {
    res.status(400).json({ error: 'Enter at least one parameter', titolo: null, luogo: null});
    return;
  }

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let count = await JobOfferService.countCollections(dbo, query);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(count);
});

app.post('/JobOffer/getId', async function (req, res) {
  var query = {};
  if (req.body.title) query.title = req.body.title;
  if (req.body.company) query.company = req.body.company;
  if (req.body.place) query.place = req.body.place;
  if (req.body.description) query.description = req.body.description;
  if (req.body.platform) query.platform = req.body.platform;

  if (query == {}) {
    res.status(400).json({ error: 'Enter at least one parameter!'});
    return;
  }

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let id = await JobOfferService.getId(dbo, query);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(id);
});

// REPORT REST API
app.post('/Report/setReadFlag', async function (req, res) {

  if(typeof req.body.id === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: id', id: null});
    return;
  }

  let id = req.body.id;

  query = { $set: {read: true} };

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let update = await ReportService.update(dbo, id, query);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(update);
});

app.post('/Report/delete', async function (req, res) {

  if(typeof req.body.id === 'undefined') {
    res.status(400).json({ error: 'Missing parameter: id', id: null});
    return;
  }

  let id = req.body.id;

  const mongoConnection = new MongoConnection();
  const connection = await mongoConnection.createConnection();
  const db = connection[0];
  const dbo = connection[1];

  let deleted = await ReportService.delete(dbo, id);
  await Utilities.sleep(0.5);
  await mongoConnection.closeConnection(db);

  res.json(deleted);
});
