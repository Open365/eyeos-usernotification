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

var NotificationMessageSender = function (stompConnectionFactory) {
    this.logger = log2out.getLogger("UserNotification");
    this.stompConnectionFactory = stompConnectionFactory || require('./StompConnectionFactory');
};

NotificationMessageSender.prototype.send = function(notificationMessages, reuseConnection, callback) {
    reuseConnection = reuseConnection === true;
    var self = this;
    var receiptsOngoing = [];
    var receiptsPending = notificationMessages.length;
    this.stompConnectionFactory.getInstance(function(connection) {
        var frame;
        self.logger.debug('Got connection (reuseConnection=%s). Stomp sending notification to %d users.', reuseConnection, notificationMessages.length);

        function receivedReceipt(receiptConfirmed){
            if (receiptsOngoing.indexOf(receiptConfirmed) >= 0) {
                receiptsPending --;
            }
            if (!receiptsPending) { //when all sent msgs are confirmed by receipts, disconnect
                self.stompConnectionFactory.releaseConnection(connection);
                connection.removeListener('receipt', receivedReceipt);
                if(callback) {
                    callback(null);
                }
            }
        }

        connection.on('receipt', receivedReceipt);
        connection.on('error', function (err) {
            self.logger.error("err: ", err);
        });

        for(var i=0;i<notificationMessages.length;i++) {
            var notificationMessage = notificationMessages[i];
            self.logger.debug('Sending to destination: ', notificationMessage.getDestination(), 'with data:', notificationMessage.getData());
            try {
                frame = connection.send({
                    destination: notificationMessage.getDestination(),
                    body: notificationMessage.getData()
                }, true);
                receiptsOngoing.push(frame.headers.receipt); //keep track of msgs sent receipts
            }
            catch (err) {
                self.logger.error("err: ", err);
            }
        }
    }, reuseConnection);
};


module.exports = NotificationMessageSender;
