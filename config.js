module.exports = {
  creds: {
    redirectUrl: process.env.REDIRECT_URL,
    clientID: process.env.CLIENT_ID ,
    clientSecret: process.env.CLIENT_SECRET,
    identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    allowHttpForRedirectUrl: true, // For development only
    responseType: 'code',
    validateIssuer: false, // For development only
    responseMode: 'query',
    scope: ['User.Read', 'Calendars.Read']
  },
  statusUrl: 'http://127.0.0.1:3001/status'
};
