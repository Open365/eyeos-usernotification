/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var sinon = require('sinon');
var assert = require('chai').assert;

var eyeosAmqp = require('eyeos-amqp');
var amqpConnectionFactory = eyeosAmqp.amqpConnectionFactory;

var userQueueDeclarer = require('../lib/userQueueDeclarer');

suite('userQueueDeclarer', function () {
    suite('declareUserQueue', function () {
        var username;
        var cb;
        var amqpConnectionFake;
        var amqpSettings;
        var amqpDeclarerFake;

        suite('#declareUserQueue - declarer OK', function () {
            setup(function () {
                cb = sinon.spy();
                username = 'martin.fowler';
                amqpConnectionFake = {
                    once: sinon.spy(),
                    removeListener: sinon.spy()
                };
                amqpDeclarerFake = {
                    declare: sinon.stub().yields(null, {name: 'fake queue'})
                };
                sinon.stub(userQueueDeclarer, 'getAMQPDeclarerInstance').returns(amqpDeclarerFake);
                amqpSettings = {host: 'rabbit.service.consul', port: 5672};
                sinon.stub(amqpConnectionFactory, 'getInstance').yields(null, amqpConnectionFake);
            });
            teardown(function () {
                amqpConnectionFactory.getInstance.restore();
                userQueueDeclarer.getAMQPDeclarerInstance.restore();
            });

            test('Should get an amqp connection instance', function () {
                userQueueDeclarer.declareUserQueue(username, cb, amqpSettings);

                sinon.assert.calledOnce(amqpConnectionFactory.getInstance);
                sinon.assert.calledWithExactly(amqpConnectionFactory.getInstance, amqpSettings, sinon.match.func);
            });

            test('Should get an amqp connection instance with default amqpSettings when no provided', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(amqpConnectionFactory.getInstance);
                sinon.assert.calledWithExactly(amqpConnectionFactory.getInstance, sinon.match({host: sinon.match.string, port: sinon.match.number}), sinon.match.func);
            });

            test('Should register to connection errors', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(amqpConnectionFake.once);
                sinon.assert.calledWithExactly(amqpConnectionFake.once, 'error', sinon.match.func);
            });

            test('Should unregister from connection errors', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(amqpConnectionFake.removeListener);
                sinon.assert.calledWithExactly(amqpConnectionFake.removeListener, 'error', sinon.match.func);
            });

            test('Should callback when queue is declared', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(cb);
                sinon.assert.calledWithExactly(cb, null, sinon.match.object);
            });
        });

        suite('#declareUserQueue - connection factory error', function () {
            var errorFromConnFactory = "Error from conn factory";
            setup(function () {
                cb = sinon.spy();
                username = 'martin.fowler';
                amqpConnectionFake = {
                    once: sinon.spy(),
                    removeListener: sinon.spy()
                };
                amqpDeclarerFake = {
                    declare: sinon.stub().yields(null, {name: 'fake queue'})
                };
                sinon.stub(userQueueDeclarer, 'getAMQPDeclarerInstance').returns(amqpDeclarerFake);
                amqpSettings = {host: 'rabbit.service.consul', port: 5672};
                sinon.stub(amqpConnectionFactory, 'getInstance').yields(errorFromConnFactory, null);
            });
            teardown(function () {
                amqpConnectionFactory.getInstance.restore();
                userQueueDeclarer.getAMQPDeclarerInstance.restore();
            });

            test('Should callback with error from connFactory', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(cb);
                sinon.assert.calledWithExactly(cb, errorFromConnFactory);
            });
        });

        suite('#declareUserQueue - connection error', function () {
            var errorFromConnection = "Error from connection";
            setup(function () {
                cb = sinon.spy();
                username = 'martin.fowler';
                amqpConnectionFake = {
                    once: sinon.stub().yields(errorFromConnection, null),
                    removeListener: sinon.spy()
                };
                amqpDeclarerFake = {
                    declare: sinon.spy()
                };
                sinon.stub(userQueueDeclarer, 'getAMQPDeclarerInstance').returns(amqpDeclarerFake);
                amqpSettings = {host: 'rabbit.service.consul', port: 5672};
                sinon.stub(amqpConnectionFactory, 'getInstance').yields(null, amqpConnectionFake);
            });
            teardown(function () {
                amqpConnectionFactory.getInstance.restore();
                userQueueDeclarer.getAMQPDeclarerInstance.restore();
            });

            test('Should callback with error from connection', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(cb);
                sinon.assert.calledWithExactly(cb, errorFromConnection);
            });

            test('Should remove connection error listener', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(amqpConnectionFake.removeListener);
                sinon.assert.calledWith(amqpConnectionFake.removeListener, 'error', sinon.match.func);
            });
        });

        suite('#declareUserQueue - userQueue declaration error', function () {
            var errorFromDeclarer = "Error from conn factory";
            setup(function () {
                cb = sinon.spy();
                username = 'martin.fowler';
                amqpConnectionFake = {
                    once: sinon.spy(),
                    removeListener: sinon.spy()
                };
                amqpDeclarerFake = {
                    declare: sinon.stub().yields(errorFromDeclarer)
                };
                sinon.stub(userQueueDeclarer, 'getAMQPDeclarerInstance').returns(amqpDeclarerFake);
                amqpSettings = {host: 'rabbit.service.consul', port: 5672};
                sinon.stub(amqpConnectionFactory, 'getInstance').yields(null, amqpConnectionFake);
            });
            teardown(function () {
                amqpConnectionFactory.getInstance.restore();
                userQueueDeclarer.getAMQPDeclarerInstance.restore();
            });

            test('Should callback with error from declaration', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(cb);
                sinon.assert.calledWith(cb, errorFromDeclarer);
            });

            test('Should remove connection error listener', function () {
                userQueueDeclarer.declareUserQueue(username, cb);

                sinon.assert.calledOnce(amqpConnectionFake.removeListener);
                sinon.assert.calledWith(amqpConnectionFake.removeListener, 'error', sinon.match.func);
            });
        });

    });
});
