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
var NotificationMessage = require('../lib/NotificationMessage');
var NotificationMessagePrepare = require('../lib/NotificationMessagePrepare');
var NotificationMessageSender = require('../lib/NotificationMessageSender');
var Notification = require('../lib/Notification');
var UserTest = require('./User.test');
var assertIsValidTopic = UserTest.assertIsValidTopic;
var assertIsValidExchange = UserTest.assertIsValidExchange;

suite('NotificationMessagePrepare', function () {
    var sut;
    var notificationMessageSender;
    var notificationSendStub;
    var notification, users;

    setup(function () {
        notification = new Notification('type', 'data');
        users = ['user1', 'user2', 'user3'];
        notificationMessageSender = new NotificationMessageSender();
        notificationSendStub = sinon.stub(notificationMessageSender,'send');
        sut = new NotificationMessagePrepare(notificationMessageSender);
    });

    suite('#prepareSingleNotificationFor', function () {
        test('Should return a NotificationMessage pointing to topic when useExchange param not specified (backwards compatibility)', function () {
            var username = 'alan.turing';
            var notificationMessage = sut.prepareSingleNotificationFor(username, notification);
            assertIsValidTopic(notificationMessage.getDestination());
        });

        test('Should return a NotificationMessage pointing to topic when useExchange param is false', function () {
            var username = 'alan.turing';
            var notificationMessage = sut.prepareSingleNotificationFor(username, notification, false);
            assertIsValidTopic(notificationMessage.getDestination());
        });

        test('Should return a NotificationMessage pointing to queue when useExchange param is true', function () {
            var username = 'alan.turing';
            var notificationMessage = sut.prepareSingleNotificationFor(username, notification, true);
            assertIsValidExchange(notificationMessage.getDestination());
        });
    });

    suite('#prepareNotifications', function() {
        test('Should return an array of NotificationMessage', function () {
            var notifications = sut.prepareNotifications(notification, users);

            assert.isArray(notifications);
            assert.isTrue(notifications.every(function(notification){return notification instanceof NotificationMessage}));
        });

        test('Should there should be one notification per user', function () {
            var notifications = sut.prepareNotifications(notification, users);

            assert.lengthOf(notifications, users.length);
        });
    });
});
