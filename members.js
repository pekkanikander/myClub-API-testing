/**
 * myClub.fi API functions for handling club members
 * Copyright (c) 2016 Pekka Nikander
 *
 * https://www.myclub.fi/api/public.html#members
 */

const fetch = require('node-fetch');

/**
 * Retrieve the user-specific settings.
 *
 * XXX Move to some other module
 *
 * The settings are stored as JSON, something like the following:
   {
      "base_url": "https://yourclub.myclub.fi/api/",
      "headers":{
        "X-myClub-token":"<the-api-token>"
     }
   }
 */
const settings = require("./settings.json");

/**
 * Default headers to send with fetch
 */
const default_fetch_headers = {
    'User-Agent': 'fetch'
};

/**
 * All fetch options
 *
 * Compiled together from settings, default headers, etc
 */
const fetch_options = {
    'headers': Object.assign({}, default_fetch_headers, settings.headers)
};

/**
 * The base URL for all fetch operations towards myClub
 */
const base_url = settings.base_url;

/**
 * Retrieves all membership groups defined at the myClub club.
 * @returns A Promise for an array of all groups
 */
function fetch_groups() {
    return fetch(base_url + 'groups', fetch_options)
        .then(res => res.json())
        .catch(function() { throw new Error('Could not retrieve groups')});
}

/**
 * Retrieves all membership ids of the members of a given group.
 * @returns A Promise for an array of the membership ids
 */
function fetch_member_ids(group_id) {
    return fetch(base_url + 'groups/' + group_id + '/memberships', fetch_options)
        .then(res  => res.json())
        .then(json => json.map(member => member.membership.member_id))
        .catch(function() { throw new Error('Could not retrieve group ' + group_id)});
}

/**
 * Retrieves a member by identifier
 * @returns A Promise for a member record
 */
function fetch_member(member_id) {
    return fetch(base_url + 'members/' + member_id, fetch_options)
        .then(res => res.json())
        .catch(function() { throw new Error('Could not retrieve member ' + member_id)});
}

/**
 * Retrieves the members of a given group
 * @returns A Promise for an array of Promises of member records
 */
function fetch_members(group_name) {
    return fetch_groups()
        .then(json  => json.find(group => group.group.name === group_name))
        .then(group => fetch_member_ids(group.group.id))
        .then(ids   => ids.map(id => fetch_member(id)))
        .catch(function() { throw new Error('Could not retrieve group ' + group_name)});
}

/**
 * Retrieves the list of bank accounts
 * @returns A promise for an array of bank accounts
 * XXX: Move to a separate module
 */
function fetch_accounts() {
    return fetch(base_url + 'bank_accounts', fetch_options)
        .then(res => res.json())
        .catch(function() { throw new Error('Could not retrieve bank accounts')});
}


/* XXX: Convert to redux states */
exports.groups   = fetch_groups;
exports.member   = fetch_member;
exports.members  = fetch_members;
exports.accounts = fetch_accounts;

/* ====== testing code =======

const members = fetch_members('Pojat-06');

members.then(a => a.map(m => m.then(member => console.log(member.member.id))));

*/

