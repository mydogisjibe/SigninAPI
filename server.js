//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');

var db = require("./db");

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
      var responceArray = [];
      for(var i=0;i<result.length;i++){
        for(var j=signins.length-1;j>=0;j--){
          if(signins[j].member.equals(result[i]._id)){
            signins[j].member = {fname:result[i].fname};
            //Take out the signin (Since we know who it is) and put it int the responce
            responceArray.push(signins.splice(j,1)[0]);
          }
        }
      }
      
      res.send(JSON.stringify(responceArray));
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
    app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
        console.log("Done.");
    });
});