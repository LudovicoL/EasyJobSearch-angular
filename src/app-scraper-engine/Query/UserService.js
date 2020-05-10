const config = require('../config.json');
const ObjectID = require('mongodb').ObjectID;

module.exports = {

  saveUser: async function (dbo, data) {
    try {
        dbo.collection(config.UserCollection).insertOne(data);
        return 1;
    } catch (error) { console.log(error); }
  },

  login: async function (dbo, email, password) {
    try{
      query = {email: email, password: password};
      let document = await dbo.collection(config.UserCollection).findOne(query);
      if (document.length == 0)
        return -1;
      return document;
    } catch(error) { console.log(error); }
  },

  disable: async function (dbo, id) {
    try{
      let m1 = await dbo.collection(config.UserCollection).updateOne({_id: ObjectID(id)}, {$set: {enabled: false}});
      return m1.modifiedCount;
    } catch(error) { console.log(error); }
  },

  update: async function (dbo, id, query) {
    try {
      let m1 = await dbo.collection(config.UserCollection).updateOne({_id: ObjectID(id)}, query);
      return m1.modifiedCount;
    } catch (error) { console.log(error); }
  },

}
