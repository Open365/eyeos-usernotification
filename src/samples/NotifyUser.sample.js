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

;'use strict';

var userNotification = require('../index');
var userQueueDeclarer = userNotification.userQueueDeclarer;
var Notification = userNotification.Notification;
var NotificationController = userNotification.NotificationController;

var username = 'alan.turing';
var recvdMessages = 0;

var StompConnectionFactory = require('../lib/StompConnectionFactory');

StompConnectionFactory.getInstance(function(stomp) {
    userQueueDeclarer.declareUserQueue(username, function(err, userQueue) {
        userQueue.subscribe(function(msg){
            recvdMessages += 1;
            console.log('***-> received %d msgs in QUEUE: %s . current msg ', recvdMessages, userQueue.name, 'data:', msg.data.toString());
        });
        console.time('a');
        var notificationController = new NotificationController();
        for (var i = 0; i < 1; i++) {
            var type = 'onlineUser';
            var notification = new Notification(type, JSON.stringify({user: username, date: new Date(), i: i}));

            // fire and forget: new stomp connection created and closed after send.
            notificationController.notifyUser(notification, username, true); //notify to /exchange/user_alan.turing/user_alan.turing
            notificationController.notifyUser(notification, username, false); //notify to /topic/user_alan.turing
            notificationController.notifyUser(notification, username); //notify to /topic/user_alan.turing

            // reusing connection, not closed after send.
            notificationController.notifyUser(notification, username, true, true); //reusing connection: notify to /exchange/user_alan.turing/user_alan.turing
        }
    });
});
