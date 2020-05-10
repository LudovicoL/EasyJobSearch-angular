var MongoClient = require('mongodb').MongoClient;
var config = require('../config.json');

class MongoConnection {
    constructor() {}

    async createConnection() {
      const db = await MongoClient.connect(config.urlMongoDB, { useUnifiedTopology: true });
      var dbo = db.db(config.nameDatabase);
      return [db, dbo];
    }

    async closeConnection(db) {
      db.close();
    }

} module.exports = MongoConnection
