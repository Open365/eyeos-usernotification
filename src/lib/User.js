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

var User = function (principalId) {
    this.logger = log2out.getLogger("UserNotification");
    this.principalId = principalId;
};

User.prototype.getDestinationName = function(useExchange) {
    return useExchange ? this.getExchangeName() : this.getTopicName();
};

User.prototype.getTopicName = function() {
    return '/topic/user_' + this.principalId;
};

User.prototype.getExchangeName = function() {
    return '/exchange/user_' + this.principalId + '/user_' + this.principalId;
};

module.exports = User;