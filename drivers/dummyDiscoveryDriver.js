(function (){
    var dummyDiscoveryDriver = new AnyBoard.Driver({
        name: 'dummyDiscoveryDriver',
        description: 'custom driver for emulating scanning, connecting and disconnecting from tokens',
        dependencies: '',
        version: '0.1',
        date: '2015-09-08',
        type: ['dummyDiscoveryDriver'],
        compatibility: []
    });


    if(typeof hyper == 'undefined') {
        hyper = new Object();
        hyper.log = function (message) {
            var postMessage = JSON.stringify({'function': "HYPER", "data": message})
            window.parent.postMessage(postMessage, '*');
        };
    }



    dummyDiscoveryDriver._devices = {};


    dummyDiscoveryDriver.connect = function (token, win, fail) {
        console.log("connecting to " + token.name);
        if(token.name.toLowerCase() === "anypawn") {
            token.setDriver(AnyBoard.Drivers.get("dummyPawnDriver"));
        }
        else if(token.name.toLowerCase() ==="anyprint"){
            token.setDriver(AnyBoard.Drivers.get("dummyPrinterDriver"));

        }
        win && win(token);
        window.parent.postMessage(JSON.stringify( {'function': "CONNECT", 'tokenAddress': token.address}),'*');
    };

    dummyDiscoveryDriver.scan = function(win, fail){
        self = this;
        console.log("scanning");
        var address = Object.keys(AnyBoard.TokenManager.tokens).length;
        for(var i = 0; i<3; i++) {
            var device = {
                name: "anypawn",
                address: address.toString()
            };
            address ++;
            var token = self._initializeDummyToken(device);
            win && win(token)
        }
        var device = {
            name: "anyprint",
            address: address.toString()
        };
        var token = self._initializeDummyPrinter(device);
        win && win(token);

    }

    dummyDiscoveryDriver.disconnect = function(token){
        window.parent.postMessage(JSON.stringify( {'function': "DISCONNECT", 'tokenAddress': token.address}),'*');
    };

    dummyDiscoveryDriver._initializeDummyToken = function (device){
        AnyBoard.Logger.log('device found')
        var token = new AnyBoard.BaseToken(device.name, device.address, device, this);
        token.cache["GET_NAME"]=new Uint8Array([97, 110, 121, 80, 97, 119, 110 ]);
        token.cache["GET_VERSION"]=new Uint8Array([1]);
        token.cache["GET_UUID"]=new Uint8Array([0]);
        token.cache["HAS_LED"]=new Uint8Array([1]);
        token.cache["HAS_LED_COLOR"]=new Uint8Array([1]);
        token.cache["HAS_VIBRATION"]=new Uint8Array([1]);
        token.cache["HAS_COLOR_DETECTION"]=new Uint8Array([1]);
        token.cache["HAS_LED_SCREEN"]=new Uint8Array([1]);
        token.cache["HAS_RFID"]=new Uint8Array([0]);
        token.cache["HAS_NFC"]=new Uint8Array([0]);
        token.cache["HAS_ACCELEROMETER"]=new Uint8Array([1]);
        token.cache["HAS_TEMPERATURE"]=new Uint8Array([0]);
        token.cache["GET_BATTERY_STATUS"]=new Uint8Array([100]);
        this._devices[device.address] = token;
        return token;
    };

    dummyDiscoveryDriver._initializeDummyPrinter = function (device){
        AnyBoard.Logger.log('device found')
        var token = new AnyBoard.BaseToken(device.name, device.address, device, this);
        token.cache["GET_NAME"]="dummyPrinter";
        token.cache["GET_VERSION"]="1.0";
        token.cache["GET_UUID"]="FIX";
        token.cache["HAS_LED"]=[1];
        token.cache["HAS_LED_COLOR"]=1;
        token.cache["HAS_VIBRATION"]=1;
        token.cache["HAS_COLOR_DETECTION"]=0;
        token.cache["HAS_LED_SCREEN"]=0;
        token.cache["HAS_RFID"]=0;
        token.cache["HAS_NFC"]=0;
        token.cache["HAS_ACCELEROMETER"]=0;
        token.cache["HAS_TEMPERATURE"]=0;
        token.cache["GET_BATTERY_STATUS"]=100;
        token.printHistory = "";
        token.alignment="left";
        token.textSiz="medium";
        this._devices[device.address] = token;
        return token;
    };


    AnyBoard.TokenManager.setDriver(AnyBoard.Drivers.get('dummyDiscoveryDriver'));

})();