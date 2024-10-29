'use strict';

const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const kinsta_client = ( token, company_id = null ) => {
    const http = rateLimit(axios.create(), { maxRequests: 120, perMilliseconds: 61000 });

    const validate = () => http.request({
        url: 'https://api.kinsta.com/v2/validate',
        headers: {
            'Authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        method: 'get',
        }).then((result) => {
            return result.data;
        });
    
    const get_sites = () => http.request({
        url: 'https://api.kinsta.com/v2/sites',
        headers: {
            'Authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        params: {
            company: company_id,
        },
        method: 'get',
        }).then((result) => {
            return result.data?.company?.sites ?? [];
        });

    const get_site = ( site_id ) => http.request({
        url: 'https://api.kinsta.com/v2/sites/' + site_id,
        headers: {
            'Authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        method: 'get',
        }).then((result) => {
            return result.data?.site ?? {};
        }); 


    const get_environments = ( site_id ) => http.request({
        url: 'https://api.kinsta.com/v2/sites/' + site_id + '/environments',
        headers: {
            'Authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        method: 'get',
        }).then((result) => {
            return result.data?.site?.environments ?? [];
        });

    return {
        get_site,
        get_sites,
        get_environments,
        validate,
    }
}

module.exports = kinsta_client;