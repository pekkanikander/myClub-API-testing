'use strict'

/**
 * A temporary solution for generating monthly invoices with myClub API
 * Copyright (c) 2016 Pekka Nikander
 *
 * https://www.myclub.fi/api/public.html
 */

const Members = require('./members');
const Invoice = require('./invoice');

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
 * @returns             A function that takes a member and creates an invoice
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
                  new Invoice(arr[0].bank_account.id,
                              due_date,
                              arr[1].group.id,
                              arr[2].member.id));
    }
}

/*
 * XXX: I think is something fishy here and this may not the "right"
 * way of iterating over the members.  But it is good enough for now,
 * before I have time to learn redux-promise-middleware.
 */
function iterate_members(group_name, promise_iterator) {
    return Members.members(group_name)
        .then(promise_array =>
              promise_array.map(promise_iterator));
}

function temp_invoicing(due_date, group_name) {
    const group   = Members.group(group_name);
    const account = Members.accounts().first();

    const create_monthly_invoice_for_member
          = create_monthly_invoices(account, group, due_date);

    console.log("Begin iterate " + group + account);
    return iterate_members(group_name, create_monthly_invoice_for_member)
        .then(invoices =>
              Promise.all(invoices)
              .then(invoices => invoices.map(inv => console.log(inv))));
}

// Members.groups().then(console.log);
// Members.group('Pojat-06').then(console.log);
// Members.members('Pojat-06').then(console.log);
// iterate_members('Pojat-06', promise => promise.then(console.log));

try {
    temp_invoicing('Today', 'Pojat-06').then(() => console.log("Done."));
} catch (error) {
    console.log(error);
}

console.log("End of file");



