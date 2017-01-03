var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/imagesearch';
var db;

// Use connect method to connect to the server
mongo.connect(url, function(err, database) {
    if(err) throw err;
    db = database;
    app.listen(8080, function() {
        console.log("App listening on port 8080.");
    });
});

app.get('/api/imagesearch/:topic', function(req, res) {
    var offset = (req.query.offset.match(/^\d+$/))?parseInt(req.query.offset):0;
    var imageSearch = db.collection('imagesearch');
    if (offset<=90) {
        var search = imageSearch.findOne({topic: req.params.topic}, {results:1, _id:0});
        search.then(function (value) {
            db.collection('visitlog').save({term: req.params.topic, when: new Date()}, (err, result) => {
                if (err) throw err;
                res.json(value.results.slice(offset, offset+10));
                res.end();
            });
        });
    }
    else {
        res.write("<p>An integer value greater than 90 was provided</p>");
        res.end();
    }
});

app.get('/api/latest/imagesearch', function(req, res) {
    db.collection('visitlog').find({}, {_id: 0}).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
        res.end();
    });
});
