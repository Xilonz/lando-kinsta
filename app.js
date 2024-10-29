'use strict';

module.exports = (app, lando) => {
  app.log.alsoSanitize('kinsta-token');
};