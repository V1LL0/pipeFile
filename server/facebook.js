var request = require('request');

function getFbFriends(user, callback) {
    var accessToken = user.identities[0].access_token,
        apiPath     = '/me/friends';

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: apiPath + '?access_token=' + accessToken, //apiPath example: '/me/friends'
        method: 'GET'
    };

    request(options, callback);
}

var api = {
    getFriends: getFbFriends
};


module.exports = api;