var express = require('express');
var app = express();
var mode = process.env.NODE_ENV || 'dev';
var config = require('./config/config.json')[mode];
// MONGODB
var mongodb = require('mongodb').MongoClient;
// DUKU
var duku = require('./plugin-duku/');

mongodb.connect('mongodb://localhost:27017/inspiration', function(err, db) {
	if (err) throw err;
	var ModelItem = db.collection('item');
	// HANDLER
	var SIH = require('./route/site-inspiration'), Site = new SIH(db);
	var WebHandler = require('./route/webdesign'), Web = new WebHandler(db);
	app.get("/site-inspiration", Site.grab);
	app.get("/webdesign-inspiration", Web.grab);

	app.get("/import-duku", function(req,res,next) {
		duku.getToken(function(token) {
			var data = [{
				"title" : "ngonok"
			}]
			duku.insertContent(data, token, function(hasil) {
				res.json(hasil);
			})
		})
	})

	app.listen(config.app.port, config.app.host, function() {
		console.log("Appication Listen on ", config.app.host, ":", config.app.port);
	})
})