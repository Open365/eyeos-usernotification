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
var Notification = require('../lib/Notification');

suite('NotificationTest', function () {
    var sut;
    var type = 'testtype';
    var data = 'testdata';
    setup(function () {
        sut = new Notification(type, data);
    });

    suite('#constructor', function() {
        test('Should return the correct notification when called with 2 strings', function() {
            var notification = new Notification(type, data);

            assert.instanceOf(notification, Notification);
            assert.equal(notification.type, type);
            assert.equal(notification.data, data);
        });

        test('Should return the correct notification when called with an object with type and data', function() {
            var obj = {
                type: type,
                data: data
            };
            var notification = new Notification(obj);

            assert.instanceOf(notification, Notification);
            assert.equal(notification.type, type);
            assert.equal(notification.data, data);
        });
    });

    suite('#getNotificationText', function() {
        test('Should return the notification in json format', function() {
            var notificationText = sut.getNotificationText();
            var notificationData = JSON.parse(notificationText);
            assert.equal(type, notificationData.type, "Failed to recover type from notification");
            assert.equal(data, notificationData.data, "Failed to recover data from notification");
        });
    });
});
