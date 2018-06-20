/**************************************************************************
 # 	NAME: dummyPrinter.js
 # 	AUTHOR: Kristian Svoren
 #	CONTRIBUTOR: Matthias Monnier
 #
 **************************************************************************/

"use strict";

/**************************************************************************
 # 	NAME: AnyPawn dummy driver.js
 # 	AUTHOR: Kristian Svoren
 #
 **************************************************************************/

"use strict";

/*
 * printer-dummy-driver
 *
 * Driver for simulating communication with AnyBoard printer.
 *
 * Dependencies:
 *      AnyBoard (...)
 */

(function(){
    var dummyPrinter = new AnyBoard.Driver({
        name: 'dummyPrinterDriver',
        description: 'For dummy token',
        version: '0.1',
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

    dummyPrinter.execute = function(name, functionId, hasParams, useCache){
        if(!hasParams){
            return function(token, data, win, fail){
                AnyBoard.Logger.debug("Executing " + name, token);
                if(useCache && token.cache.hasOwnProperty(name)){
                    var array = new Uint8Array(1+token.cache[name].length);
                    array.set(new Uint8Array([functionId]));
                    array.set(new Uint8Array[token.cache[name]], 1);
                    dummyPrinter.handleReceiveUpdateFromToken(token, array);
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
                data = new Uint8Array(dummyPrinter.stringToUtf8(data));
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
            if (data.length > 20 && name !== "PRINT_WRITE") {
                AnyBoard.Logger.warn("cannot send data of length over 20.", this);
                fail();
                return;
            }

            var array = new Uint8Array(1+data.length);
            array.set(new Uint8Array([functionId]));
            array.set(data, 1);
            dummyPrinter.handleReceiveUpdateFromToken(token, array);
            var action = JSON.stringify( {'function': name, 'tokenAddress': token.address, "data": data} );
            window.parent.postMessage(action, '*');
            if(win){
                win();
            };
        };
    };

    /* Internal mapping from commands to uint8 representations */
    dummyPrinter._CMD_CODE = {
        MOVE: 194,
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
        HAS_PRINT: 75,
        PRINT_FEED: 137,
        PRINT_JUSTIFY: 138,
        PRINT_SET_SIZE: 139,
        PRINT_WRITE: 140,
        PRINT_NEWLINE: 141
    };

    /* Internal mapping between color strings to Uint8 array of RGB colors */
    dummyPrinter._COLORS = {
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
    dummyPrinter._COMMANDS = {
        GET_NAME: dummyPrinter.execute(
            "GET_NAME",
            dummyPrinter._CMD_CODE.GET_NAME,
            NO_PARAMS,
            USE_CACHE),
        GET_VERSION: dummyPrinter.execute(
            "GET_VERSION",
            dummyPrinter._CMD_CODE.GET_VERSION,
            NO_PARAMS,
            USE_CACHE),
        GET_UUID: dummyPrinter.execute(
            "GET_UUID",
            dummyPrinter._CMD_CODE.GET_UUID,
            NO_PARAMS,
            USE_CACHE),
        GET_BATTERY_STATUS: dummyPrinter.execute(
            "GET_BATTERY_STATUS",
            dummyPrinter._CMD_CODE.GET_BATTERY_STATUS,
            NO_PARAMS,
            USE_CACHE),
        LED_OFF: dummyPrinter.execute(
            "LED_OFF",
            dummyPrinter._CMD_CODE.LED_OFF,
            NO_PARAMS),
        LED_ON: dummyPrinter.execute(
            "LED_ON",
            dummyPrinter._CMD_CODE.LED_ON,
            HAS_PARAMS),
        LED_BLINK: dummyPrinter.execute(
            "LED_BLINK",
            dummyPrinter._CMD_CODE.LED_BLINK,
            HAS_PARAMS),
        HAS_LED: dummyPrinter.execute(
            "HAS_LED",
            dummyPrinter._CMD_CODE.HAS_LED,
            NO_PARAMS,
            USE_CACHE),
        HAS_LED_COLOR: dummyPrinter.execute(
            "HAS_LED_COLOR",
            dummyPrinter._CMD_CODE.HAS_LED_COLOR,
            NO_PARAMS,
            USE_CACHE),
        HAS_VIBRATION: dummyPrinter.execute(
            "HAS_VIBRATION",
            dummyPrinter._CMD_CODE.HAS_VIBRATION,
            NO_PARAMS,
            USE_CACHE),
        HAS_COLOR_DETECTION: dummyPrinter.execute(
            "HAS_COLOR_DETECTION",
            dummyPrinter._CMD_CODE.HAS_COLOR_DETECTION,
            NO_PARAMS,
            USE_CACHE),
        HAS_LED_SCREEN: dummyPrinter.execute(
            "HAS_LED_SCREEN",
            dummyPrinter._CMD_CODE.HAS_LED_SCREEN,
            NO_PARAMS,
            USE_CACHE),
        HAS_RFID: dummyPrinter.execute(
            "HAS_RFID",
            dummyPrinter._CMD_CODE.HAS_RFID,
            NO_PARAMS,
            USE_CACHE),
        HAS_NFC: dummyPrinter.execute(
            "HAS_NFC",
            dummyPrinter._CMD_CODE.HAS_NFC,
            NO_PARAMS,
            USE_CACHE),
        HAS_ACCELEROMETER: dummyPrinter.execute(
            "HAS_ACCELEROMETER",
            dummyPrinter._CMD_CODE.HAS_ACCELEROMETER,
            NO_PARAMS,
            USE_CACHE),
        HAS_TEMPERATURE: dummyPrinter.execute(
            "HAS_TEMPERATURE",
            dummyPrinter._CMD_CODE.HAS_TEMPERATURE,
            NO_PARAMS,
            USE_CACHE),
        HAS_PRINT: dummyPrinter.execute(
            "HAS_PRINT",
            dummyPrinter._CMD_CODE.HAS_PRINT,
            NO_PARAMS,
            USE_CACHE),
        PRINT_FEED: dummyPrinter.execute(
            "PRINT_FEED",
            dummyPrinter._CMD_CODE.PRINT_FEED,
            NO_PARAMS),
        PRINT_JUSTIFY: dummyPrinter.execute(
            "PRINT_JUSTIFY",
            dummyPrinter._CMD_CODE.PRINT_JUSTIFY,
            HAS_PARAMS),
        PRINT_SET_SIZE: dummyPrinter.execute(
            "PRINT_SET_SIZE",
            dummyPrinter._CMD_CODE.PRINT_SET_SIZE,
            HAS_PARAMS),
        PRINT_WRITE: dummyPrinter.execute(
            "PRINT_WRITE",
            dummyPrinter._CMD_CODE.PRINT_WRITE,
            HAS_PARAMS),
        PRINT_NEWLINE: dummyPrinter.execute(
            "PRINT_NEWLINE",
            dummyPrinter._CMD_CODE.PRINT_NEWLINE,
            NO_PARAMS)
    };


    /**
     * Function triggered by the emulator so simulate receiving a signal from a physical token.
     * @param token Token which the simulated event has taken place on.
     * @param uint8array Array containing values representing the event taking place, mapped in _CMD_CODE, and any parameters that accompany the event.
     */
    dummyPrinter.handleReceiveUpdateFromToken = function(token, uint8array) {
        var command = uint8array[0];
        var strData = "";

        switch (command) {
            case dummyPrinter._CMD_CODE.GET_BATTERY_STATUS:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_BATTERY_STATUS', {"value": strData});
                break;
            case dummyPrinter._CMD_CODE.MOVE:
                var currentTile = uint8array[1];
                var previousTile = uint8array[2];
                token.trigger('MOVE', {"value": currentTile, "newTile": currentTile, "oldTile": previousTile}); //this is the one in use
                token.trigger('MOVE_TO', {'meta-eventType': 'token-constraint' ,"constraint": currentTile});
                token.trigger('MOVE_FROM', {'meta-eventType': 'token-constraint' ,"constraint": previousTile});

                token.currentTile = currentTile;
                break;
            case dummyPrinter._CMD_CODE.GET_NAME:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_NAME', {"value": strData});
                break;
            case dummyPrinter._CMD_CODE.GET_VERSION:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_VERSION', {"value": strData});
                break;
            case dummyPrinter._CMD_CODE.GET_UUID:
                for (var i = 1; i < uint8array.length; i++)
                    strData += String.fromCharCode(uint8array[i])
                token.trigger('GET_UUID', {"value": strData});
                break;
            case dummyPrinter._CMD_CODE.LED_BLINK:
                token.trigger('LED_BLINK');
                break;
            case dummyPrinter._CMD_CODE.LED_OFF:
                token.trigger('LED_OFF');
                break;
            case dummyPrinter._CMD_CODE.LED_ON:
                token.trigger('LED_ON');
                break;
            case dummyPrinter._CMD_CODE.HAS_LED:
                token.trigger('HAS_LED', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_LED_COLOR:
                token.trigger('HAS_LED_COLOR', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_VIBRATION:
                token.trigger('HAS_VIBRATION', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_COLOR_DETECTION:
                token.trigger('HAS_COLOR_DETECTION', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_LED_SCREEN:
                token.trigger('HAS_LED_SCREEN', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_RFID:
                token.trigger('HAS_RFID', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_NFC:
                token.trigger('HAS_NFC', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_ACCELEROMETER:
                token.trigger('HAS_ACCELEROMETER', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_TEMPERATURE:
                token.trigger('HAS_TEMPERATURE', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.HAS_PRINT:
                token.trigger('HAS_PRINT', {"value": uint8array[1]});
                break;
            case dummyPrinter._CMD_CODE.PRINT_FEED:
                token.trigger('PRINT_FEED');
                break;
            case dummyPrinter._CMD_CODE.PRINT_JUSTIFY:
                token.trigger('PRINT_JUSTIFY');
                break;
            case dummyPrinter._CMD_CODE.PRINT_SET_SIZE:
                token.trigger('PRINT_SET_SIZE');
                break;
            case dummyPrinter._CMD_CODE.PRINT_WRITE:
                token.trigger('PRINT_WRITE');
                break;
            case dummyPrinter._CMD_CODE.PRINT_NEWLINE:
                token.trigger('PRINT_NEWLINE');
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


    /**
     * The following set of functions utilize _COMMANDS to retrieve functions to execute.
     * @param token Token to execute on
     * @param win Success callback
     * @param fail Fail callback
     */
    dummyPrinter.getName = function (token, win, fail) {
        this._COMMANDS.GET_NAME(token, win, fail);
    };

    dummyPrinter.getVersion = function (token, win, fail) {
        this._COMMANDS.GET_VERSION(token, win, fail);
    };

    dummyPrinter.getUUID = function (token, win, fail) {
        this._COMMANDS.GET_UUID(token, win, fail);
    };

    dummyPrinter.hasLed = function(token, win, fail) {
        this._COMMANDS.HAS_LED(token, win, fail);
    };

    dummyPrinter.hasLedColor = function(token, win, fail) {
        this._COMMANDS.HAS_LED_COLOR(token, win, fail);
    };

    dummyPrinter.hasVibration = function(token, win, fail) {
        this._COMMANDS.HAS_VIBRATION(token, win, fail);
    };

    dummyPrinter.hasColorDetection = function(token, win, fail) {
        this._COMMANDS.HAS_COLOR_DETECTION(token, win, fail);
    };

    dummyPrinter.hasLedScreen = function(token, win, fail) {
        this._COMMANDS.HAS_LED_SCREEN(token, win, fail);
    };

    dummyPrinter.hasRfid = function(token, win, fail) {
        this._COMMANDS.HAS_RFID(token, win, fail);
    };

    dummyPrinter.hasNfc = function(token, win, fail) {
        this._COMMANDS.HAS_NFC(token, win, fail);
    };

    dummyPrinter.hasAccelometer = function(token, win, fail) {
        this._COMMANDS.HAS_ACCELEROMETER(token, win, fail);
    };

    dummyPrinter.hasTemperature = function(token, win, fail) {
        this._COMMANDS.HAS_TEMPERATURE(token, win, fail);
    };

    dummyPrinter.ledOn = function (token, value, win, fail) {
        value = value || 'white';

        if (typeof value === 'string' && value in this._COLORS) {
            dummyPrinter.ledOn(token, this._COLORS[value], win, fail);
        } else if ((Array.isArray(value) || value instanceof Uint8Array) && value.length === 3) {
            this._COMMANDS.LED_ON(token, new Uint8Array([value[0], value[1], value[2]]), win, fail);
        } else {
            fail && fail('Invalid or unsupported color parameters');
        }
    };

    dummyPrinter.ledBlink = function (token, Time, Period, win, fail) {
        this._COMMANDS.LED_BLINK(token, new Uint8Array([Time, Period]), win, fail);
    };

    dummyPrinter.ledOff = function (token, win, fail) {
        this._COMMANDS.LED_OFF(token, win, fail);
    };
    dummyPrinter.hasPrint = function (token, win, fail) {
        COMMANDS.HAS_PRINT(token, win, fail);
    };

    dummyPrinter.print = function (token, string, win, fail) {

        // If we're already printing, try again later
        if (token._isPrinting) {
            setTimeout(
                function(){dummyPrinter.print(token, string, win, fail)}
                , 3000
            );
            return;
        }

        // Say that we're printing
        token._isPrinting = true;

        /* string sequences that mark some special functionality */
        var commands = {
            "##l": function() { dummyPrinter._COMMANDS.PRINT_JUSTIFY(token, 'l')} ,
            "##c": function() { dummyPrinter._COMMANDS.PRINT_JUSTIFY(token, 'c')} ,
            "##r": function() { dummyPrinter._COMMANDS.PRINT_JUSTIFY(token, 'r')} ,
            "##L": function() { dummyPrinter._COMMANDS.PRINT_SET_SIZE(token, 'L')} ,
            "##S": function() { dummyPrinter._COMMANDS.PRINT_SET_SIZE(token, 'S')} ,
            "##M": function() { dummyPrinter._COMMANDS.PRINT_SET_SIZE(token, 'M')} ,
            "##f": function() { dummyPrinter._COMMANDS.PRINT_FEED(token)},
            "##n": function() { dummyPrinter._COMMANDS.PRINT_NEWLINE(token)}
        };

        /* Recursive function that executes the first designated print command in from the print string  */
        var printPartial = function(incomingString) {

            // If there's nothing left, we're done printing and can return
            if (!incomingString) {
                token._isPrinting = false;
                win && win();
                return;
            }

            var remains = "";
            var command;
            var sleep = 800;

            var firstpos = incomingString.indexOf("##");

            // If no commands in string, print the first 12 chars and call printPartal with remaining chars
            if (firstpos === -1) {
                dummyPrinter._COMMANDS.PRINT_WRITE(token, incomingString);
            }
            // Else if there is a command, but not first, print up until and call itself again with what remains
            else if (firstpos !== 0) {
                dummyPrinter._COMMANDS.PRINT_WRITE(token, incomingString.substr(0, firstpos));
                remains = incomingString.substr(firstpos);
            }
            // Else (there is a command at the start), run command and then call itself with what remains
            else {
                command = incomingString.substr(0, 3);
                remains = incomingString.substr(3);
                if (command in commands) {
                    commands[command]();
                }
            }
            printPartial(remains);
        };

        printPartial(string);
    };

    /**
     * Taken from evothings ble. replaced unescape with decodeURI
     * @param data
     * @returns {Uint8Array}
     */

    dummyPrinter.stringToUtf8 = function(data){
        var strUtf8 = decodeURI(encodeURIComponent(data));
        var ab = new Uint8Array(strUtf8.length);
        for (var i = 0; i < strUtf8.length; i++)
        {
            ab[i] = strUtf8.charCodeAt(i);
        }
        return ab;
    };

    /**
     * Has to be present in order for driver to be accepted by the baseToken
     */
    dummyPrinter.send = function() {
    };

})();
