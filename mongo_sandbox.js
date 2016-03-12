// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {
	if(!err) {
		console.log("We are connected");
	} else {
		console.log("Mongo-client: cannot conect to mongo server");
		return;
	}
	var collection = db.collection('labirint', function (err, collection) {
		if(!err) {
			console.log('created');
		} else {
			console.log('not created', err);
		}
	});
	var data = {name : 'harry', lastname : 'morgan'};
	collection.insert(data, {w:1}, function (err, result) {
			console.log('error: ', err);
			console.log('result: ', result);
	});
	var result = collection.find().toArray(function(err, items) {
		console.log(items);
		console.log('total rows: ', items.length);
	});
	// result.on("end", function () {
	// 	console.log(result);
	// 	console.log('total rows: ', result.length);
	// });
});