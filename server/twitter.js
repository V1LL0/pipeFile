var request = require('request');

function getFriends(user, cb){

  var url = 'https://api.twitter.com/1.1/friends/list.json?user_id='+user.identities[0].user_id;
  var params = {
  	url: url,
  	oauth: {
  		callback: '/',
  		consumer_key: 'bPZZRiZkqiFjk2qJjqVWB7eZL',
  		consumer_secret: 'KfJ4NUcVaJqODnMXpZ4dnJ3gzoJZUMVqaEGS66p5JYJInBGVCh'
  	},
  	json: true
  };
  request(params, function(error, response, body){
    
    if (!error && response.statusCode == 200) {

    	var list = body.users.map(function(friend){
          return {
          	name: friend.name || friend.screen_name,
          	picture: friend.profile_image_url,
          	id: friend.id
          };
    	});

      cb(list);
    } else {
      cb([]);
    }
  });
}


var api = {
	getFriends: getFriends
};


module.exports = api;