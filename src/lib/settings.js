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

var RABBIT_HOST = process.env.EYEOS_USR_NOTIF_RABBIT_HOST || 'rabbit.service.consul';
var RABBIT_USER = process.env.EYEOS_BUS_MASTER_USER || 'guest';
var RABBIT_PASSWORD = process.env.EYEOS_BUS_MASTER_PASSWD || 'somepassword';

var settings = {
    stomp: {
        host: RABBIT_HOST,
        port: 61613,
        login: RABBIT_USER,
        passcode: RABBIT_PASSWORD
    },
    amqp: {
        host: RABBIT_HOST,
        port: 5672,
        login: RABBIT_USER,
        password: RABBIT_PASSWORD
    }
};

module.exports = settings;
