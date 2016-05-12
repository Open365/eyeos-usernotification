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

require('log2out').clearAppenders();

var sinon = require('sinon');
var assert = require('chai').assert;
var NotificationMessageSender = require('../lib/NotificationMessageSender');
var NotificationMessage = require('../lib/NotificationMessage');
var StompConnectionFactory = require('../lib/StompConnectionFactory');

suite('NotificationMessageSender', function () {
    var sut;
    var notificationMessages = [
        new NotificationMessage('destination1', 'data1'),
        new NotificationMessage('destination2', 'data2'),
        new NotificationMessage('destination3', 'data3')
    ];
    var stomp;
    var sendStub;
    var getInstanceStub;
    var fakeCallback;
    var factoryFake;

    setup(function () {
        stomp = {
            send: sinon.stub().returns({headers: {receipt: 'abc'}}),
            on: function(event, cb){
                process.nextTick(function(){
                    if(event === 'receipt') cb('abc');
                });
            },
            removeListener: sinon.spy()
        };
        getInstanceStub = sinon.stub().yields(stomp);
        factoryFake = {
            getInstance: getInstanceStub,
            releaseConnection: sinon.spy()
        };
        fakeCallback = sinon.spy();
        sut = new NotificationMessageSender(factoryFake);
    });

    teardown(function() {
        //getInstanceStub.restore();
    });

    suite('#send', function() {
        test('should send all the messages using stomp', sinon.test(function() {
            sut.send(notificationMessages);
            assert.equal(stomp.send.callCount, notificationMessages.length, "Failed to send all the messages");
        }));

        test('should send the messages with correct destination and body', sinon.test(function() {
            sut.send(notificationMessages);
            for(var i=0;i<notificationMessages.length;i++) {
                assert.equal(stomp.send.args[i][0].destination, notificationMessages[i].getDestination(), 'Failed to pass destination');
                assert.equal(stomp.send.args[i][0].body, notificationMessages[i].getData(), 'Failed to pass body');
            }
        }));

        test('should get a stomp connection from the factory', sinon.test(function() {
            var notificationMessages = [
                new NotificationMessage('destination3', 'data3')
            ];
            sut.send(notificationMessages);
            sinon.assert.calledOnce(factoryFake.getInstance);
        }));

        test('should release the connection to the factory', sinon.test(function(done) {
            var notificationMessages = [
                new NotificationMessage('destination3', 'data3')
            ];

            sut.send(notificationMessages);

            process.nextTick(function () {
                sinon.assert.calledOnce(factoryFake.releaseConnection);
                sinon.assert.calledWithExactly(factoryFake.releaseConnection, stomp);
                done();
            })
        }));

        test('should remove the connection event listener to receipts (previous memory leak)', sinon.test(function(done) {
            var notificationMessages = [
                new NotificationMessage('destination3', 'data3')
            ];

            sut.send(notificationMessages);

            process.nextTick(function () {
                sinon.assert.calledOnce(stomp.removeListener);
                sinon.assert.calledWithExactly(stomp.removeListener, 'receipt', sinon.match.func);

                done();
            })
        }));

        test('Should call the callback function if provided when releaseConnection is true', sinon.test(function(done) {
            var notificationMessages = [
                new NotificationMessage('destination3', 'data3')
            ];
            sut.send(notificationMessages, true, fakeCallback);
            process.nextTick(function () {
                sinon.assert.calledOnce(fakeCallback);
                done();
            })
        }));

        test('Should call the callback function if provided when releaseConnection is false', sinon.test(function(done) {
            var notificationMessages = [
                new NotificationMessage('destination3', 'data3')
            ];
            sut.send(notificationMessages, false, fakeCallback);
            process.nextTick(function () {
                sinon.assert.calledOnce(fakeCallback);
                done();
            })
        }));
    });
});
