function Invoice(bank_account_id, due_date, group_id, member_id, invoice_lines) {
    console.log("Invoice:" + member_id);
    this._json = {
        "invoice": {
            "bank_account_id": bank_account_id,
            "due_date": due_date,
            "group_id": group_id,
            "member_id": member_id,
            "invoice_lines": invoice_lines
        }
    };
}

const method = Invoice.prototype;

method.json = function() {
    return this._json;
}

module.exports = Invoice;
