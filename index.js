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
 * Sets up monthly XXX
 * @returns             A function that takes a member and creates an invoice
 * @param member        A Promise of a member object
 * @param bank_account  A Promise of a bank account
 * @param due_date
 * @param group_id
 */
const create_monthly_invoices = function(bank_account, due_date, group_id) {
    return function(member) {
        console.log("Create: " + bank_account + member);
        return Promise.all([bank_account, member])
            .then(arr =>
                  new Invoice(arr[0].bank_account.id,
                              due_date,
                              group_id,
                              arr[1].member.id));
    }
}

/*
 * XXX: I think is something fishy here and this may not the "right"
 * way of iterating over the members.  But it is good enough for now,
 * before I have time to learn redux-promise-middleware.
 */
function iterate_members(group_name, iterator) {
    return Members.members(group_name)
        .then(members => members.map(member => iterator(member)));
}

/* =========== test code below ========= */

try {
    const create_monthly_invoice_for_member
          = create_monthly_invoices(Members.accounts().first(), "foo", 10);

    iterate_members('Pojat-06', create_monthly_invoice_for_member)
        .then(invoices =>
              Promise.all(invoices)
              .then(invoices => invoices.map(invoice => console.log(invoice))));
} catch (error) {
    console.log("Error" + error);
}

console.log("End of file");



