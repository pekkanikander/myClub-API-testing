function Invoice(member, bank_account_id, due_date, group_id, member_id, invoice_lines = []) {
    // console.log("Invoice for: " + member);
    this._member = member;
    this._json = {
        "invoice": {
            "bank_account_id": bank_account_id,
            "due_date": due_date,
            "group_id": group_id,
            "member_id": member_id,
//          "reference_prefix": member_id,
            "invoice_lines": invoice_lines
        }
    };
}

const method = Invoice.prototype;

method.json = function() {
    return this._json;
}

// XXX Change to Redux objects
method.add_invoice_line = function(invoice_line) {
    //console.log("Add line " + invoice_line);
    this._json.invoice.invoice_lines.push(invoice_line);
}

module.exports = Invoice;
