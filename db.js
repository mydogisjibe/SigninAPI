var assert = require("assert");
var MongoClient = require("mongodb").MongoClient;

var db;

function connectDB(callback){
    process.stdout.write("Connecting to database... ");
    MongoClient.connect("mongodb://"+process.env.IP+":27017/test", function(err, database){
        db = database;
        assert.equal(err, null, "Mongo failed to start");
        console.log("db done.");
        callback();
    });
}

function newCollection(name, callback){
    db.createCollection(name, function(err, collection){
        assert.equal(err, null, "The database encountered an error while making a new collection");
        callback();
    })
}

function create(collection, doc, callback){
    db.collection(collection).insertMany(doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while creating.");
        if(callback != undefined) callback(result);
    });
}

function read(collection, where, callback){
    db.collection(collection).find(where).toArray(function(err, docs){
        assert.equal(err, null, "The database encountered an error while reading.");
        callback(docs);
    });
}

function update(collection, where, doc, callback){
    db.collection(collection).update(where, doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while updating.");
        callback(result);
    });
}

// This becomes db.delete, we cant call it remove here though because remove is a
// javascript keyword.
function remove(collection, where, callback){
    db.collection(collection).remove(where, function(err, result){
        assert.equal(err, null, "The database encountered an error while deleting.");
        callback(result);
    });
}
exports.newCollection = newCollection;
exports.connectDB = connectDB;
exports.create = create;
exports.read   = read;
exports.update = update;
exports.remove = remove;