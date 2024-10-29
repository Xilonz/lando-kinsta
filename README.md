# Lando Kinsta plugin
Work in progress

The goal of this lando plugin is to add utilities to lando we can leverage to make developing on Kinsta easier.

## Supported commands:

- `lando kinsta-auth` lets you set your API key. You only need to run this command once, unless you need to switch organisations or account.

- `lando kinsta-ssh-config` dumps all Kinsta environments to your ssh config file for easier ssh-ing

- `lando kinsta-siteinfo` shows information about your current site.

- `lando kinsta-siteinfo -q my-site` search for my-site.

## lando.yml

Set you site id for the kinsta-siteinfo command
```yml
...
config:
  kinsta_site_id: 'my-sites-uuid'
...
```

## Wishlist
- Pull and push commands
- Proxy assets to a staging or live environemt
- Recipe that matches (or utilizes) the Kinsta closely, e.g. using the devKinsta docker image
- Get rid of the seperator between kinsta-(command) 

## Help
Help is always appreciated  check out the wishlist and open pull requests to see if you can jump in.