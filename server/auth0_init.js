 
var Auth0Strategy = require('passport-auth0'),
    passport = require('passport');
 
// buddyTransfer FB app
var strategy = new Auth0Strategy({
    domain: 'nodekomarval.auth0.com',
    clientID: '6FStMDxW47cHf4tH1ujv65rEQfui7QDs',
    clientSecret: 'gLHRrWmFDPJbx-JeOnxPQuXcuBnZSlcOQSjW264NSNMzRkDIgiXogfbTr3LqT7sX',
    callbackURL:  '/callback',
    connections: ['facebook', 'google-oauth2', 'twitter'],
    connection_scopes: {
      'facebook': ['public_profile', 'user_friends'],
      'google-oauth2': ['https://www.googleapis.com/auth/plus.login'],
      // none for twitter
    }
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases) 
    // extraParams.id_token has the JSON Web Token 
    // profile has all the information from the user 
    return done(null, profile);
  }
);

passport.use(strategy);

module.exports = passport;