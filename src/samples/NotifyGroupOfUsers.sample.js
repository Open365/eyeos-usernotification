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

var usernames = ['alan.turing', 'grace.hopper', 'ada.lovelace'];
var recvdMessages = 0;

var StompConnectionFactory = require('../lib/StompConnectionFactory');

StompConnectionFactory.getInstance(function(stomp) {
    var queuesCreated = 0;
    usernames.forEach(function (username) {

        userQueueDeclarer.declareUserQueue(username, function(err, userQueue) {
            if(err) {
                console.log('****--::--> Error declaring userQueues');
                console.log('****--::--> Error declaring userQueues');
                console.log('****--::--> Error declaring userQueues');
                console.log('****--::--> Error declaring userQueues', err);
                process.exit(1);
            }

            queuesCreated += 1;
            console.log('%%%%=->> created O__) %d of %d for user %s', queuesCreated, usernames.length, username);

            userQueue.subscribe(function(msg){
                recvdMessages += 1;
                console.log('***-> received %d msgs in QUEUE: O___) %s . current msg ', recvdMessages, userQueue.name, 'data:', msg.data.toString());
            });

            if(queuesCreated === usernames.length) {
                console.log('####--> all queues created. Sending messages.-');
                var notificationController = new NotificationController();
                for (var i = 0; i < 2; i++) {
                    var type = 'onlineUser';
                    var notification = new Notification(type, JSON.stringify({user: 'linus.torvalds', date: new Date(), i: i}));

                    // fire and forget: new stomp connection created and closed after send.
                    notificationController.notify(notification, usernames, true, false); //notify to /exchange/user_alan.turing/user_alan.turing

                    // reusing connection, not closed after send.
                    notificationController.notifyUser(notification, usernames, true, true); //reusing connection: notify to /exchange/user_alan.turing/user_alan.turing
                }
            }
        });

    });

});
