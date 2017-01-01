//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var path = require('path');
var http = require("http");

var express = require('express');
var bodyParser = require('body-parser');

var db = require("./db");

var socket = require('socket.io');
var ObjectID = require('mongodb').ObjectID; 

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, 'client')));

var server = http.createServer(app);
var io = socket.listen(server);

app.get('/member', function (req, res) {
  db.read("member", {}, function(result){
    res.status(200);
    res.send(JSON.stringify(result));
  });
});

app.post('/member', function (req, res) {
  db.create("member", req.body.where, function(result){
    res.status(201);
    res.send();
  });
});

app.put('/member', function (req, res) {
  db.update("member", req.body.where, req.body.replace, function(result){
    res.status(204);
    res.send();
  });
});

app.delete('/member', function (req, res) {
  db.delete("member", req.body.where, req.body.replace, function(result){
      res.status(204);
      res.send();
  });
});
app.post("/signin", function (req, res){
  db.read("member", {"member":req.body.id}, function(result){
    var member = result[0]._id;
    db.create("signin", {"member": member, "time": req.body.time}, function(){
      res.status(201);
      res.send();
    });
  });
});
app.get("/signin", function(req, res){
  db.read("signin", {}, function(result){
    if(result.length === 0){
      res.send("[]");
      return;
    }
    var signins = result;
    //creates array of all member object IDs
    var members = signins.map(function(doc){
      return doc.member;
    });
    
    //Find all members with IDs that have a signin, and loop through them.
    //Replace each ID with a member object
    db.read("member", {_id: {$in: members}}, function(result){
      var responseArray = [];
      for(var i=0;i<result.length;i++){
        for(var j=signins.length-1;j>=0;j--){
          if(signins[j].member.equals(result[i]._id)){
            signins[j].member = {fname:result[i].fname};
            //Take out the signin (Since we know who it is) and put it int the responce
            responseArray.push(signins.splice(j,1)[0]);
          }
        }
      }
      
      res.send(JSON.stringify(responseArray));
    });
    

    
  });
});

app.post("/signin", function(req, res){
  db.read("member", req.body.member, function(result){
    if(result.length != 0){
      db.create("signin", {time:req.body.time, member:result[0]._id}, function(result){
        res.status(201);
        res.send();
      });
    } else {
      res.status(400);
      res.send();
    }
  });
});

db.connectDB(function(){
    process.stdout.write("Starting server... ");
    server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
        console.log("Done.");
    });
});

  //socket
io.on('connection', function(socket){//socket connected
  console.log('Socket connected.');
  
  socket.on("id",function(id,fn){//student inputs id
    db.read("member",{"studentId":parseInt(id)},function(res){//find member with that student id
       console.log(res);
       //execute callback
       if (res.length!=0)fn(res[0]);//first member with that id
       else fn("");//not found
    });
  });
  socket.on("student signin",function(info){///student signs in
      db.create("signin",[{member:new ObjectID(info.member),time:info.time}], function(result){//create new signin
        console.log("Sign in!");
      });
  });
  socket.on("students",function(data,fn){//get all members
    db.read("member", {}, function(result){
      fn(result);
    });
  });
  socket.on("delete student", function(id,fn){//delete a member
    db.remove("member", {_id: new ObjectID(id)}, function(result){
      db.remove("signin",{member:new ObjectID(id)},function(){});//remove all signins from that member
      fn();
    });
  });
  socket.on("create member", function(member,fn){//create a member
      db.create("member", [member], function(result){//add to member collection
        fn();
      });
  });
  socket.on("update member",function(info,fn){//chenge member info
    db.update("member",{_id:new ObjectID(info._id)}, info.member, function(result){//update document
      fn();
    });
  });
  socket.on("signins",function(info,fn){//get all signins
    db.read("signin", {}, function(result){
      fn(result);
    });
  });
  socket.on("delete signin", function(id,fn){//delete a signin
    db.remove("signin", {_id: new ObjectID(id)}, function(result){
      console.log("removed");
      fn();
    });
  });
  //find a member based on their object id
  //the object ids are stored in the signin collection, but the names will be displayed
  socket.on("obj id",function(id,fn){
    db.read("member",{_id: new ObjectID(id)},function(res){
       console.log(res);
       if (res.length!=0){
         fn(res[0]);
       }
       else fn({fname:"Deleted",studentId:00000});//in case the object id is not found
    });
  });
  
});