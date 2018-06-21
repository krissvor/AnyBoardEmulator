var tokens = {}
var currentToken = null;
var secondaryToken = null;
var moveTokenToTokenActive = false;
var frame;

/**
 * Init function meant to be utilized by the developer to reach a desired game state
 */
function initGameState(){



    /**Code required to progress through anyboard quiz game v2**/
    // var nextPanelButtons = frame.document.getElementsByClassName('activate-next-panel');
    // nextPanelButtons[0].click();
    // var discoverBluetooth = frame.document.getElementsByClassName("discover-bluetooth");
    // discoverBluetooth[0].click();
    // for(var i = 0; i<=1; i++){
    //     frame.AnyBoard.TokenManager.get(i).connect();
    // }
    // frame.AnyBoard.TokenManager.get(3).connect();
    // //GAME STATE 1
    // nextPanelButtons[1].click();
    // nextPanelButtons[2].click();
    // moveTokenToConstraint(0,2);
    // moveTokenToToken(1,0);
    // tapToken(1);
    // //GAME STATE 2
    // doubleTapToken(0);
    // moveTokenToConstraint(0,2);
    // moveTokenToToken(1,0);
    // moveTokenToConstraint(0,3);
    // doubleTapToken(1);
    // moveTokenToConstraint(0,2);
    // moveTokenToToken(1,0);
    // shakeToken(0);
    // tiltToken(1);
    // moveTokenToConstraint(0,2);
    // moveTokenToToken(1,0);
    // doubleTapToken(0);
    // shakeToken(1);
    // moveTokenToConstraint(0,2);
    // moveTokenToToken(1,0);
    // tiltToken(0);
    // //GAME STATE 3
    // tapToken(1);
    // moveTokenToConstraint(0,2);
    // moveTokenToToken(1,0);
    // frame.$("#printButton").click();
    // //GAME STATE 4
}

window.addEventListener("load", function() {
    window.addEventListener("message", receiveMessage);
    var iframe = document.getElementById("iframe");
    frame = iframe.contentWindow;
    iframe.addEventListener("load", function(){
        // initGameState();
    });
});

function choosePath() {
    var path = document.getElementById("folderPath").value + "/index.html";
    var iframe = document.getElementById("iframe");
    iframe.src = path;
    var eventLogger = document.getElementById("eventLog");
    eventLogger.addEventListener('change', function () {
        eventLogger.scrollTop = eventLogger.scrollHeight
    });
}
/**
 * Funtion that recieves messages from the game drivers contained within the iframe of the emulator.
 * @param message JSON string containing information regarding which action has been taken on which token, or what should be logged in which logger.
 */
function receiveMessage(message) {
    var action = JSON.parse(message.data);
    switch (action.function) {
        case("LED_ON"):
            handleLedChange(action);
            break;
        case("LED_OFF"):
            handleLedOff(action);
            break;
        case("LED_BLINK"):
            handleLedBlink(action);
            break;
        case("VIBRATE"):
            handleVibrate(action);
            break;
        case("DISPLAY_PATTERN"):
            handleDisplayPattern(action);
            break;
        case("HYPER"):
            hyperLog(action.data);
            break;
        case("CONNECT"):
            handleConnect(action);
            break;
        case("DISCONNECT"):
            handleDisConnect(action);
            break;
        case("PRINT_JUSTIFY"):
            printJustify(action);
            break;
        case("PRINT_SET_SIZE"):
            printSetSize(action);
            break;
        case("PRINT_WRITE"):
            printWrite(action);
            break;
        case("PRINT_FEED"):
            printFeed(action);
            break;
        case("PRINT_NEWLINE"):
            printNewLine(action);
            break;
    }
}

/**
 * Clears the hyperLogger
 */
function clearHyper(){
    var hyperLog = document.getElementById("hyperLog");
    hyperLog.innerText = "";
}

/**
 * Clears the evenLogger
 */
function clearEvent(){
    var eventLog = document.getElementById("eventLog");
    eventLog.innerText = "";
}

/**
 *
 * @param {string} event String to be appended to the eventLogger
 */
function logEvent(event){
    $("#eventLog").append(event);
}

/**
 * Prints message to hyperLogger, replacing functionality of Evothings hyper.log.
 * @param {string} data The message that should be logged in the event logger.
 */
