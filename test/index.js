'use strict';

const assert = require('assert')
const path = require('path');

const Address = require('address-rfc2821').Address;
const fixtures = require('haraka-test-fixtures');

const stub = fixtures.stub.stub;

const _set_up = function (done) {

    // needed for tests
    this.plugin = new fixtures.plugin('user-prefix');
    this.recip = new Address('<test1@example.com>');
    this.params = [this.recip];

    this.connection = new fixtures.connection.createConnection();
    this.connection.transaction = new fixtures.transaction.createTransaction();
    this.connection.transaction.rcpt_to = [this.params];
    this.connection.loginfo = stub();

    // some test data
    this.plugin.config = this.plugin.config.module_config(path.resolve('test'));
    this.plugin.inherits = stub();

    // going to need these in multiple tests
    this.plugin.register();

    done();
}

describe('user-prefix', function () {
    beforeEach(_set_up)

    it('should have register function', function (done) {
        assert.ok(this.plugin)
        assert.equal('function', typeof this.plugin.register)
        done()
    })

    it('register function should inherit from queue/discard', function (done) {
        assert.ok(this.plugin.inherits.called);
        assert.equal(this.plugin.inherits.args[0], 'queue/discard');
        done()
    })

    it('register function should call register_hook()', function (done) {
        assert.ok(this.plugin.register_hook.called);
        done()
    })

    it('register_hook() should register for propper hook', function (done) {
        assert.equal(this.plugin.register_hook.args[0], 'rcpt');
        done()
    })

    it('register_hook() should register available function', function (done) {
        assert.equal(this.plugin.register_hook.args[1], 'userPrefix');
        assert.ok(this.plugin.userPrefix);
        assert.equal('function', typeof this.plugin.userPrefix);
        done()
    })

    it('aliases hook always returns next()', function (done) {
        this.plugin.userPrefix(action => {
            assert.equal(undefined, action);
            done()
        }, this.connection, this.params);
    })

    it('should not change test1@example.com', function (done) {
        this.plugin.userPrefix(() => {
            assert.ok(!this.connection.transaction.notes.discard);
            done()
        }, this.connection, this.params);
    })


    it('should map prefix-test2@example.com to test2@example.com', function (done) {
        const result = new Address('<test2@example.com>');
        this.plugin.userPrefix(() => {
            assert.ok(this.connection.transaction.rcpt_to);
            assert.ok(Array.isArray(this.connection.transaction.rcpt_to));
            assert.deepEqual(this.connection.transaction.rcpt_to.pop(), result);
            done()
        }, this.connection, [new Address('<prefix-test2@example.com>')]);
    })

    it('should map many-dash-prefix-test3@example.com to test3@example.com', function (done) {
        const result = new Address('<test3@example.com>');
        this.plugin.userPrefix(() => {
            assert.ok(this.connection.transaction.rcpt_to);
            assert.ok(Array.isArray(this.connection.transaction.rcpt_to));
            assert.deepEqual(this.connection.transaction.rcpt_to.pop(), result);
            done()
        }, this.connection, [new Address('<many-dash-prefix-test3@example.com>')]);
    })

    it('should map prefix-test4+testing@example.com to test4+testing@example.com', function (done) {
        const result = new Address('<test4+testing@example.com>');
        this.plugin.userPrefix(() => {
            assert.ok(this.connection.transaction.rcpt_to);
            assert.ok(Array.isArray(this.connection.transaction.rcpt_to));
            assert.deepEqual(this.connection.transaction.rcpt_to.pop(), result);
            done()
        }, this.connection, [new Address('<prefix-test4+testing@example.com>')]);
    })
})
