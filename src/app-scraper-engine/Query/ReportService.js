const config = require('../config.json');
const ObjectID = require('mongodb').ObjectID;

module.exports = {

  saveCollections: async function (dbo, data) {
    try {
        dbo.collection(config.ReportCollection).insertOne(data);
        return 1;
    } catch (error) { console.log(error); }
  },

  update: async function (dbo, id, query) {
    try {
      let m1 = await dbo.collection(config.ReportCollection).updateOne({_id: ObjectID(id)}, query);
      return m1.modifiedCount;
    } catch (error) { console.log(error); }
  },

  delete: async function (dbo, id) {
    try {
      await dbo.collection(config.ReportCollection).deleteOne({_id: ObjectID(id)});
      return 1;
    } catch (error) { console.log(error); return 0; }
  },
}
