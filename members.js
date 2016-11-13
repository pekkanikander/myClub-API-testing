#!/usr/local/bin/node

const fetch = require('node-fetch');

/**
 * Retrieve the settings.
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

const default_fetch_headers = {
    'User-Agent': 'fetch'
};

const fetch_options = {
    'headers': Object.assign({}, default_fetch_headers, settings.headers)
};

const base_url = settings.base_url;

/**
 * Retrieves all membership groups defined at the myClub club.
 * @returns A Promise for an array of all groups
 */
const fetch_groups = () =>
      fetch(base_url + 'groups', fetch_options)
      .then(res => res.json())
      .catch(function() { throw new Error('Could not retrieve groups')});

/*
 * Retrieves all membership ids of the members of a given group.
 * @returns A Promise for an array of the membership ids
 */
const fetch_member_ids = (group_id) =>
      fetch(base_url + 'groups/' + group_id + '/memberships', fetch_options)
      .then(res  => res.json())
      .then(json => json.map(member => member.membership.member_id))
      .catch(function() { throw new Error('Could not retrieve group ' + group_id)});

/*
 * Retrieves a member by identifier
 * @returns A Promise for a member record
 */
const fetch_member = (member_id) =>
      fetch(base_url + 'members/' + member_id, fetch_options)
      .then(res => res.json())
      .catch(function() { throw new Error('Could not retrieve member ' + member_id)});

/*
 * Retrieves the members of a given group
 * @returns A Promise for array of Promises of member records
 */
const fetch_members = (group_name) =>
      fetch_groups()
      .then(json  => json.find(group => group.group.name === group_name))
      .then(group => fetch_member_ids(group.group.id))
      .then(ids   => ids.map(id => fetch_member(id)))
      .catch(function() { throw new Error('Could not retrieve group ' + group_name)});

/* ====== testing code ======= */

const members = fetch_members('Pojat-06');

members.then(a => a.map(m => m.then(member => console.log(member.member.id))));



