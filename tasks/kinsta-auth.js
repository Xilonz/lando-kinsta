'use strict';

const kinsta_client = require('../utils/kinsta');

module.exports = lando => ({
    command: ['kinsta-auth'],
    describe: 'Login to Kinsta',
    options: {
      token: {
        describe: 'API Key from myKinsta ',
        alias: ['u'],
        default: false,
        interactive: {
          type: 'input',
          message: 'API Key',
        }
      }
    },
    run: async( options ) => {
      
      const { validate } = kinsta_client( options.token );

      const validated = await validate();

      if( validated.status == 'active'){

        lando.cli.updateUserConfig(
          { 
            'kinsta_token': options.token,
            'kinsta_company_id': validated.company,
            'kinsta_expires': validated.expires
          }
        )

        console.log(`Token saved! Lando is now connected to Kinsta.`);
      } else {
        console.log(`Token is invalid!`);
      }
  }
  });