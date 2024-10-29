'use strict';

const kinsta_client = require('../utils/kinsta');


module.exports = lando => ({
    command: 'kinsta-site',
    describe: 'Get details on the current kinsta site',
    options: {
      sitename: {
        describe: 'Name of the site on Kinsta',
        alias: ['q'],
        default: false,
      }
    },
    run: async options => {
      const { root, project } = options._app;

      // Check if we have everything we need
      const token = lando.config.kinsta_token;
      const company_id = lando.config.kinsta_company_id;

      if(!token || !company_id) {
        lando.log.warn('Please login first using `lando kinsta-auth`');
        return;
      }

      // Try to get our app
      const app = lando.getApp(root, false);

      // If we have it then init
      if (app) {
        const { get_sites, get_site, get_environments } = kinsta_client( token, company_id )

        try {
          let sites = [];

          if( !options.sitename && app.config.config.kinsta_site_id ){
            sites = [ await get_site( app.config.config.kinsta_site_id ) ];
          } else {
            // Look for slimilar named sites
            sites = await get_sites().then((result) => {
              return result.filter( ( site ) => site.display_name.indexOf( options.sitename || options._app.name  ) > -1 )
            });

            lando.log.info('Found ' + sites.length + ' sites. Its recommended to add the right `kinsta_site_id` to the .lando.yml `config` field' );
          }

          const siteEnvironments = await Promise.all( sites.map( async ( site ) => {
            try {
              return {
                site: site,
                environments: await get_environments( site.id )
              }
            } catch (error) {
              lando.log.error('Could not fetch environments for site ' + site.display_name + ': ' + error.message );
            }
          }) );

          siteEnvironments.map( function( siteEnvironment ){
            console.log( '\x1b[1;31m', '🌐 ' + siteEnvironment.site.display_name + ' (' + siteEnvironment.site.id + ')', '\x1b[0m' );

            siteEnvironment.environments.map( function( environment ){
              console.log( '\x1b[0;31m', '🚦',  environment.display_name, '\x1b[0m' );
              console.log( '\x1b[0;31m', environment, '\x1b[0m' );
            });
          });

        } catch (error) {
          lando.log.error('Could not fetch sites from Kinsta: ' + error.message );
        }
      }
    }
  });