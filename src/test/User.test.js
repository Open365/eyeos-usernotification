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

var assert = require("chai").assert;

var User = require('../lib/User');

var assertIsValidTopic = function (destination) {
    assert.match(destination, /\/topic\/user_/);
};

var assertIsValidExchange = function (destination) {
    assert.match(destination, /\/exchange\/user_/);
};

var assertUserDestinationNameIsOk = function (destination, username) {
    assert.include(destination, 'user_'+username);
};


suite('User', function () {
    var user, username;
    setup(function () {
        username = 'alan.turing';
        user = new User(username);
    });

    teardown(function () {
    });

    suite('#getDestinationName', function () {
        test('Should return topic if useExchange parameter not passed (backward compatibility)', function () {
            var destination = user.getDestinationName();
            assertIsValidTopic(destination);
        });

        test('Should return topic if useExchange parameter is falsy', function () {
            var falsyValues = [false, null, undefined, 0];
            falsyValues.forEach(function (value) {
                var destination = user.getDestinationName(value);
                assertIsValidTopic(destination);
            });

        });

        test('Should return queue if useExchange parameter is truthy', function () {
            var truthyValues = [true, 5, 1, {}, []];
            truthyValues.forEach(function (value) {
                var destination = user.getDestinationName(value);
                assertIsValidExchange(destination);
            });
        });
    });

    suite('#getTopicName', function () {
        test('Should return a valid topic', function () {
            var destination = user.getTopicName();
            assertIsValidTopic(destination);
            assertUserDestinationNameIsOk(destination, username);
        });
    });

    suite('#getExchangeName', function () {
        test('Should return a valid queue', function () {
            var destination = user.getExchangeName();
            assertIsValidExchange(destination);
            assertUserDestinationNameIsOk(destination, username);
        });
    });

});

module.exports.assertIsValidTopic = assertIsValidTopic;
module.exports.assertIsValidExchange = assertIsValidExchange;
module.exports.assertUserDestinationNameIsOk = assertUserDestinationNameIsOk;
