// user-prefix
// Do not run this plugin with the queue/smtp_proxy plugin.
const Address = require('address-rfc2821').Address;

exports.register = function () {
    this.inherits('queue/discard')

    this.register_hook('rcpt', 'userPrefix')
};

exports.userPrefix = function (next, connection, params) {
    const plugin = this
    const user = params[0].user
    const host = params[0].host

    const match = user.split(/-/).reverse()[0]
    const toAddress = `${match}@${host}`

    if (!connection?.transaction) return

    const txn = connection.transaction
    connection.logdebug(plugin, `removing user prefix changing ${txn.rcpt_to} to ${toAddress}`)
    txn.rcpt_to.pop()
    txn.rcpt_to.push(new Address(`<${toAddress}>`))
    txn.notes.forward = true

    next()
}
