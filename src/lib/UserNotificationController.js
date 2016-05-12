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

var log2out = require('log2out');
var NotificationMessagePrepare = require('./NotificationMessagePrepare');
var NotificationMessageSender = require('./NotificationMessageSender');

var UserNotificationController = function (stompConnectionFactory, notificationMessagePrepare, notificationMessageSender) {
    this.logger = log2out.getLogger("UserNotification");
    this.notificationMessagePrepare = notificationMessagePrepare || new NotificationMessagePrepare();
    this.notificationMessageSender = notificationMessageSender || new NotificationMessageSender(stompConnectionFactory);
};

UserNotificationController.prototype.notify = function(notification, users, useExchange, reuseConnection, callback) {
    var notifications = this.notificationMessagePrepare.prepareNotifications(notification, users, useExchange);
    this.notificationMessageSender.send(notifications, reuseConnection, callback);
};

UserNotificationController.prototype.notifyUser = function(notification, user, useExchange, reuseConnection, callback) {
    return this.notify(notification, [user], useExchange, reuseConnection, callback);
};

module.exports = UserNotificationController;
