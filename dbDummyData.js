var db = require("./db");
db.connectDB(function(){
    db.newCollection("member", function(){
        db.create("member", [
            {"fname":"Brent"  ,"studentId": 75195},
            {"fname":"Jiahao" ,"studentId": 84913},
            {"fname":"Matthew","studentId": 77209},
            {"fname":"Naomi"  ,"studentId": 86842}
            
        ],function(){
            console.log("Member done.");
        });  
    });
    db.newCollection("signin", function(){
        console.log("Signin done.");
    });
});
