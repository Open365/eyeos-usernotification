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

'use strict';
var StompImplementation;
var settings = require('./settings').stomp;

var reusingConnection = false;
var connectionInstance = null;

function createConnectedStomp(settings, cb) {
    var Stomp = getStompConstructor();
    var connection = new Stomp(settings);

    connection.once('connected', function() {
        cb(connection);
    });

    connection.connect();
    return connection;
}

function getStompConnectionInstance(cb, reuseConnection) {
    function callbackWhenConnectionIsAvailable() {
        if (!reusingConnection) {
            reusingConnection = true;
            cb(connectionInstance);
        } else {
            setTimeout(callbackWhenConnectionIsAvailable);
        }
    }

    if (reuseConnection) {
        if (connectionInstance) {
            callbackWhenConnectionIsAvailable();
            return;
        } else {
            reusingConnection = true;
            connectionInstance = createConnectedStomp(settings, cb);
            return;
        }
    } else {
        createConnectedStomp(settings, cb);
        return;
    }
}

function reset() {
    reusingConnection = false;
    if (connectionInstance) {
        connectionInstance.disconnect();
        connectionInstance = null;
    }
}

function isReused(connection) {
    return connection === connectionInstance;
}

function releaseConnection(connection) {
    if (isReused(connection)) {
        reusingConnection = false;
    } else {
        connection.disconnect();
    }
}

function setStompConstructor(StompConstructor) {
    StompImplementation = StompConstructor;
}

function getStompConstructor() {
    return StompImplementation || require('eyeos-stomp').Stomp;
}

module.exports.getInstance = getStompConnectionInstance;
module.exports.releaseConnection = releaseConnection;
module.exports.reset = reset;
module.exports.setStompConstructor = setStompConstructor;
module.exports.getStompConstructor = getStompConstructor;