function hyperLog(data){
    var hyperLogger = document.getElementById("hyperLog");
    hyperLogger.innerText += data.toString() + "\n";
    hyperLogger.scrollTop = hyperLogger.scrollHeight;
}

/**
 * Emulates printing to a printer.
 * @param action Message from driver containing information regarding which token should be printed to.
 */
function printNewLine(action){
    var printer = frame.AnyBoard.TokenManager.get(action.tokenAddress);
    printer.printHistory += "<br>";

}

/**
 * Emulates feeding a line to a printer
 * @param action Message from driver containing information regarding which token should be fed a line.
 */
function printFeed(action){
    var printer = frame.AnyBoard.TokenManager.get(action.tokenAddress);
    printer.printHistory += "<br>";
    logEvent("Fed line to Token" + action.tokenAddress + "<br>");

}

/**
 * Emulates printing to a printer
 * @param action Message from driver containing information regarding which token should be printed to, and what text should be printed.
 */
function printWrite(action){
    var printer = frame.AnyBoard.TokenManager.get(action.tokenAddress);
    var text = "";
    for(var i = 0; i<Object.keys(action.data).length; i++){
        text += String.fromCharCode(action.data[i]);
    }
    printer.printHistory += "<p style='text-align:" + printer.alignment + "; font-size:" + printer.textSize + "'>" + text + "</p>";
    logEvent("Printing on Token"+ action.tokenAddress + "<br>");
    if(currentToken && currentToken.address == action.tokenAddress){
        updateCurrentTokenInfo();
    }
}

/**
 * Sets the alignment of the printer
 * @param action Message from driver containing information regarding which alignement should be set to which token.
 */
function printJustify(action){
    var printer = frame.AnyBoard.TokenManager.get(action.tokenAddress);
    var letter = String.fromCharCode(action.data[0]);
    var event = "Print alignment on Token" + action.tokenAddress + " is set to ";
    if(letter==="l"){
        event += "left";
        printer.alignment = "left";
    }else if(letter==="c"){
        event += "center";
        printer.alignment = "center";
    }else if(letter==="r"){
        event+= "right";
        printer.alignment = "left";
    }
    // printer.printHistory += "*" + event + "*<br>";
   logEvent(event + "<br>");
}

/**
 * Sets the print size of the printer
 * @param action Message from driver containing information regarding which text size should be set on which token.
 */
function printSetSize(action){ var frame = document.getElementById("iframe").contentWindow;
    var printer = frame.AnyBoard.TokenManager.get(action.tokenAddress);
    var letter = String.fromCharCode(action.data[0]);
    printer.printSize = letter;
    var event = "Print size on Token" + action.tokenAddress + " is set to ";
    if(letter==="L"){
        event += "large";
        printer.textSize = "large";
    }else if(letter==="S"){
        event += "small";
        printer.textSize = "small";
    }else if(letter==="M"){
        event+= "medium";
        printer.textSize = "medium";

    }
   logEvent(event +" <br>");

}

/**
 * Logs connection to event log and loads connected token, receiving connect message from driver
 * @param action Message from driver, containing address of connected token
 */
function handleConnect(action){
   logEvent("Connected to Token" + action.tokenAddress +" <br>");
    loadConnectedTokens();
}

/**
 * Logs disconnect to event log, and loads connected tokens.
 * @param action Message from driver, containing address of connected token
 */
function handleDisConnect(action){
    logEvent("Disconnected from Token" + action.tokenAddress +" <br>");
    loadConnectedTokens();
}

/**
 * Logs to event log when a token has been vibrated
 * @param action Message from driver, containing address of vibrated token, and duration of vibration.
 */
function handleVibrate(action){
    logEvent("Vibrated Token" + action.tokenAddress + " for " +  action.data[0] + " seconds <br>");

}

/**
 * Logs to event log when a token has its display pattern changed and updates current token information if the token is selected in the interface.
 * @param action Message from driver, containing address of changed token, and the display pattern.
 */
function handleDisplayPattern(action){
    var changeToken = frame.AnyBoard.TokenManager.tokens[action.tokenAddress];
    changeToken.ledPattern = action.data;
    logEvent("Changed displayPattern on Token" + action.tokenAddress + "<br>");
    if(changeToken==currentToken){
        updateCurrentTokenInfo();
    }
}

/**
 * Logs to event log when a token has a change to its LED status, as well as updating the user interface
 * @param action Message from the driver, containing address of changed token, and new LED status.
 */
