/**************************************************************************
 # 	NAME: AnyPawn dummy driver.js
 # 	AUTHOR: Kristian Svoren
 #
 **************************************************************************/

"use strict";

/*
 * AnyPawn-dummy-driver
 *
 * Driver for simulating communication with AnyBoard Token, AnyPawn
 *
 * Dependencies:
 *      AnyBoard (...)
 */

(function(){
    var dummyPawn = new AnyBoard.Driver({
        name: 'dummyPawnDriver',
        description: 'For dummy token',
        version: '1.0',
        date: '2018',
        type: ['dummy'],
        compatibility: [
            {
                characteristic_uuid: 'dummy',
                service_uuid: 'dummy'
            }
        ]
    });

    /**
     * Internal method that generates an executable function based on input parameters..
     * @param {string} name name of functionality. This is what will be used as cache entry, in logs, as well as sent to the emulator.
     * @param {number} functionId The integer representation of the function, which will be used to retrieve values from the cache. For instance, hasLed  is 64.
     * @param {boolean} [hasParams=false] Whether or not this function accepts data to be sent to the token.
     *      For instance, ledOn takes parameters for color, while ledOff does not.
     * @param {boolean} [useCache=false] Whether or not cache should be used in this function.
     *      If cache is used, the value will be retrieved from the cache instantiated in the discovery driver. Used for getting token name and functionality (not changing pr token)
     * @returns {Function} A function that can be called to retrieve the wanted information and/or send message to the emulator that an event has taken place
     * @private
     */

    dummyPawn.execute = function(name, functionId, hasParams, useCache){
        if(!hasParams){
            return function(token, data, win, fail){
                AnyBoard.Logger.debug("Executing " + name, token);
                if(useCache && token.cache[name]){
                    var array = new Uint8Array(1+token.cache[name].length);
                    array.set(new Uint8Array([functionId]));
                    array.set(token.cache[name], 1);
                    dummyPawn.handleReceiveUpdateFromToken(token, array);
                    var action = JSON.stringify( {'function': name, 'tokenAddress': token.address});
                    window.parent.postMessage(action, '*');
                    win && win(token.cache[name]);
                    return;
                }
                var action = JSON.stringify( {'function': name, 'tokenAddress': token.address});
                window.parent.postMessage(action, '*');
                if(win) {
                    win();
                }
            }
        }
        return function(token, data, win, fail){
            AnyBoard.Logger.debug("Executing " + name, token);

            if (useCache && token.cache.hasOwnProperty(name)) {
                win && win(token.cache[name]);
                return;
            }else if(useCache && !token.cache.hasOwnProperty(name)){
                fail && fail();
            }
            if( typeof data === "string"){
                data = new Uint8Array(dummyPawn.stringToUtf8(data));
            }
            if(data.buffer) {
                if(!(data instanceof Uint8Array)) {
                    data = new Uint8Array(data.buffer);
                }
            } else if(data instanceof ArrayBuffer) {
                data = new Uint8Array(data);
            } else {
                AnyBoard.Logger.warn("send data is not an ArrayBuffer.", this);
                fail();
                return;
            }
            if (data.length > 20) {
                AnyBoard.Logger.warn("cannot send data of length over 20.", this);
                fail();
                return;
            }

            var array = new Uint8Array(1+data.length);
            array.set(new Uint8Array([functionId]));
            array.set(data, 1);
            dummyPawn.handleReceiveUpdateFromToken(token, array);
            var action = JSON.stringify( {'function': name, 'tokenAddress': token.address, "data": data} );
            window.parent.postMessage(action, '*');
            if(win){
                win();
            };
        };
    };

    /* Internal mapping from commands to uint8 representations */
    dummyPawn._CMD_CODE = {
        MOVE: 194,
        PAPER_SELECT: 195,
        TTEVENT: 18,
        GET_NAME: 32,
        GET_VERSION: 33,
        GET_UUID: 34,
        GET_BATTERY_STATUS: 35,
        LED_OFF: 128,
        LED_ON: 129,
        LED_BLINK: 130,
        HAS_LED: 64,
        HAS_LED_COLOR: 65,
        HAS_VIBRATION: 66,
        HAS_COLOR_DETECTION: 67,
        HAS_LED_SCREEN: 68,
        HAS_RFID: 71,
        HAS_NFC: 72,
        HAS_ACCELEROMETER: 73,
        HAS_TEMPERATURE: 74,
        VIBRATE: 200,
        TAP: 201,
        DOUBLE_TAP: 202,
        SHAKE: 203,
        TILT: 204,
        COUNT: 205,
        ROTATE: 220,
        DISPLAY_PATTERN : 230,
        HAS_PRINT: 75,
    };

    /* Internal mapping between color strings to Uint8 array of RGB colors */
    dummyPawn._COLORS = {
        'red': new Uint8Array([255, 0, 0]),
        'green': new Uint8Array([0, 255, 0]),
        'blue': new Uint8Array([0, 0, 255]),
        'white': new Uint8Array([255, 255, 255]),
        'pink': new Uint8Array([255, 0, 255]),
        'yellow': new Uint8Array([255, 255, 0]),
        'aqua': new Uint8Array([0, 255, 255]),
        'off': new Uint8Array([0, 0, 0])
    };

    /* Internal mapping and generation of commands */
    var NO_PARAMS = false;
    var HAS_PARAMS = true;
    var USE_CACHE = true;
    dummyPawn._COMMANDS = {
        GET_NAME: dummyPawn.execute(
            "GET_NAME",
            dummyPawn._CMD_CODE.GET_NAME,
            NO_PARAMS,
            USE_CACHE),
        GET_VERSION: dummyPawn.execute(
            "GET_VERSION",
            dummyPawn._CMD_CODE.GET_VERSION,
            NO_PARAMS,
            USE_CACHE),
        GET_UUID: dummyPawn.execute(
            "GET_UUID",
            dummyPawn._CMD_CODE.GET_UUID,
            NO_PARAMS,
            USE_CACHE),
        GET_BATTERY_STATUS: dummyPawn.execute(
            "GET_BATTERY_STATUS",
            dummyPawn._CMD_CODE.GET_BATTERY_STATUS,
            NO_PARAMS,
            USE_CACHE),
        LED_OFF: dummyPawn.execute(
            "LED_OFF",
            dummyPawn._CMD_CODE.LED_OFF,
            NO_PARAMS),
        LED_ON: dummyPawn.execute(
            "LED_ON",
            dummyPawn._CMD_CODE.LED_ON,
            HAS_PARAMS),
        LED_BLINK: dummyPawn.execute(
            "LED_BLINK",
            dummyPawn._CMD_CODE.LED_BLINK,
            HAS_PARAMS),
        HAS_LED: dummyPawn.execute(
            "HAS_LED",
            dummyPawn._CMD_CODE.HAS_LED,
            NO_PARAMS,
            USE_CACHE),
        HAS_LED_COLOR: dummyPawn.execute(
            "HAS_LED_COLOR",
            dummyPawn._CMD_CODE.HAS_LED_COLOR,
            NO_PARAMS,
            USE_CACHE),
        HAS_VIBRATION: dummyPawn.execute(
            "HAS_VIBRATION",
            dummyPawn._CMD_CODE.HAS_VIBRATION,
            NO_PARAMS,
            USE_CACHE),
        HAS_COLOR_DETECTION: dummyPawn.execute(
            "HAS_COLOR_DETECTION",
            dummyPawn._CMD_CODE.HAS_COLOR_DETECTION,
            NO_PARAMS,
            USE_CACHE),
        HAS_LED_SCREEN: dummyPawn.execute(
            "HAS_LED_SCREEN",
            dummyPawn._CMD_CODE.HAS_LED_SCREEN,
            NO_PARAMS,
            USE_CACHE),
        HAS_RFID: dummyPawn.execute(
            "HAS_RFID",
            dummyPawn._CMD_CODE.HAS_RFID,
            NO_PARAMS,
            USE_CACHE),
        HAS_NFC: dummyPawn.execute(
            "HAS_NFC",
            dummyPawn._CMD_CODE.HAS_NFC,
            NO_PARAMS,
            USE_CACHE),
        HAS_ACCELEROMETER: dummyPawn.execute(
            "HAS_ACCELEROMETER",
            dummyPawn._CMD_CODE.HAS_ACCELEROMETER,
            NO_PARAMS,
            USE_CACHE),
        HAS_TEMPERATURE: dummyPawn.execute(
            "HAS_TEMPERATURE",
            dummyPawn._CMD_CODE.HAS_TEMPERATURE,
            NO_PARAMS,
            USE_CACHE),
        VIBRATE: dummyPawn.execute(
            "VIBRATE",
            dummyPawn._CMD_CODE.VIBRATE,
            HAS_PARAMS),
        COUNT: dummyPawn.execute(
            "COUNT",
            dummyPawn._CMD_CODE.COUNT,
            HAS_PARAMS),
        DISPLAY_PATTERN: dummyPawn.execute(
            "DISPLAY_PATTERN",
            dummyPawn._CMD_CODE.DISPLAY_PATTERN,
            HAS_PARAMS),
        PAPER_SELECT: dummyPawn.execute(
            "PAPER_SELECT",
            dummyPawn._CMD_CODE.PAPER_SELECT,
            HAS_PARAMS),
        HAS_PRINT: dummyPawn.execute(
            "HAS_PRINT",
            dummyPawn._CMD_CODE.HAS_PRINT,
            NO_PARAMS,
            USE_CACHE),
    };


    /**
     * Function triggered by the emulator to simulate receiving a signal from a physical token.
     * @param {Object} token Token which the simulated event has taken place on.
     * @param {Uint8Array} uint8array Array containing values representing the event taking place, mapped in _CMD_CODE, and any parameters that accompany the event.
     */
    dummyPawn.handleReceiveUpdateFromToken = function(token, uint8array) {
        var command = uint8array[0];
        var strData = "";

        switch (command) {
            case dummyPawn._CMD_CODE.GET_BATTERY_STATUS:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_BATTERY_STATUS', {"value": strData});
                break;
            case dummyPawn._CMD_CODE.MOVE:
                var currentTile = uint8array[1];
                var previousTile = uint8array[2];
                token.trigger('MOVE', {"value": currentTile, "newTile": currentTile, "oldTile": previousTile}); //this is the one in use
                token.trigger('MOVE_TO', {'meta-eventType': 'token-constraint' ,"constraint": currentTile});
                token.trigger('MOVE_FROM', {'meta-eventType': 'token-constraint' ,"constraint": previousTile});

                token.currentTile = currentTile;
                break;
            case dummyPawn._CMD_CODE.PAPER_SELECT:
                token.trigger('PAPER_SELECT');
                break;
            case dummyPawn._CMD_CODE.TTEVENT:
                token.trigger('MOVE_NEXT_TO', {'meta-eventType': 'token-token',"token": AnyBoard.TokenManager.get(uint8array[1])});
                break;
            case dummyPawn._CMD_CODE.GET_NAME:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_NAME', {"value": strData});
                break;
            case dummyPawn._CMD_CODE.GET_VERSION:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_VERSION', {"value": strData});
                break;
            case dummyPawn._CMD_CODE.GET_UUID:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_UUID', {"value": strData});
                break;
            case dummyPawn._CMD_CODE.LED_BLINK:
                token.trigger('LED_BLINK');
                break;
            case dummyPawn._CMD_CODE.LED_OFF:
                token.trigger('LED_OFF');
                break;
            case dummyPawn._CMD_CODE.LED_ON:
                token.trigger('LED_ON');
                break;
            case dummyPawn._CMD_CODE.HAS_LED:
                token.trigger('HAS_LED', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_LED_COLOR:
                token.trigger('HAS_LED_COLOR', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_VIBRATION:
                token.trigger('HAS_VIBRATION', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_COLOR_DETECTION:
                token.trigger('HAS_COLOR_DETECTION', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_LED_SCREEN:
                token.trigger('HAS_LED_SCREEN', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_RFID:
                token.trigger('HAS_RFID', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_NFC:
                token.trigger('HAS_NFC', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_ACCELEROMETER:
                token.trigger('HAS_ACCELEROMETER', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.HAS_TEMPERATURE:
                token.trigger('HAS_TEMPERATURE', {"value": uint8array[1]})
                break;
            case dummyPawn._CMD_CODE.VIBRATE:
                token.trigger('VIBRATE')
                break;
            case dummyPawn._CMD_CODE.COUNT:
                token.trigger('COUNT')
                break;
            case dummyPawn._CMD_CODE.DISPLAY_PATTERN:
                token.trigger('DISPLAY_PATTERN')
                break;
            case dummyPawn._CMD_CODE.TILT:
                token.trigger('TILT', {'meta-eventType': 'token'});
                break;
            case dummyPawn._CMD_CODE.TAP:
                token.trigger('TAP', {'meta-eventType': 'token'});
                break;
            case dummyPawn._CMD_CODE.DOUBLE_TAP:
                token.trigger('DOUBLE_TAP', {'meta-eventType': 'token'});
                break;
            case dummyPawn._CMD_CODE.SHAKE:
                token.trigger('SHAKE', {'meta-eventType': 'token'});
                break;
            case dummyPawn._CMD_CODE.ROTATE:
                var direction = uint8array[1];
                token.trigger('ROTATE', {'meta-eventType': 'token', 'direction' : direction});
                break;
            case dummyPawn._CMD_CODE.HAS_PRINT:
                token.trigger('HAS_PRINT', {"value": uint8array[1]});
                break;
            default:
                token.trigger('INVALID_DATA_RECEIVE', {"value": uint8array});
        }

        token.sendQueue.shift(); // Remove function from queue
        if (token.sendQueue.length > 0) {  // If there's more functions queued
            token.randomToken = Math.random();
            token.sendQueue[0]();  // Send next function off
        }
    };


    /*
     * The following set of functions utilize _COMMANDS to retrieve functions to execute.
     * @param token Token to execute on
     * @param win Success callback
     * @param fail Fail callback
     */
    dummyPawn.getName = function (token, win, fail) {
        this._COMMANDS.GET_NAME(token, win, fail);
    };

    dummyPawn.getVersion = function (token, win, fail) {
        this._COMMANDS.GET_VERSION(token, win, fail);
    };

    dummyPawn.getUUID = function (token, win, fail) {
        this._COMMANDS.GET_UUID(token, win, fail);
    };

    dummyPawn.hasLed = function(token, win, fail) {
        this._COMMANDS.HAS_LED(token, win, fail);
    };

    dummyPawn.hasLedColor = function(token, win, fail) {
        this._COMMANDS.HAS_LED_COLOR(token, win, fail);
    };

    dummyPawn.hasVibration = function(token, win, fail) {
        this._COMMANDS.HAS_VIBRATION(token, win, fail);
    };

    dummyPawn.hasColorDetection = function(token, win, fail) {
        this._COMMANDS.HAS_COLOR_DETECTION(token, win, fail);
    };

    dummyPawn.hasLedScreen = function(token, win, fail) {
        this._COMMANDS.HAS_LED_SCREEN(token, win, fail);
    };

    dummyPawn.hasRfid = function(token, win, fail) {
        this._COMMANDS.HAS_RFID(token, win, fail);
    };

    dummyPawn.hasNfc = function(token, win, fail) {
        this._COMMANDS.HAS_NFC(token, win, fail);
    };

    dummyPawn.hasAccelometer = function(token, win, fail) {
        this._COMMANDS.HAS_ACCELEROMETER(token, win, fail);
    };

    dummyPawn.hasTemperature = function(token, win, fail) {
        this._COMMANDS.HAS_TEMPERATURE(token, win, fail);
    };

    dummyPawn.ledOn = function (token, value, win, fail) {
        value = value || 'white';

        if (typeof value === 'string' && value in this._COLORS) {
            dummyPawn.ledOn(token, this._COLORS[value], win, fail);
        } else if ((Array.isArray(value) || value instanceof Uint8Array) && value.length === 3) {
            this._COMMANDS.LED_ON(token, new Uint8Array([value[0], value[1], value[2]]), win, fail);
        } else {
            fail && fail('Invalid or unsupported color parameters');
        }
    };

    dummyPawn.vibrate = function (token, value, win, fail) {
        this._COMMANDS.VIBRATE(token, new Uint8Array(value), win, fail);
    };

    dummyPawn.count = function (token, value, win, fail) {
        this._COMMANDS.COUNT(token, new Uint8Array(value), win, fail);
    };

    dummyPawn.displayPattern = function (token, pattern, win, fail) {
        this._COMMANDS.DISPLAY_PATTERN(token, new Uint8Array([pattern[0], pattern[1],  pattern[2], pattern[3],  pattern[4], pattern[5],  pattern[6], pattern[7]]), win, fail);
    };

    dummyPawn.paperSelect = function (token, paper, win, fail) {
        this._COMMANDS.PAPER_SELECT(token, new Uint8Array([paper]), win, fail);
    };

    dummyPawn.ledBlink = function (token, Time, Period, win, fail) {
        this._COMMANDS.LED_BLINK(token, new Uint8Array([Time, Period]), win, fail);
    };

    dummyPawn.ledOff = function (token, win, fail) {
        this._COMMANDS.LED_OFF(token, win, fail);
    };
    dummyPawn.hasPrint = function (token, win, fail) {
        COMMANDS.HAS_PRINT(token, win, fail);
    };

    /*
     * Taken from evothings ble. replaced unescape with decodeURI
     * @param data
     * @returns {Uint8Array}
     */

    dummyPawn.stringToUtf8 = function(data){
        var strUtf8 = decodeURI(encodeURIComponent(data));
        var ab = new Uint8Array(strUtf8.length);
        for (var i = 0; i < strUtf8.length; i++)
        {
            ab[i] = strUtf8.charCodeAt(i);
        }
        return ab;
    };

    /*
     * Has to be present in order for driver to be accepted by the baseToken
     */
    dummyPawn.send = function() {
    };

})();
