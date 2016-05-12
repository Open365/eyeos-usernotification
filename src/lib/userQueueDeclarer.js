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

/**
 * declareUserQueue declares the user queue & exchange.
 *
 * As of June 2015, user notifications are being migrated from a Stomp topic: /topic/user_${username}
 * to AMQP Exchange + Queue in order to improve reliability of user notifications messaging.
 *
 * Note that Stomp clients can publish/subscribe to AMQP exchanges/queues
 */

var eyeosAmqp = require('eyeos-amqp');
var amqpConnectionFactory = eyeosAmqp.amqpConnectionFactory;
var AMQPDeclarer = eyeosAmqp.AMQPDeclarer;

var defaultSettings = require('./settings').amqp;

function getQueueDeclarationFor(username) {
    var destinationName = "user_" + username;
    return {
        queue: {
            name: destinationName,
                durable: true,
                exclusive: false,
                autoDelete: false
        },
        bindTo: [
            {
                exchangeName: destinationName,
                routingKey: '#',
                options: {
                    type: 'topic',
                    durable: true,
                    autoDelete: false
                }
            }
        ]
    };
}

function getAMQPDeclarerInstance(connection){
    return new AMQPDeclarer(connection);
}

function declareUserQueue(username, cb, newSettings) {
    var self = this;
    var settings = newSettings || defaultSettings;
    amqpConnectionFactory.getInstance(settings, function (error, connection){
        function callbackWithError(err) {
            connection.removeListener('error', callbackWithError);
            return cb(err);
        }

        if (error) return cb(error);

        connection.once('error', callbackWithError);

        var declarer = userQueueDeclarer.getAMQPDeclarerInstance(connection);
        var queueDeclaration = self.getQueueDeclarationFor(username);

        declarer.declare(queueDeclaration, function (err, queue) {
            connection.removeListener('error', callbackWithError);
            return cb(err, queue);
        });
    });
}

var userQueueDeclarer = {
    getQueueDeclarationFor: getQueueDeclarationFor,
    declareUserQueue: declareUserQueue,
    getAMQPDeclarerInstance: getAMQPDeclarerInstance
};

module.exports = userQueueDeclarer;
