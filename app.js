var express = require('express');
var app = express();
var mongoose = require('mongoose');
// module for maintaining sessions
var logger = require('morgan');
var bodyParser = require('body-parser');

// path is used the get the path of our files on the computer
var path = require ('path');


app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));


//set the views folder to html page in views folder

app.use('/',express.static(__dirname + '/public'));


var dbPath  = "mongodb://localhost/myMap";

// command to connect with database

db = mongoose.connect(dbPath);

mongoose.connection.once('open', function() {

	console.log("database connection open success");

});



// fs module, by default module for file management in nodejs
var fs = require('fs');

// include all our model files
fs.readdirSync('./server/app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./server/app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./server/app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./server/app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		if(route.controllerFunction){
			route.controllerFunction(app)
		}else if(route.passportControllerFunction){
			route.passportControllerFunction(app,passport)
		}

	}

});//end for each


/////////////////////////////// error handling illegal routes /////////////////////////////////////

app.use(function(req, res) {
   
  res.status(404).send("You hit an incorrect path. Check again");
    
}); 

///////////////////////////////// starting the server/////////////////////////////////////////////////

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});