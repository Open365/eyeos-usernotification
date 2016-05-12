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
var UserNotificationController = require('../lib/UserNotificationController');
var Notification = require('../lib/Notification');
var NotificationMessagePrepare = require('../lib/NotificationMessagePrepare');

suite('UserNotificationControllerTest', function () {
    var sut;
    var users;
    var notification;
    var preparer;
    var notificationMessageSenderFake;
    var callbackFake;
    var expectedUsers;
    setup(function () {
        notification = new Notification('type', 'data');
        users = ['user1', 'user2', 'user3'];
        expectedUsers = ['user1', 'user2', 'user3', 'anonymous'];
        preparer = new NotificationMessagePrepare();
        sinon.spy(preparer, 'prepareNotifications');
        notificationMessageSenderFake = {send: sinon.spy()}
        callbackFake = sinon.spy();
        sut = new UserNotificationController(null, preparer, notificationMessageSenderFake);
    });

    suite('#notify', function() {
        test('should call NotificationMessagePrepare.prepareNotifications to prepare the notifications', sinon.test(function () {
            sut.notify(notification, users);

            sinon.assert.calledOnce(preparer.prepareNotifications);
            sinon.assert.calledWith(preparer.prepareNotifications, notification, users);
        }));

        test('should call NotificationMessagePrepare.prepareNotifications with correct params', sinon.test(function () {
            var useExchange = true;
            sut.notify(notification, users, useExchange);

            sinon.assert.calledOnce(preparer.prepareNotifications);
            sinon.assert.calledWithExactly(preparer.prepareNotifications, notification, users, useExchange);
        }));

        test('should call notificationmessagesender.send to send the notifications', function() {
            sut.notify(notification, users);
            assert(notificationMessageSenderFake.send.calledOnce, 'Failed to call NotificationMessageSender');
        });

        test('should call notificationmessagesender.send with an array of notifications, one for each user', function() {
            sut.notify(notification, users);
            var notifications = notificationMessageSenderFake.send.args[0][0];
            assert.equal(notifications.length, users.length, 'Incorrect number of notifications sent');
        });

        test('should call notificationmessagesender.send with correct notifications', function() {
            sut.notify(notification, users);
            var notifications = notificationMessageSenderFake.send.args[0][0];

            for(var i=0;i<notifications.length;i++) {
                var cnotification = notifications[i];

                assert.equal(cnotification.getData(), notification.getNotificationText());
                assert.equal(cnotification.getDestination(), '/exchange/user_'+users[i]+'/user_'+users[i]);
            }
        });

        test('should call notificationmessagesender.send with reuseConnection parameter', function() {
            var reuseConnection = true;
            sut.notify(notification, users, true, reuseConnection);

            sinon.assert.calledOnce(notificationMessageSenderFake.send);
            sinon.assert.calledWith(notificationMessageSenderFake.send, sinon.match.array, reuseConnection);
        });

    });

    suite('#notifyUser', function() {
        setup(function () {
            sinon.spy(sut, 'notify');
        });
        test('should call this.notify with an array with single username to send the notification', sinon.test(function() {
            var username = 'alan.turing';

            sut.notifyUser(notification, username);

            sinon.assert.calledWith(sut.notify, notification, sinon.match.array);
            var users = sut.notify.firstCall.args[1];
            assert.include(users, username);
            assert.lengthOf(users, 1);
        }));

        test('should call this.notify maintaining useExchange and reuseConnection options', sinon.test(function() {
            var username = 'alan.turing';
            var reuseConnection = true;
            var useExchange = false;

            sut.notifyUser(notification, username, useExchange, reuseConnection );

            sinon.assert.calledWith(sut.notify, notification, sinon.match.array, useExchange, reuseConnection);
        }));
    });
});
