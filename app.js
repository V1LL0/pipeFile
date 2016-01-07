var express = require('express');
// Session and cookies middlewares to keep user logged in
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logout = require('express-passport-logout');

var app = express();

var logged = {};
var fileIds = {};
var destIds = {};

var peerJSKey = 'nxktta4w9dn7y14i';

//Facebook authentication
var auth0Init = require('./server/auth0_init.js');
var social = require('./server/social.js');

function loginCallback(req, res){
    if (!req.user) {
      throw new Error('user null');
    }
    saveUser(req.user);
    res.redirect("/");
}

function saveUser(user){
	logged[user.id] =  {
		provider: user.provider, // 'facebook',
		name: user.displayName, // 'Valerio Cestarelli',
		id: user.id, // 'facebook|10207938846171223',
		picture: user.picture, // url to picture
		gender: user.gender, // 'male',
		identities: user.identities
	};
}

function isAuthenticated(req, res, next){
  if(!req.isAuthenticated()){
    // redirect to login if the user is not authenticated
    return res.redirect('/login');
  }
  return next();
}

function getAuth0(options){
  return auth0Init.authenticate('auth0', options || {});
}

// from http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
function getId(dict){
  var id = randomString(50);
  return id in dict ? getId() : id;
}

function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

// This is not a best practice, but we want to keep things simple for now
auth0Init.serializeUser(function(user, done) {
  done(null, user);
});

auth0Init.deserializeUser(function(user, done) {
  done(null, user);
});

//Create a static file server
app.configure(function() {
  app.set('view engine', 'jade');
  app.use(cookieParser());
  app.use(session({ secret: 'superKnockout2015Secret', unset: 'destroy' }));
  app.use(auth0Init.initialize());
  app.use(auth0Init.session());
});

// authentication
app.get('/callback', getAuth0({ failureRedirect: '/login' }), loginCallback);


app.get('/login', getAuth0(), function (req, res) {
  res.redirect("/");
});

app.get('/logout', function(req, res){
  req.logout();
  delete req.session;
  delete req.user;
  res.redirect('http://nodemarval.2015.nodeknockout.com/login');
});

app.get('/file-:id', function(req, res){
  var id = req.params.id;
  // look if the id is available
  if(fileIds[id] && !fileIds[id].visited){
    // flag the file now
    // fileIds[id].visited = 1;
    return res.render('download', {jsKey: peerJSKey, peerId: fileIds[id].peer, senderId: fileIds[id].sender });
  }
  // just return a 404
  res.send(404, "I don't know what are you looking for...");
});

// Make download.js available for all
app.get('/js/download.js', function(req, res){
  res.sendfile(__dirname + '/public/js/download.js');
});

app.get('/js/backupServers.js', function(req, res){
  res.sendfile(__dirname + '/public/js/backupServers.js');
});

app.get('/img/logo.gif', function(req, res){
  res.sendfile(__dirname + '/public/img/logo.gif');
});

app.get('*', isAuthenticated);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res){
	res.render('index', {jsKey: peerJSKey });
});

app.get('/me', function(req, res){
  var user_json = {
    name: req.user.displayName,
    picture: req.user.picture,
    id: req.user.id
  };
  res.json(user_json);
});

app.get('/geturl', function(req, res){
  var prefix = 'file-';

  var id = getId(fileIds);
  fileIds[id] = {sender: req.query.id, peer: getId(destIds) };
  res.json({url: prefix + id, peer: fileIds[id].peer });
});

app.get('/friends', function(req, res){
  // get the user friend by the current provider
  var userId = req.user.id;
  social.getFriends(logged[userId], function(list){
    res.json(list);
  });
});


var port = 8080;
app.listen(port);
console.log('Express server started on port %s', port);