function handleLedChange(action){
    if(document.getElementById("token"+action.tokenAddress)) {
        var changeToken = frame.AnyBoard.TokenManager.tokens[action.tokenAddress];
        var rgb = action.data[0] + ',' + action.data[1] + ',' + action.data[2]
        changeToken.color = 'rgb(' + rgb + ')';
        var colorIndicator = document.getElementById("token" + action.tokenAddress + "color");
        colorIndicator.style.backgroundColor = changeToken.color;
        logEvent("Changed LED color on Token" + action.tokenAddress + " to RGB(" + rgb + ")<br>");
        updateCurrentTokenInfo();
    }
}

/**
 * Logs to event log when a tokens led has been switched off, as well as updating the user interface.
 * @param {JSONobject} {action} JSON object containing address of changed token token address and
 */

function handleLedOff(action){
    var changeToken = frame.AnyBoard.TokenManager.tokens[action.tokenAddress];
    changeToken.color = "rgb(0,0,0)"
    var colorIndicator = document.getElementById("token"+action.tokenAddress+"color");
    colorIndicator.style.backgroundColor = changeToken.color;
    logEvent("Turned off LED for Token" + action.tokenAddress + "<br>");
    updateCurrentTokenInfo();
}

/**
 * Logs to event logger when a tokens led is blinking.
 * @param {JSONobject} {action} JSON object containing token address, dureation of blinking and frequencyu of blinking.
 */
function handleLedBlink(action){
    var changeToken = frame.AnyBoard.TokenManager.tokens[action.tokenAddress];
    logEvent("Led on token" + changeToken.address + " blinked for " +  action.data[0] + " seconds with " + action.data[1] + " ms intervals." + "<br>");
}

/**
 * Retrieves currently selected token from the TokenManager. Updates current token information in the user interface, and prepares the token for interaction.
 */
function updateCurrentTokenInfo(){
    if(currentToken) {
        currentToken = frame.AnyBoard.TokenManager.tokens[currentToken.address];
        var nameCell = document.getElementById("currentName");
        nameCell.innerText = currentToken.name;
        var addressCell = document.getElementById("currentAddress");
        addressCell.innerText = currentToken.address;
        var colorCell = document.getElementById("currentColor");
        colorCell.innerText = currentToken.color;
        if (currentToken.name.toLowerCase() === "anypawn") {
            document.getElementById("currentIdTr").style.display = "";
            document.getElementById("currentSectorTr").style.display = "";
            document.getElementById("interactionButtons").style.display = "";
            var idCell = document.getElementById("currentId");
            idCell.innerText = currentToken.id;
            var sectorCell = document.getElementById("currentConstraint");
            sectorCell.innerText = currentToken.currentTile;
            document.getElementById("ledPatternDiv").style.display = "block";
            document.getElementById("printHistoryDiv").style.display = "none";
            drawLedPattern();
        }
        else if (currentToken.name.toLowerCase() === "anyprint") {
            document.getElementById("currentIdTr").style.display = "none";
            document.getElementById("currentSectorTr").style.display = "none";
            document.getElementById("ledPatternDiv").style.display = "none";
            document.getElementById("interactionButtons").style.display = "none";
            document.getElementById("printHistoryDiv").style.display = "block";
            var printHistory = document.getElementById("printHistory");
            printHistory.innerHTML = currentToken.printHistory;
            printHistory.scrollTop = printHistory.scrollHeight;
        }
    }
}

/**
 * Draws led pattern of current token on canvas in user interface
 */
function drawLedPattern(){
    var ledCanvas = document.getElementById("ledPatternCanvas");
    var context = ledCanvas.getContext("2d");
    context.clearRect(0, 0, ledCanvas.width, ledCanvas.height);

    for(var i = 0; i<= ledCanvas.height; i+= ledCanvas.height/8){
        context.moveTo(0, i);
        context.lineTo(ledCanvas.width,i);
        context.moveTo(i,0);
        context.lineTo(i,ledCanvas.height);
    }

    context.strokeStyle = "black";
    context.stroke();

    if(currentToken.displayPattern) {
        var displayPattern = currentToken.ledPattern;
        // for (var j = 0; j < displayPattern.size; j++) {
        for (j in displayPattern) {
            var line = displayPattern[j].toString(2);
            for(var k = 0; k <= line.length; k++){
                if(line[line.length-k]==="1"){
                    context.fillRect(ledCanvas.width - (k)*ledCanvas.width/8, j*ledCanvas.height/8, ledCanvas.width/8, ledCanvas.height/8);
                    context.stroke();
                }
            }
        }
    }
}

