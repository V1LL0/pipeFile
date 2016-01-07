var fb = require('./facebook');
var twitter = require('./twitter');
var google = require('./google');

var providers = {
  "google-oauth2": google,
  twitter: twitter,
  facebook: fb
};

function getFriendsByProvider(user, cb){
  var provider = providers[user.provider];
    if(!provider){
      return cb([]);
    }

    return provider.getFriends(user, cb);
}



module.exports = {
	getFriends: getFriendsByProvider
};