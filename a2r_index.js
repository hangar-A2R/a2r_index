// Generated by CoffeeScript 1.3.3
/* A2R Index Server
*/

var mongoose = require('mongoose') ;
var express = require('express');
var Schema = mongoose.Schema ;

var syslog = require('./lib/syslog').getInstance();
var config = require('./lib/configloader').load('index.config');

var sessions = mongoose.model('Sessions', require('./models/models.js').Sessions) ;

//ToDo: read settings from config
mongoose.connect('mongodb://localhost/a2r_index') ;

a2r_index = express.createServer();
a2r_index.set('view engine', 'jade');
a2r_index.use(express["static"](__dirname + '/public'));
a2r_index.use(express.bodyParser()) ;

a2r_index.post('/', function(req, res) {
  var data = req.body ;
  var session = new sessions(data) ;
  console.log(session) ;
  session.save(function (err) {
    if (err) {
      return res.json("bad request", 400) ;
    } else {
      return res.json({token: session.token}) ;
    }
  }) ;
}) ;

a2r_index.get('/show.:format?', function(req, res) {
  sessions.find({}, function(err, docs) {
    if (err) {
      return syslog.log(syslog.LOG_ERROR, err) ;
    } else {
      if (req.params.format == "json") {
        // ToDo: never send the token
        return res.json(docs) ;
      } else {
        return res.render('index', { sessions: docs}) ;
      }
    }
  }) ;
});

a2r_index.get('/show/:id.:format?', function(req, res) {
  sessions.findById(req.params.id, function(err, doc) {
    if (err) {
      return syslog.log(syslog.LOG_ERROR, err) ;
    } else {
      if (req.params.format == "json") {
        return res.json(doc) ;
      } else {
        return res.render('show', { session: doc }) ;
      }
    }
  }) ;
}) ;

a2r_index.listen(config['index_web_port']);

console.log('Server running');
syslog.log(syslog.LOG_INFO, 'starting a2r_index server on port ' + config['notify_server_port']);