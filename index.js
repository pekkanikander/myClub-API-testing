"use strict"

/**
 * A temporary solution for generating monthly invoices with myClub API
 * Copyright (c) 2016 Pekka Nikander
 *
 * https://www.myclub.fi/api/public.html
 */

/*
 * XXX
 */
const Members = require("./members");
const Invoice = require("./invoice");

/* XXX TEMP constants, remove */

const temp_black_group_id = 9997; // = 10429;
const temp_red_group_id   = 10430;
const temp_white_group_id = 10431;

const temp_ac_group_name = 'Pojat-06';

const temp_tiago_black_event_id     = 382378; // = 414606;
const temp_tiago_red_white_event_id = 382377; // = 414615;

const temp_tiago_black_event_promise     = Members.event(temp_tiago_black_event_id);
const temp_tiago_red_white_event_promise = Members.event(temp_tiago_red_white_event_id);

var temp_tiago_red_white_event = {};

temp_tiago_red_white_event.participations = [];

temp_tiago_red_white_event_promise.then(function(event) {
    temp_tiago_red_white_event = event; // XXX REMOVE global nastiness
    // console.log(temp_tiago_red_white_event.participations);
});

const temp_black_monthly_membership = {
    "category_id": 3642, // XXX 143,
    "editable": true,
    "gross_unit_price": "115.0",
    "net_unit_price": "115.0",
    "number": 100,
    "quantity": "1.0",
    "title": "KaPa 06 AC Black kuukausimaksu",
    "vat_percent": "0.0"
};

const temp_red_monthly_membership = {
    "category_id": 143,
    "editable": true,
    "gross_unit_price": "90.0",
    "net_unit_price": "90.0",
    "number": 100,
    "quantity": "1.0",
    "title": "KaPa 06 AC Red kuukausimaksu",
    "vat_percent": "0.0"
};

const temp_white_monthly_membership = {
    "category_id": 143,
    "editable": true,
    "gross_unit_price": "65.0",
    "net_unit_price": "65.0",
    "number": 100,
    "quantity": "1.0",
    "title": "K\u00e4Pa 06 AC White kuukausimaksu",
    "vat_percent": "0.0"
};

const temp_black_tiago_reduction = {
    "category_id": 143,
    "editable": true,
    "gross_unit_price": "-20.0",
    "net_unit_price": "-20.0",
    "number": 200,
    "quantity": "1.0",
    "title": "Hyvitys Tiagon oheisharjoituksista",
    "vat_percent": "0.0"
};

const temp_tiago_exercise = {
    "category_id": 3642, // XXX 143,
    "editable": true,
    "gross_unit_price": "20.0",
    "net_unit_price": "20.0",
    "number": 200,
    "quantity": "1.0",
    "title": "Tiagon oheisharjoitukset keskiviikkoisin",
    "vat_percent": "0.0"
};

/**
 * A helper function that returns the first item in a Promised array
 * @param   promise  A promise for an array
 * @returns          A promise for the first member of the array
 * XXX: Don't rape the global scope, refactor later on...
 */
Promise.prototype.first = function () {
    return this.then(array => array[0]);
}

/**
 * Sets up monthly invoicing from a given account, with a given due date, and group id
 * @returns             A function that takes a member promise and creates an invoice (promise)
 * @param member        A Promise of a member object
 * @param bank_account  A Promise of a bank account
 * @param due_date
 * @param group_id
 */
const create_monthly_invoices = function(bank_account, group, due_date) {
    return function(member_promise) {
        // console.log("Create: " + bank_account + group + due_date + member_promise);
        return Promise.all([bank_account, group, member_promise])
            .then(arr => // console.log(arr));
                  new Invoice(arr[2],
                              arr[0].bank_account.id,
                              due_date,
                              arr[1].group.id,
                              arr[2].member.id));
    }
}

/**
 * @returns A promise for an array of promises
 *
 * XXX: I think is something fishy here and this may not the "right"
 * way of iterating over the members.  But it is good enough for now,
 * before I have time to learn redux-promise-middleware.
 */
function iterate_members(group_name, promise_iterator) {
    return Members.members(group_name)
        .then(promise_array =>
              promise_array.map(promise_iterator));
}

/**
 * Fills in the invoice lines for an invoice that has a correct member id
 * @param invoice A promice for an invoice
 * @returns       A promise for a filled invoice
 */
function temp_fill_invoice(invoice_promise) {
    return invoice_promise.then(function(invoice) {
        // console.log("Fill invoice " + invoice);
        if (invoice._member.member.memberships.find(ms => ms.group_id == temp_black_group_id)) {
            invoice.add_invoice_line(temp_black_monthly_membership);
        }
        if (invoice._member.member.memberships.find(ms => ms.group_id == temp_red_group_id)) {
            invoice.add_invoice_line(temp_red_monthly_membership);
        }
        if (invoice._member.member.memberships.find(ms => ms.group_id == temp_white_group_id)) {
            invoice.add_invoice_line(temp_white_monthly_membership);
        }
        temp_maybe_add_tiago_line(invoice);

        // Now the invoice is ready.  Submit it, and return the fetch object
        Members.post_invoice(invoice);
    });
}

function temp_maybe_add_tiago_line(invoice) {
    // console.log("Finding... " + invoice._member.member.id);
    if (temp_tiago_red_white_event.participations.find(part => part.member_id == invoice._member.member.id)) {
        console.log("Participating member " + invoice._member.member.id);
        invoice.add_invoice_line(temp_tiago_exercise);
   }
}

function temp_invoicing(due_date, group_name) {
    const group   = Members.group(group_name);
    const account = Members.accounts().first();

    const create_monthly_invoice_for_member
          = create_monthly_invoices(account, group, due_date);

    // console.log("Begin iterate " + group + account);
    return iterate_members(group_name, create_monthly_invoice_for_member)
        .then(function(invoice_promise_array) {
            const results = invoice_promise_array.map(temp_fill_invoice);

/*
            Promise.all(invoice_promise_array)
                .then(invoices =>
                      invoices.map(inv => console.log(inv._json.invoice)));
*/
            Promise.all(results).then(results => results.map(result => console.log(result)));
        });
}

// Members.groups().then(console.log);
// Members.group(temp_ac_group_name).then(console.log);
// Members.members(temp_ac_group_name).then(console.log);
// iterate_members(temp_ac_group_name, promise => promise.then(console.log));

try {
    temp_invoicing("2016-11-20", temp_ac_group_name).then(() => console.log("Done."));
} catch (error) {
    console.log(error);
}

console.log("End of file");



