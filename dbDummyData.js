var db = require("./db");
db.connectDB(function(){
    db.newCollection("member", function(){
        db.create("member", [
            {fname:"Brent"  ,studentId: 75195},
            {fname:"Jiahao" ,studentId: 84913},
            {fname:"Matthew",studentId: 77209},
            {fname:"Naomi"  ,studentId: 86842}
            
        ],function(result){    
            db.newCollection("signin", function(){
                var signins = [];
                for(var i=0;i<result.ops.length;i++){
                    signins[i] = {member:result.ops[i]._id, time: Math.floor(Date.now() / 1000)};
                }
                db.create("signin", signins, function(){
                    console.log("Done adding data. Press ctrl+c to exit.");
                });
            });
        });  
    });
});
