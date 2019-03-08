/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

const request = require('superagent');
const config = require('../config');

/**
 * Generates a GET request the user endpoint.

 * @param {Function} callback
 */
function getStatus(callback) {
  request
    .get(config.statusUrl)
    .end((err, res) => {
      callback(err, res.body);
    });
}

exports.getStatus = getStatus;
