module.exports = {

  countCollections: async function (dbo, collection, platform) {
    try {
      let commaPosition = platform.place.indexOf(',');
      let cutLocalita;
      if(commaPosition==-1)
        cutLocalita = platform.place;
      else
        cutLocalita = platform.place.substring(0, commaPosition);
      var query = { title: platform.title, company: platform.company, place: {$regex: cutLocalita} };
      var query = { title: platform.title, company: platform.company, place: platform.place };
      let count = await dbo.collection(collection).countDocuments(query);
      return count;
    } catch (error) { console.log(error); }
  },

  saveCollections: async function (dbo, collection, platform) {
    try {
        dbo.collection(collection).insertOne(platform);
        return 1;
    } catch (error) { console.log(error); }
  },

  getId: async function (dbo, collection, platform) {
    try {
      var query = { title: platform.title, company: platform.company, place: platform.place };
      let document = await dbo.collection(collection).findOne(query);
      if (document == null)
        return -1;
      return document._id;
    } catch (error) { console.log(error); }
  },

  update: async function (dbo, collection, platform, id) {
    try {
      let m1 = await dbo.collection(collection).updateOne({_id: id}, {$addToSet: {search: platform.search[0]}});
      return m1.modifiedCount;
    } catch (error) { console.log(error); }
  },

  getDocuments: async function (dbo, collection, query) {
    try{
      let document = await dbo.collection(collection).find(query).toArray();
      if (document.length == 0)
        return -1;
      return document;
    } catch(error) { console.log(error); }
  },

  getLinks: async function (dbo, collection) {
    try{
      let query = {};
      let projection = {projection:{ url: 1 }};
      let document = await dbo.collection(collection).find(query, projection).toArray();
      if (document.length == 0)
        return -1;
      return document;
    } catch(error) { console.log(error); }
  },

  getSearch: async function(dbo, collection) {
    try {
      let pipeline = [ {$unwind: "$search"}, {$group:{_id: {searchJob: "$search.searchedJob", searchPlace:"$search.searchedPlace" }}}];
      let search = await dbo.collection(collection).aggregate(pipeline).toArray();
      return search;
    } catch(error) { console.log(error); }
  }

}
