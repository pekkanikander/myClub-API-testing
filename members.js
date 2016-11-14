'use strict'

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
    'User-Agent': 'fetch',
    'Content-Type': 'application/json',
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
 * Retrieves a group by its name
 * @returns a Promise for a group object
 */
function fetch_group(group_name) {
    return fetch_groups()
        .then(json => json.find(group => group.group.name === group_name))
        .catch(function() { throw new Error('Could not retrieve group ' + group_name)});
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
    return fetch_group(group_name)
        .then(group => fetch_member_ids(group.group.id))
        .then(ids   => ids.map(id => fetch_member(id)))
        .catch(function() { throw new Error('Could not retrieve group ' + group_name)});
}

/**
 * Retrieves the list of bank accounts
 * @returns A promise for an array of bank accounts
 * XXX: Move to a separate module
 */
function temp_fetch_accounts() {
    return fetch(base_url + 'bank_accounts', fetch_options)
        .then(res => res.json())
        .catch(function() { throw new Error('Could not retrieve bank accounts')});
}

function temp_fetch_account(iban) {
    return temp_fetch_accounts()
        .then(accounts =>
              accounts.find(account => account.bank_account.iban == iban));
}

/**
 * Retrieves an event by its ID, which must be known
 * @returns A promise for an event
 * XXX: Move to a separate module
 */
function temp_fetch_event(event_id) {
    return fetch(base_url + 'events/' + event_id, fetch_options)
        .then(res => res.json())
        .catch(function() { throw new Error('Could not retrieve event' + event_id)});
}

/**
 * Posts a new invoice
 * XXX: Move to a separate module
 */
function temp_post_invoice(invoice) {
    const post_options = {
        headers: Object.assign({}, default_fetch_headers, settings.headers),
        method: 'POST',
        body:   JSON.stringify(invoice._json)
    };

    // console.log(post_options);

    const f = fetch(base_url + 'invoices', post_options);
    f.then(result => console.log(invoice._member.member.id, result.status));
    return f;
}

/* XXX: Convert to redux states */
exports.groups   = fetch_groups;
exports.group    = fetch_group;
exports.member   = fetch_member;
exports.members  = fetch_members;

exports.accounts     = temp_fetch_accounts;
exports.account      = temp_fetch_account;
exports.event        = temp_fetch_event;
exports.post_invoice = temp_post_invoice;

/* ====== testing code =======

const members = fetch_members('Pojat-06');

members.then(a => a.map(m => m.then(member => console.log(member.member.id))));

*/