/**
 * Triggered when a token is selected in the user interface
 * Sets current token to selected token, so it can be executed user interactions on.
 * If the user interaction "move token to token" is active, the token that is selected to be moved next to a token will be moved next to this token.
 * @param {number} address Address of selected token
 */
function setCurrentToken(address){
    if(!moveTokenToTokenActive) {
        if(currentToken!=null) {
            $("#token" + currentToken.address).removeClass("btn-success");
        }
        currentToken = frame.AnyBoard.TokenManager.get(address);
        $("#token"+ address).addClass("btn-success");
        if (currentToken.name.toLowerCase() === "anypawn") {
            document.getElementById("interactionButtons").style.display = "";
        }else if(currentToken.name.toLowerCase() ==="anyprint"){
            document.getElementById("interactionButtons").style.display = "none";

        }
        updateCurrentTokenInfo();
    }else{
        moveTokenToToken(currentToken.address, address);
    }
}

/**
 * Triggers token-constraint event in driver. Can be given input from code, otherwise address and constraint will be retrieved from user interface.
 * @param {number} [address] *{optional}* Address of token that should be moved.
 * @param [number} [constraint] *{optional} Constraint that token should be moved to.
 */
function moveTokenToConstraint(address, constraint){
    if(!constraint){
       constraint =  document.getElementById("constraint").value;
    }
    if(Number.isInteger(Number(constraint))&& constraint!==""){
        constraint =  parseInt(constraint);
        if(Number.isInteger(address)){
            var token = frame.AnyBoard.TokenManager.get(address)
            token.driver.handleReceiveUpdateFromToken(token, new Uint8Array([194, constraint]));
            logEvent("Moved Token" + address + " to sector " + constraint + " <br>");

        }
        else {
            frame.AnyBoard.TokenManager.tokens[currentToken.address].driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([194, constraint]));
            logEvent("Moved Token" + currentToken.address + " to sector " + constraint + " <br>");
            updateCurrentTokenInfo();
        }
    }
    else{
        console.log("Constraint has to be integer");
    }
}

/**
 * Triggered from user interface. Deactivates and activates appropriate buttons.
 */
function toggleMoveTokenToToken(){
    if (moveTokenToTokenActive === false && currentToken != null) {
        moveTokenToTokenActive = true;
        $("#token" + currentToken.address).addClass("btn-danger").prop("disabled", true);
        $("#tokenTokenButton").addClass("btn-success");
    } else {
        moveTokenToTokenActive = false;
        $("#tokenTokenButton").removeClass("btn-success");
        $("#token" + currentToken.address).removeClass("btn-danger").prop("disabled", false);
    }
}


/**
 * Triggers token-token event in driver, simulating moving one token next to another, and logs to event logger.
 * @param {number} movingTokenAddress Address of token being moved.
 * @param {number} toTokenAddress Address of token being moved next to.
 */
function moveTokenToToken(movingTokenAddress, toTokenAddress) {
    if(Number.isInteger(movingTokenAddress) && Number.isInteger(toTokenAddress)) {
        var movingToken = frame.AnyBoard.TokenManager.get(movingTokenAddress);
        movingToken.driver.handleReceiveUpdateFromToken(movingToken, new Uint8Array([18, toTokenAddress]));
        logEvent("Moved Token" + movingToken.address + " next to Token" + toTokenAddress + "<br>");

    }
    else if(currentToken.address === movingTokenAddress) {
        currentToken.driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([18, toTokenAddress]));
        logEvent("Moved Token" + currentToken.address + " next to Token" + toTokenAddress + "<br>");
        $("#token"+currentToken.address).removeClass("btn-danger").prop("disabled", false).addClass("btn-positive");
        $("#tokenTokenButton").removeClass("btn-success");
        moveTokenToTokenActive = false;
        moveTokenToTokenActive = false;
        $("#tokenTokenButton").removeClass("btn-success");
        $("#token" + currentToken.address).removeClass("btn-danger").prop("disabled", false);
    }

}

/**
 * Triggers token event in driver, simulating a token being tapped, and log to event logger.
 * If no input parameters are given, they will be retrieved from user interface.
 * @param {number} [address] *{optional}* Address of token being tapped.
 */
