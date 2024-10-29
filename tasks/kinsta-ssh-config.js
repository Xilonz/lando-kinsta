'use strict';

const fs = require('fs');
const os = require('os');
const kinsta_client = require('../utils/kinsta');


module.exports = lando => ({
    command: 'kinsta-ssh-config',
    describe: 'Dump all Kinsta Environments to your ssh config.',
    run: async options => {
      const token = lando.config.kinsta_token;
      const company_id = lando.config.kinsta_company_id;

      if(!token || !company_id) {
        lando.log.warn('Please login first using `lando kinsta-auth`');
        return;
      }

      const { get_sites, get_environments } = kinsta_client( token, company_id )

      try {
        const sites = await get_sites()

        if( sites.length >= 119 ){
          lando.log.warn(`Congrats 🎉 You have quite a lot (${sites.length}) of Kinsta sites. Unfortunatly this might take a while due to rate limiting.`);
        }

        const siteEnvironments = await Promise.all( sites.map( async (site) => {
          return {
            site: site,
            environments: await get_environments( site.id )
          }
        }))

        const sshConfig = siteEnvironments.reduce( ( acc, siteEnvironment ) => {
          const site = siteEnvironment.site;

          return acc + siteEnvironment.environments.reduce( ( acc, environment ) => {
            return acc + "\n# " + site.display_name + ' ' + environment.display_name + "\n" + 
              'Host '  + site.name + '-' + environment.name + "\n" + 
              '  HostName ' + environment.ssh_connection.ssh_ip.external_ip + "\n" + 
              '  User ' + site.name + "\n" + 
              '  Port ' + environment.ssh_connection.ssh_port + "\n" +
              '  StrictHostKeyChecking no \n' +    // Disable strict host key checking
              '  ForwardAgent yes \n' +            // Allow forwarding of the authentication agent connection.
              '  UserKnownHostsFile=/dev/null \n'+ // Kinsta doesn't expose the fingerprint, so we can't check it.
              '  CheckHostIP no \n'                // Don't check the IP address of the host.
          }, '');
        }, '');

        const userHomeDir = os.homedir();
        var config = fs.readFileSync( userHomeDir + '/.ssh/config', {encoding:'utf8', flag:'r'});
        const regex = /#kinsta-include\n(.*)\n#end-kinsta-include/gms
        const new_config = `#kinsta-include\n${sshConfig}\n#end-kinsta-include`;

        if(config.match(regex) === null ){
          if( config.slice(-1) != "\n"){
            config.concat("\n");
          }

          config = config.concat( new_config );
        } else {
          config = config.replace(regex, new_config);
        }

        fs.writeFileSync( userHomeDir + '/.ssh/config', config);

        lando.log.info('SSH Config updated with Kinsta environments');
      } catch (error) {
        lando.log.error('Could not fetch sites: ' + error.message );
      }
    }
  });