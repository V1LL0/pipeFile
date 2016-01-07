var request = require('request');

function getFriends(user, cb){

  var url = 'https://www.googleapis.com/plus/v1/people/{{userId}}/people/connected?key=AIzaSyCwmvEZ6xh7tfhudtZe8wbxzjLckLJPr_0';
  var urlUser = url.replace('{{userId}}', user.identities[0].user_id);

  request({url: url, json: true}, function(error, response, body){
    // console.log(body);
    if (!error && response.statusCode == 200) {

      cb(body);
    } else {
      cb([]);
    }
  });
}


var api = {
	getFriends: getFriends
};


module.exports = api;