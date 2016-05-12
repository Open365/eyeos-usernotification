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
var StompConnectionFactory = require('../lib/StompConnectionFactory');

suite('StompConnectionFactoryTest', function () {
    var FakeStomp;
    var stompConstructorSpy;
    var cb;
    setup(function () {
        FakeStomp = function FakeStomp(settings){
            this.settings = settings;
            this.once = sinon.stub().yields();
            this.connect = sinon.spy();
            this.disconnect = sinon.spy();
        };
        stompConstructorSpy = sinon.spy(FakeStomp);
        StompConnectionFactory.setStompConstructor(stompConstructorSpy);
        cb = sinon.spy();
    });

    teardown(function () {
       StompConnectionFactory.reset();
    });

    suite('#set and get StompConstructor', function() {
        test('Should set/get Stomp constructor function to use', function() {
            StompConnectionFactory.setStompConstructor(stompConstructorSpy);

            assert(StompConnectionFactory.getStompConstructor() === stompConstructorSpy);
        });
    });

    suite('#getStompConnectionInstance', function() {
        test('Should use the Stomp constructor to create an instance', function() {
            StompConnectionFactory.getInstance(cb);

            sinon.assert.calledOnce(stompConstructorSpy);
        });

        test('Should callback with a Stomp instance', function() {
            StompConnectionFactory.getInstance(cb);

            sinon.assert.calledOnce(stompConstructorSpy);

            var cbFirstCallFirstArg = cb.firstCall.args[0];
            assert.instanceOf(cbFirstCallFirstArg, FakeStomp);
        });

        test('Should callback with a Stomp instance that is connected', function() {
            StompConnectionFactory.getInstance(cb);

            var stompConnection = cb.firstCall.args[0];
            sinon.assert.calledOnce(stompConnection.connect);
            sinon.assert.calledOnce(stompConnection.once);
            sinon.assert.calledWithExactly(stompConnection.once, 'connected', sinon.match.func);
        });

        test('Should return a new instance each time when reuseConnection==false', function() {
            StompConnectionFactory.getInstance(cb, false);

            sinon.assert.calledOnce(stompConstructorSpy);

            var cbFirstCallFirstArg = cb.firstCall.args[0];
            assert.instanceOf(cbFirstCallFirstArg, FakeStomp);

            StompConnectionFactory.getInstance(cb, false);

            sinon.assert.calledTwice(stompConstructorSpy);

            var cbSecondCallFirstArg = cb.secondCall.args[0];
            assert.instanceOf(cbSecondCallFirstArg, FakeStomp);

            assert.isFalse(cbFirstCallFirstArg === cbSecondCallFirstArg, 'Expected to get different instances from different getInstanceCalls');
        });

        test('Should return a new instance each time when reuseConnection not specified (backwards compatibility)', function() {
            StompConnectionFactory.getInstance(cb);

            sinon.assert.calledOnce(stompConstructorSpy);

            var cbFirstCallFirstArg = cb.firstCall.args[0];
            assert.instanceOf(cbFirstCallFirstArg, FakeStomp);

            StompConnectionFactory.getInstance(cb);

            sinon.assert.calledTwice(stompConstructorSpy);

            var cbSecondCallFirstArg = cb.secondCall.args[0];
            assert.instanceOf(cbSecondCallFirstArg, FakeStomp);

            assert.isFalse(cbFirstCallFirstArg === cbSecondCallFirstArg, 'Expected to get different instances from different getInstanceCalls');
        });

        test('Should return the same instance each time when reuseConnection==true', function() {
            StompConnectionFactory.getInstance(cb, true);

            sinon.assert.calledOnce(stompConstructorSpy);

            var cbFirstCallFirstArg = cb.firstCall.args[0];
            assert.instanceOf(cbFirstCallFirstArg, FakeStomp);

            StompConnectionFactory.releaseConnection(cbFirstCallFirstArg);

            StompConnectionFactory.getInstance(cb, true);

            sinon.assert.calledOnce(stompConstructorSpy);

            var cbSecondCallFirstArg = cb.secondCall.args[0];
            assert.instanceOf(cbSecondCallFirstArg, FakeStomp);

            assert(cbFirstCallFirstArg === cbSecondCallFirstArg, 'Expected to get same instance from different getInstanceCalls');
        });

        test('Should NOT callback with connection until it is released when reusing connection', function(done) {
            StompConnectionFactory.getInstance(cb, true);

            sinon.assert.calledOnce(cb);

            var connection = cb.firstCall.args[0];

            StompConnectionFactory.getInstance(cb, true);

            setTimeout(function(){
                sinon.assert.calledOnce(cb); //since connection was not released, cb was still not called.

                StompConnectionFactory.releaseConnection(connection);
                setTimeout(function() {
                    sinon.assert.calledTwice(cb); //connection was released, cb called.
                    var secondConnection = cb.secondCall.args[0];
                    assert.deepEqual(connection, secondConnection);
                    done();
                });
            });
        });


    });

    suite('#reset', function() {
        test('Should reset the stomp connection for next getInstance, even when reuseConnection==false', function() {
            StompConnectionFactory.getInstance(cb, true);

            var cbFirstCallFirstArg = cb.firstCall.args[0];

            StompConnectionFactory.reset();

            StompConnectionFactory.getInstance(cb, true);

            sinon.assert.calledTwice(stompConstructorSpy);

            var cbSecondCallFirstArg = cb.secondCall.args[0];
            assert.instanceOf(cbSecondCallFirstArg, FakeStomp);

            assert.isFalse(cbFirstCallFirstArg === cbSecondCallFirstArg, 'Expected to get different instances from different getInstanceCalls');
        });
    });

    suite('#releaseConnection', function() {
        var clock;
        setup(function () {
            //clock = sinon.useFakeTimers();
        });

        teardown(function () {
            //clock.restore();
        });
        test('Should disconnect when is not reusable (was got with reuseConnection==false)', function() {
            StompConnectionFactory.getInstance(cb, false);

            var connection = cb.firstCall.args[0];

            StompConnectionFactory.releaseConnection(connection);

            sinon.assert.calledOnce(connection.disconnect);
        });

        test('Should NOT disconnect when is reusable (was got with reuseConnection==true)', function() {
            StompConnectionFactory.getInstance(cb, true);

            var connection = cb.firstCall.args[0];

            StompConnectionFactory.releaseConnection(connection);

            sinon.assert.notCalled(connection.disconnect);
        });
    });
});
