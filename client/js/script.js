/*global $
global io*/
function showText(){//show hidden text when a button is pressed
  $(".hideMe").css("display","block");
}
function hideText(){//hide hidden text
  $(".hideMe").css("display","none");
}
function showError(error){//display bootstrap alert
  $(".alert").html("<strong>Sign-in failed!</strong> "+error);
  $('.alert').css("display","block");
}

//setting global variables
var socket = io.connect();
var sort = 0;
function submitId(){//submitting a student id to search for the member
  //hide alert and bottom text
  $('.alert').css("display","none");
  hideText();
  //get student id
  var id = $("#id").val();
  if (id==="")showError("ID blank.");
  else{
    socket.emit("id",id,function(res){//result found in database
      if (res==="")showError("ID not found.");
      else{
        $("#stu_name").html("Hi "+res.fname+"!");
        showText();
        $("#studentSignIn").click(function(){//signing in
          socket.emit("student signin",{member:res._id,time:Math.floor(Date.now()/1000)});
        });
      }
    });
  }
}
function getStudents(){//display list of members
  socket.emit("students","",function(list){
    list = srt(list,sort);//sort by name or student id
    $("tbody").html("");//clear table
    for (var i = 0; i < list.length; i++){//loop through students, create a row for each
      makeRow(i,list[i]);
    }
  });
  function makeRow(j,mem){//add row to student table
    var row = '<tr id="row'+j+'"><td>'+mem.fname+'</td><td>'+mem.studentId+'</td><td>';
      row +='<button class = "btn btn-danger margin" id="del'+j+'"><span class="glyphicon glyphicon-trash"></span></button>';//delete button
      row+='<button class = "btn btn-primary margin" id="edit'+j+'"><span class="glyphicon glyphicon-pencil"></span></button> </td></tr>';//edit button
      $("tbody").append(row);
      $("#del"+j).click(function(){//delete a student
        //Are you SURE you want to delete the student?
        $("#modaltitle2").html("Are you <em>sure</em> you want to delete "+mem.fname+"?");
        $("#modal2").modal();
        $("#delete").click(function(){
          socket.emit("delete student",mem._id,function(){
            $("#delete").off();
            getStudents();//display new table
          });
        });
      });
      $("#edit"+j).click(function(){//edit student
        $(".modal-title").html("Edit Student: "+mem.fname);//opions displayed in a modal
        $("#myModal").modal();
        $('#chId').click(function(){//changing the student id
          var id = $('#changeId').val();
          if (id=="")id = mem.studentId;
          $("#changeId").val("");
          socket.emit("update member",{_id:mem._id,member:{fname:mem.fname,studentId:parseInt(id)}},function(){
            $("#chName").off();//releasing click events for modal buttons 
            $("#chId").off();
            $("#myModal").modal('hide');
            getStudents();//display new table
          });
          
        });
        $('#chName').click(function(){//changing the name
          var n = $('#changeName').val();
          if (n=="")n = mem.fname;
          $("#changeName").val("");
          socket.emit("update member",{_id:mem._id,member:{fname:n,studentId:mem.studentId}},function(){
            $("#chName").off();//releasing click events
            $("#chId").off();
            $("#myModal").modal('hide');
            getStudents();//display new table
          });
          
        });
        
      });
  }
  
}
function getSignins(){//display list of signins
  socket.emit("signins","",function(list){
    list = srt(list,2);//sort by date
    getSignin(0,list);
  });
}
function getSignin(j,list){/*since this function uses socket to get the students' names and ids,
it cannot simply loop through the signins*/
    $("tbody").html("");
      var t = list[j].time;
      var last = list.length;
      var id = list[j]._id;
      socket.emit("obj id",list[j].member,function(student){
        makeRow(j,student,t,id);
        
      });
      if (j<last-1)getSignin(j+1,list);//get the next signin
  function makeRow(j,mem,time,id){//create a row on the table for a signin
    var row = '<tr id="row'+j+'"><td>'+mem.fname+'</td><td>'+mem.studentId+'</td><td>'+timeConverter(time)+'</td><td>';
    row +='<button class = "btn btn-danger margin" id="del'+j+'"><span class="glyphicon glyphicon-trash"></span></button></td></tr>';//delete button
    $("tbody").append(row);
    $("#del"+j).click(function(){//delete button
        //Are you SURE you want to delete the signin?
        $("#modaltitle2").html("Are you <em>sure</em> you want to delete this sign-in?");
        $("#modal2").modal();
        $("#delete").click(function(){
          socket.emit("delete signin",id,function(){
            $("#delete").off();
            getSignins();//display new table
          });
        });
      });
  }
}
function createStudent(){//create a new student
  $(".alert").css("display","none");//hide any alerts
  var name = $("#newFirst").val();
  var id = parseInt($("#newID").val());
  if (name==""||id==""){
    $(".alert").css("display","block");//name or id not entered
  }
  else{
    $("#newFirst").val("");
    $("#newID").val("");
    socket.emit("create member", {fname:name,studentId:id},function(){//create member
      getStudents();//display new table
    });
  }
}
function select() {//choose how students are sorted
  sort = document.getElementById("select").selectedIndex;
  getStudents();//display sorted table
 }
function timeConverter(UNIX_timestamp){//convert unix timestamp to date
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  if (min<10)min = "0"+min.toString();
  if (sec<10)sec = "0"+sec.toString();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
function srt(arr, param){//sort object array
  return arr.sort(function(a, b){
    switch(param){
      //sort by fname
      case 0:return ((a.fname>b.fname)?1:((a.fname==b.fname)?0:-1));
      //sort by id
      case 1: return ((a.studentId>b.studentId)?1:((a.studentId==b.studentId)?0:-1));
      //sort by date
      case 2: return ((a.time>b.time)?1:((a.time==b.time)?0:-1));
    }
  });
}