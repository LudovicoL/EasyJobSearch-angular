const config = require('../config.json');

module.exports = {

  countCollections: async function (dbo, query) {
    try {
      let count = await dbo.collection(config.JobOfferCollection).countDocuments(query);
      return count;
    } catch (error) { console.log(error); }
  },

  saveCollections: async function (dbo, dataToSave) {
    try {
        dbo.collection(config.JobOfferCollection).insertOne(dataToSave);
        return 1;
    } catch (error) { console.log(error); }
  },

  getId: async function (dbo, query) {
    try {
      let document = await dbo.collection(config.JobOfferCollection).findOne(query);
      return document._id;
    } catch (error) { console.log(error); }
  },

  update: async function (dbo, id, query) {
    try {
      let m1 = await dbo.collection(config.JobOfferCollection).updateOne({_id: id}, query);
      return m1.modifiedCount;
    } catch (error) { console.log(error); }
  },

  getDocuments: async function (dbo, query) {
    try{
      let document = await dbo.collection(config.JobOfferCollection).find(query).toArray();
      if (document.length == 0)
        return -1;
      return document;
    } catch(error) { console.log(error); }
  },

  getLinks: async function (dbo, platform) {
    try{
      let query = {platform: platform, status: true};
      let projection = {projection:{ url: 1 }};
      let document = await dbo.collection(config.JobOfferCollection).find(query, projection).toArray();
      if (document.length == 0)
        return -1;
      return document;
    } catch(error) { console.log(error); }
  }

}
