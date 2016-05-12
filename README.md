Eyeos User Notification Library
===============================

## Overview

***eyeos-usernotification*** is a single-stop library for all the things you need for notifying connected users.

Functionalities:
* notify the user using her topic */topic/user_${principal_id}*
* notify the user using her queue */queue/user_${principal_id}*
* declare user queue and exchange

## How to use it

see code samples under [*src/samples/*](src/samples/):
* Sample on how to notify an user (over topic and queue) [*src/samples/NotifyUser.sample.js*](src/samples/NotifyUser.sample.js) 
* Sample on how to declare the user queue [*src/samples/DeclareUserQueue.sample.js*](src/samples/DeclareUserQueue.sample.js) 

## Quick help

* Install modules

```bash
	$ npm install
```

* Check tests

```bash
    $ ./tests.sh
```