function tapToken(address){
    if(Number.isInteger(Number(address))){
        var token = frame.AnyBoard.TokenManager.get(address)
        token.driver.handleReceiveUpdateFromToken(token, new Uint8Array([201]));
    }
    else if(address == null) {
       currentToken.driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([201]));
        logEvent("Tapped Token" + currentToken.address + "<br>");
    }
}


/**
 * Triggers token event in driver, simulating a token being double tapped, and logs to event logger.
 * If no input parameters are given, they will be retrieved from user interface.
 * @param {number} [address] *{optional}* Address of token being double tapped
 */
function doubleTapToken(address){
    if(Number.isInteger(Number(address))){
        var token = frame.AnyBoard.TokenManager.get(address)
        token.driver.handleReceiveUpdateFromToken(token, new Uint8Array([202]));
        // logEvent("Double tapped Token" + token.address + "<br>");
    }
    else if (address == null) {
        currentToken.driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([202]));
        logEvent("Double tapped Token" + currentToken.address + "<br>");
    }
}

/**
 * Triggers token event in driver, simulating a token being shaken, and logs to event logger.
 * If no input parameters are given, they will be retrieved from user interface.
 * @param {number} [address] *{optional} Address of token being shaken.
 */
function shakeToken(address){
    if(Number.isInteger(Number(address))){
        var token = frame.AnyBoard.TokenManager.get(address)
        token.driver.handleReceiveUpdateFromToken(token, new Uint8Array([203]));
        // logEvent("Shook Token" + token.address + "<br>");
    }
    else if (address == null) {
        currentToken.driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([203]));
        logEvent("Shook Token" + currentToken.address + "<br>");
    }

}

/**
 * Triggers token event in driver, simulating a token being tilted, and logs to event logger.
 * If no input parameters are given, they will be retrieved from user interface.
 * @param {number} [address] *{optional} Address of token being tilted.
 */
function tiltToken(address){
    if(Number.isInteger(Number(address))){
        var token = frame.AnyBoard.TokenManager.get(address)
        token.driver.handleReceiveUpdateFromToken(token, new Uint8Array([204]));
        // logEvent("Tilted Token" + token.address + "<br>");
    }
    else if (address == null) {
        currentToken.driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([204]));
        logEvent("Tilted Token" + currentToken.address + "<br>");
    }
}

/**
 * Triggers token event in driver, simulating a token being tilted, and logs to event logger.
 * If no input parameters are given, they will be retrieved from user interface.
 * @param {number} direction Direction of rotation 1=clockwise, 0=counter clockwise.
 * @param {number} [address] *{optional} Address of token being tilted.
 */
function rotateToken(direction, address){
    if(Number.isInteger(Number(address))){
        var token = frame.AnyBoard.TokenManager.get(address)
        token.driver.handleReceiveUpdateFromToken(token, new Uint8Array([220, direction]));
        if (direction === 0) {
            logEvent("Rotated Token" + token.address + " counter clockwise<br>");
        } else if (direction === 1) {
            logEvent("Rotated Token" + token.address + " clockwise<br>");
        }
    }
    else if (address == null) {
        currentToken.driver.handleReceiveUpdateFromToken(currentToken, new Uint8Array([220, direction]));
        if (direction === 0) {
            logEvent("Rotated Token" + currentToken.address + " counter clockwise<br>");
        } else if (direction === 1) {
            logEvent("Rotated Token" + currentToken.address + " clockwise<br>");
        }
    }
}

/**
 * Loads connected tokens from the game implementation and injects them with associated buttons into user interface.
 */
function loadConnectedTokens(){
    var connectedTokens = document.getElementById("connectedTokens");
    connectedTokens.innerHTML = "";
    tokens = frame.AnyBoard.TokenManager.tokens;
    for (var i = 0; i< Object.keys(tokens).length; i++) {
        var token = tokens[i];
        if (token.connected) {
            $("#connectedTokens").append('<button type="button" class="token btn" id="token' + token.address + '"  onclick="setCurrentToken(' + "'" + token.address + "'" + ')" class="grey">'
                + '<div><div class="colorIndicator" id="token' +  token.address + 'color" style="background-color:' + token.color + '"></div>' +token.name + + " " + token.address + '</div>' +
                ' </button>');
        }
    }
}