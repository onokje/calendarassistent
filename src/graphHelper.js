/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

const request = require('superagent');

/**
 * Generates a GET request the user endpoint.
 * @param {string} accessToken The access token to send with the request.
 * @param {Function} callback
 */
function getUserData(accessToken, callback) {
  request
   .get('https://graph.microsoft.com/v1.0/me')
   .set('Authorization', 'Bearer ' + accessToken)
   .end((err, res) => {
     callback(err, res);
   });
}


function getCalendar(accessToken, callback) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  request
    .get(`https://graph.microsoft.com/v1.0/me/calendarview?startdatetime=${today.toISOString()}&enddatetime=${tomorrow.toISOString()}&$top=1&$orderby=start/dateTime`)
    .set('Authorization', 'Bearer ' + accessToken)
    .end((err, res) => {
      // Returns 200 OK and the photo in the body. If no photo exists, returns 404 Not Found.
      callback(err, res.body);
    });
}


exports.getUserData = getUserData;
exports.getCalendar = getCalendar;
