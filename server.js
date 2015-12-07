var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MONGODBURL = 'mongodb://akira1130.cloudapp.net:27017/test';

var restaurantSchema = require('./models/restaurant');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//create_K.O.
app.post('/', function(req,res) {
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var rObj = {};
		rObj.address = {};
		if (req.body.building != null)
			rObj.address.building = req.body.building;
		if (req.body.street != null)
			rObj.address.street = req.body.street;
		if (req.body.zipcode != null)		
			rObj.address.zipcode = req.body.zipcode;
		if (req.body.lon != null && req.body.lat != null){
			rObj.address.coord = [];
			rObj.address.coord.push(req.body.lon);
			rObj.address.coord.push(req.body.lat);
		}
		if (req.body.borough != null)	
			rObj.borough = req.body.borough;
		if (req.body.cuisine != null)	
			rObj.cuisine = req.body.cuisine;
		if (req.body.name != null)	
			rObj.name = req.body.name;
		if (req.body.restaurant_id != null)	
			rObj.restaurant_id = req.body.restaurant_id;

		var restaurant = mongoose.model('restaurant', restaurantSchema);
		var r = new restaurant(rObj);
		r.save(function(err,results){
			if (err) {
				res.status(500).json(err);
			}
			else {
				res.status(200).json({message: 'insert done', _id: r._id});
				db.close();
			}
		});
	});
});

//remove_K.O.
app.delete('/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	var temp = req.params.attrib;
	if(temp=="street" ||temp=="zipcode" ||temp=="building"||temp=="coord"){
		temp = "address."+temp;
	}
	criteria[temp] = req.params.attrib_value;

	//show log in server side
	console.log(criteria);

	
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.find(criteria).remove(function(err){
			if (err) {
				res.status(500).json(err);
			}
			else {
				res.status(200).json({message: 'delete done'});
				db.close();
			}
		});
	});
});

app.delete('/', function(req,res) {
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.find({}).remove(function(err){
			if (err) {
				res.status(500).json(err);
			}
			else {
				res.status(200).json({message: 'delete done'});
				db.close();
			}
		});
	});
});

//update_K.O.
app.put('/restaurant_id/:restaurant_id/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	var temp = req.params.attrib;
	if(temp=="street" ||temp=="zipcode" ||temp=="building"||temp=="coord"){
		temp = "address."+temp;
	}
	criteria[temp] = req.params.attrib_value;

	//show log in server side
	console.log(criteria);
	
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.update({restaurant_id:req.params.restaurant_id},{$set:criteria},function(err){
			if (err) {
				res.status(500).json(err);
			}
			else {
				res.status(200).json({message: 'update done'});
				db.close();
			}
		});
	});
});

app.put('/restaurant_id/:restaurant_id/grade', function(req,res) {
	var criteria = {};
	criteria["date"] = req.body.date;
	criteria["grade"] = req.body.grade;
	criteria["score"] = req.body.score;
	//show log in server side
	console.log(criteria);

	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		

		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.findOne({restaurant_id:req.params.restaurant_id},function(err, r){
			console.log(r);
			r.grades.push(criteria);
			
			r.save(function(err){
				if (err) {
					res.status(500).json(err);
				}
				else {
					res.status(200).json({message: 'update done'});
					db.close();
				}
			});
		});
	});
});

//display_K.O.
app.get('/higher_restaurant', function(req,res) {
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.find({},function(err, r){
			var i;
			var criteria = {};
			for (i = 0; i < r.length ; i++){
				var result = 0;
				var count;
				for (count = 0; count < r[i].grades.length ; count++){
					temp = r[i].grades;
					result += temp[count].score;
				}
				result = result/count;
				if (result < 70){
					criteria[r[i].restaurant_id] = result;
				}
			};
			console.log(criteria);
			if (criteria == {}) {
				res.status(500).json("No doc");
			}
			else {
				res.status(200).json(criteria);
						
			}
			db.close();
		});
	});
});

app.get('/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	var temp = req.params.attrib;
	if(temp=="street" ||temp=="zipcode" ||temp=="building"||temp=="coord"){
		temp = "address."+temp;
	}
	criteria[temp] = req.params.attrib_value;

	//show log in server side
	console.log(criteria);

	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.find(criteria,function(err,results){
			if (err) {
				res.status(500).json(err);
			}
			else {
				db.close();
				console.log('Found: ',results.length);
				if(results.length == 0){
					res.status(200).json({message: 'No matching document'});
				}else{
					res.status(200).json(results);
				}
			}
		});
	});
});

app.get('/', function(req,res) {
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.find({},function(err,results){
			if (err) {
				res.status(500).json(err);
			}
			else {
				db.close();
				console.log('Found: ',results.length);
				if(results.length == 0){
					res.status(200).json({message: 'No matching document'});
				}else{
					res.status(200).json(results);
				}
			}
		});
	});
});

app.listen(process.env.PORT || 8099);
