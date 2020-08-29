const express= require('express');
const router = express.Router();
const mongoose=require("mongoose");

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/";
const client = new MongoClient(url, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning
const {ObjectId}=require("mongodb");

var currentDB;
var collections=[];
var collection;

router.get("/", function(req, res){
  // Connect
  client
    .connect()
    .then(client =>
      client
        .db()
        .admin()
        .listDatabases() // Returns a promise that will resolve to the list of databases
    )
    .then(dbs => {
      res.render("home",{dbs:dbs});
      console.log(dbs);
    })
    // .finally(() => client.close()); // Closing after getting the data});

  });

router.get("/dataBases/:name",(req,res)=>{
  currentDB=req.params.name;
  mongoose.connect("mongodb://localhost:27017/"+req.params.name,{ useNewUrlParser: true,useUnifiedTopology: true });
  mongoose.set("useCreateIndex", true);

  client
    .connect()
    .then(client =>
      client
      .db(req.params.name)
          .listCollections()
          .toArray()  // Returns a promise that will resolve to the list of databases
    )
    .then(cols => {
      res.render("db",{cols:cols});
      console.log(cols);
    })
});

router.get("/collections/:name",(req,res)=>{

  collection=req.params.name;

async function run() {
  try {
    await client.connect();

    const database = client.db(currentDB);
    const collection = database.collection(req.params.name);

    // query for movies that have a runtime less than 15 minutes
    const query = {};

    const cursor = collection.find(query);


    // print a message if no documents were found
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }

    var docs=[];
    await cursor.forEach((doc)=>{
      docs.push(doc);
    });

    res.render("collection",{docs:docs,collection:req.params.name});
    console.log(docs);
  } finally {

  }
}
run();

});

router.get("/:collection/:id",(req,res)=>{

  async function run() {
    try {
      await client.connect();


      console.log(req.params.collection);
      var database = client.db(currentDB);
      var collection = database.collection(req.params.collection);

      // query for movies that have a runtime less than 15 minutes
      var query = {_id: ObjectId(req.params.id)};

      var doc = await collection.findOne(query);

      res.render("document",{doc:doc,collection:req.params.collection});

      console.log(doc);

    } finally {

    }
  }
  run();
});

router.post("/:collection/:id/update",(req,res)=>{
  async function run() {
  try {
    await client.connect();

    const database = client.db(currentDB);
    const collection = database.collection(req.params.collection);

    // create a filter for a movie to update
    const filter = {_id: ObjectId(req.params.id)};

    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true };

    // create a document that sets the plot of the movie
    const property=req.body.property;
    const propertyValue=req.body.propertyValue;

    const updateObject={};
    updateObject[property]=propertyValue;

    const updateDoc = {
      $set:updateObject,
    };

    console.log(req.body.property);
    console.log(req.body.propertyValue);

    const result = await collection.updateOne(filter, updateDoc, options);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
  } finally {
  }
}
run();

res.redirect(`/${req.params.collection}/${req.params.id}`);

});

router.post("/:collection/insert",(req,res)=>{
  async function run() {
  try {
    await client.connect();

    const database = client.db(currentDB);
    const collection = database.collection(req.params.collection);
    // create a document to be inserted
    const doc = {};

    for(let i=0;i<3;i++){
      doc[req.body.keys[i]]=req.body.values[i];
    }

    const result = await collection.insertOne(doc);

    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );
  } finally {
  }
}
run();

res.redirect("/"+req.params.coollection);

});



router.post("/:collection/:id/delete",(req,res)=>{
  async function run() {
    try {
      await client.connect();

      const database = client.db(currentDB);
      const collection = database.collection(req.params.collection);

      // Query for a movie that has a title of type string
      const query = {_id:ObjectId(req.params.id)};

      const result = await collection.deleteOne(query);
      if (result.deletedCount === 1) {
        console.dir("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    } finally {
      // await client.close();
    }
  }
  run();
  res.redirect("/"+req.params.collection);

});


module.exports = router;
