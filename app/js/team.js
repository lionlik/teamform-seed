$(document).ready(function(){

	$('#team_page_controller').hide();
	$('#text_event_name').text("Error: Invalid event name ");
	var eventName = getURLParameter("q");
	if (eventName != null && eventName !== '' ) {
		$('#text_event_name').text("Event name: " + eventName);
		
	}

});

angular.module('teamform-team-app', ['firebase'])
.controller('TeamCtrl', ['$scope', '$firebaseObject', '$firebaseArray', 
    function($scope, $firebaseObject, $firebaseArray) {
		
	// Call Firebase initialization code defined in site.js
	initalizeFirebase();

	var refPath = "";
	var eventName = getURLParameter("q");	
	
	// TODO: implementation of MemberCtrl	
	$scope.param = {
		"teamName" : '',
		"currentTeamSize" : 0,
		"teamMembers" : []
	};
		
	

	refPath =  eventName + "/admin";
	retrieveOnceFirebase(firebase, refPath, function(data) {	

		if ( data.child("param").val() != null ) {
			$scope.range = data.child("param").val();
			$scope.param.currentTeamSize = parseInt(($scope.range.minTeamSize + $scope.range.maxTeamSize)/2);
			$scope.$apply(); // force to refresh
			$('#team_page_controller').show(); // show UI
			
		} 
	});
	
	
	refPath = eventName + "/member";	
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));
	
	
	refPath = eventName + "/team";	
	$scope.team = [];
	$scope.team = $firebaseArray(firebase.database().ref(refPath));
	
	
	$scope.requests = [];
	$scope.refreshViewRequestsReceived = function() {
		
		//$scope.test = "";		
		$scope.requests = [];
		var teamID = $.trim( $scope.param.teamName );	
				
		$.each($scope.member, function(i,obj) {			
			//$scope.test += i + " " + val;
			//$scope.test += obj.$id + " " ;
			
			var userID = obj.$id;
			// var userSex = obj.sex;
			if ( typeof obj.selection != "undefined"  && obj.selection.indexOf(teamID) > -1 ) {
				//$scope.test += userID + " " ;
				
				$scope.requests.push(userID);
			}
		});
		
		$scope.$apply();
		
	}
	
	
	
	
	
	

	$scope.changeCurrentTeamSize = function(delta) {
		var newVal = $scope.param.currentTeamSize + delta;
		if (newVal >= $scope.range.minTeamSize && newVal <= $scope.range.maxTeamSize ) {
			$scope.param.currentTeamSize = newVal;
		} 
	}
	
	$scope.advertise = function() {
		
		
		var adverID = $.trim( $scope.param.title );
		
		
		if ( adverID !== '' && $scope.param.advertisement !== "") {
									
			var newData = {				
				'content': $scope.param.advertisement
			};
			
			var refPath = getURLParameter("q") + "/advertisement/" + adverID;	
			var ref = firebase.database().ref(refPath);
			
			ref.set(newData, function(){
				// complete call back
				//alert("data pushed...");
				
				// Finally, go back to the front-end
				window.location.href= "index.html";
			});
			
			
		
					
		}
	}
	$scope.saveFunc = function() {
		
		
		var teamID = $.trim( $scope.param.teamName );
		
		if ( teamID !== '' ) {
			
			var newData = {				
				'size': $scope.param.currentTeamSize,
				'teamMembers': $scope.param.teamMembers
			};		
			
			var refPath = getURLParameter("q") + "/team/" + teamID;	
			var ref = firebase.database().ref(refPath);
			
			
			// for each team members, clear the selection in /[eventName]/team/
			
			$.each($scope.param.teamMembers, function(i,obj){
				
				
				//$scope.test += obj;
				var rec = $scope.member.$getRecord(obj);
				rec.selection = [];
				$scope.member.$save(rec);
				
				
				
			});
			
			
			
			ref.set(newData, function(){			

				// console.log("Success..");
				
				// Finally, go back to the front-end
				// window.location.href= "index.html";
			});
			
			
			
		}
		
		
	}
	
	$scope.loadFunc = function() {
		
		var teamID = $.trim( $scope.param.teamName );		
		var eventName = getURLParameter("q");
		var refPath = eventName + "/team/" + teamID ;
		retrieveOnceFirebase(firebase, refPath, function(data) {	

			if ( data.child("size").val() != null ) {
				
				$scope.param.currentTeamSize = data.child("size").val();
				
				$scope.refreshViewRequestsReceived();
								
				
			} 
			
			if ( data.child("teamMembers").val() != null ) {
				
				$scope.param.teamMembers = data.child("teamMembers").val();
				
			}
			
			$scope.$apply(); // force to refresh
		});

	}
	
	$scope.processRequest = function(r) {
		//$scope.test = "processRequest: " + r;
		
		if ( 
		    $scope.param.teamMembers.indexOf(r) < 0 && 
			$scope.param.teamMembers.length < $scope.param.currentTeamSize  ) {
				
			// Not exists, and the current number of team member is less than the preferred team size
			$scope.param.teamMembers.push(r);
			
			$scope.saveFunc();
		}
	}
	
	$scope.removeMember = function(member) {
		
		var index = $scope.param.teamMembers.indexOf(member);
		if ( index > -1 ) {
			$scope.param.teamMembers.splice(index, 1); // remove that item
			
			$scope.saveFunc();
		}
		
	}

	
	$scope.autoadd = function(){
		


		  var eventName = getURLParameter("q") +"/member/";
		  console.log(eventName);
		  var ref = firebase.database().ref(eventName);
		  var event = $firebaseArray(ref);
		  console.log(event);
		  
		  var teamPath = getURLParameter("q") + "/team/";
		  var teams = firebase.database().ref(teamPath);
		  var team = $firebaseArray(teams);


		  
	event.$loaded().then( function(data){
			outerloop:
		  for( var mem in event){
			  
			  console.log(mem);
			  
			  if(mem != null && typeof mem != "undefined"){
				if ( typeof event[mem].selection != "undefined" && typeof event[mem].selection != "null"){
				  console.log("Fuck Yeah!",typeof event[mem].selection,"id",event[mem]["$id"] );
				 
				  for(var cteam in team){
					   if(cteam != null && typeof cteam != "undefined"){
							if ( typeof team[cteam].teamMembers != "undefined" && typeof team[cteam].teamMembers != "null"){
								console.log(team[cteam]["$id"]);
								if( team[cteam].teamMembers.length < team[cteam].size){
									console.log(team[cteam].teamMembers);
								event[mem].selection =[];
								firebase.database().ref(getURLParameter("q") +"/member/" + event[mem]["$id"] ).set({
									name: event[mem]["name"] 
								});

								team[cteam].teamMembers.push(event[mem]["$id"]);
								firebase.database().ref(getURLParameter("q") +"/team/" + team[cteam]["$id"] ).set({
									size: team[cteam]["size"],
									teamMembers: team[cteam].teamMembers
								});
								
								continue outerloop;
								}
							}
					   }
					
				    }
				}
				  
			  }
			  

		  }

		
	});

		  
	  }
	
	
		
}]);
	// ;
// .controller("AutoAddCtrl", ["$scope", "$firebaseAuth",
  // function($scope, $firebaseAuth) {
   // //your code
	  // $scope.autoadd = function(){
		  // var eventName = getURLParameter("q");
		  
		  // var memPath = getURLParameter("q") + "/member";
		  // var mems = firebase.database().ref(memPath);
		  
		  // var teamPath = getURLParameter("q") + "/team";
		  // var teams = firebase.database().ref(teamPath);
		  
		  // for( var mem in mems){
			  // if ( !mem.selection !==""){
				  // for(var team in teams){
					  // if( team.currentTeamSize < team.size){
							// team.teamMembers.push(mem);
							// team.currentTeamSize++;}
					
				  // }
			  // }
		  // }
		  
	  // }
  // }
// ]);