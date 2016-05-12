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
var NotificationMessage = require('./NotificationMessage');
var NotificationMessageSender = require('./NotificationMessageSender');
var User = require('./User');

var NotificationMessagePrepare = function (notificationMessageSender) {
    this.logger = log2out.getLogger("UserNotification");
    this.notificationMessageSender = notificationMessageSender || new NotificationMessageSender();
};

NotificationMessagePrepare.prototype.prepareSingleNotificationFor = function(username, notification, useExchange) {
    var user = new User(username);
    return new NotificationMessage(user.getDestinationName(useExchange), notification.getNotificationText());
};

NotificationMessagePrepare.prototype.prepareNotifications = function(notification, users, useExchange) {
    var useExchange = true;  //Always a exchange.
    var notifications = [];
    var username;
    var message;
    for(var i=0;i<users.length;i++) {
        username = users[i];
        message = this.prepareSingleNotificationFor(username, notification, useExchange);
        notifications.push(message);
    }
    return notifications;
};

module.exports = NotificationMessagePrepare;
