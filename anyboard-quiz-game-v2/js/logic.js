var logic = {
    initiate: function() {
        var handleTokenMove = function(token, constraint, options) {
            AnyBoard.Logger.log(token.player + " moved to tile " + constraint);
            token.player.location = constraint;

            logic.nextQuestion();

            // If the token is the only one, we will not expect any Token-Token events to occur before all (1) token
            // is placed on a tile. Therefore we check if the token is the only one, and trigger the TT-event manually
            // if it is
            if (logic.numberOfPlayers() === 1 && token.player.location === 2) {
                handleTokenTokenTouch(token, token);
            }
        };

        var handleTokenTokenTouch = function(initiatingToken, respondingToken, options) {
            if (respondingToken.player.location === 2) {
                hyper.log("handleTokenTokenTouch");
                initiatingToken.player.location = 2;
                if(logic.everyOneReady()) {
                    if (typeof d.currentQuestionPos === "undefined") ui.activatePanel('game');
                    else ui.nextQuestion();
                }
            }
        };

        logic.addListener("game", logic.startGame);
        logic.addListener("summary", ui.finishGame);

        AnyBoard.TokenManager.onTokenConstraintEvent("MOVE_TO", handleTokenMove);
        AnyBoard.TokenManager.onTokenTokenEvent("MOVE_NEXT_TO", handleTokenTokenTouch)

        var handleTokenTap = function(token){
            token.player.location = 3;
            logic.nextQuestion();
        };
        AnyBoard.TokenManager.onTokenEvent("TAP", handleTokenTap);

        var handleTokenDoubleTap = function(token){
            token.player.location = 4;
            logic.nextQuestion();
        };
        AnyBoard.TokenManager.onTokenEvent("DOUBLE_TAP", handleTokenDoubleTap);

        var handleTokenShake = function(token){
            token.player.location = 6;
            logic.nextQuestion();
        };
        AnyBoard.TokenManager.onTokenEvent("SHAKE", handleTokenShake);

        var handleTokenTilt = function(token){
            token.player.location = 7;
            logic.nextQuestion();
        };
        AnyBoard.TokenManager.onTokenEvent("TILT", handleTokenTilt);

        // logic.initGameState();
    },

    initGameState: function() {
        var nextPanelButtons = document.getElementsByClassName('activate-next-panel');
        nextPanelButtons[0].click();
        var tokenNumber=0;
        var anypawns = 0;
        var printer = false;
        var tokens = {};
        AnyBoard.TokenManager.scan(function(token){
            if(token.name.toLowerCase()==="anypawn" && anypawns <2) {
                logic.addDiscovered(token);
                tokens[tokenNumber] = token;
                tokenNumber++;
                anypawns++;
            }
            else if(token.name.toLowerCase()==="anyprint" && printer == false){
                logic.addDiscovered(token);
                tokens[tokenNumber]=token;
                tokenNumber++;
                printer = true;
            }
        },
            function(errorCode){
            hyper.log(errorCode);
        });
        tokens[0].connect();
        tokens[1].connect();
        tokens[2].connect();
        //GAME STATE 1
        nextPanelButtons[1].click();
        nextPanelButtons[2].click();
        logic.moveTokensToBlack();
        tokens[0].trigger("TAP",{"meta-eventType": "token"});
        //GAME STATE 2
        tokens[1].trigger("DOUBLE_TAP",{"meta-eventType": "token"});
        logic.moveTokensToBlack();
        tokens[0].trigger("MOVE_TO",{"meta-eventType": "token-constraint","constraint": 3});
        tokens[1].trigger("DOUBLE_TAP",{"meta-eventType": "token"});
        logic.moveTokensToBlack();
        tokens[0].trigger("SHAKE",{"meta-eventType": "token"});
        tokens[1].trigger("TILT",{"meta-eventType": "token"});
        logic.moveTokensToBlack()
        tokens[0].trigger("DOUBLE_TAP",{"meta-eventType": "token"});
        tokens[1].trigger("SHAKE",{"meta-eventType": "token"});
        logic.moveTokensToBlack();
        tokens[0].trigger("TILT",{"meta-eventType": "token"});
        //GAME STATE 3
        tokens[1].trigger("TAP",{"meta-eventType": "token"});
        logic.moveTokensToBlack();
        $("#printButton").click();
        //GAME STATE 4
    },

    moveTokensToBlack: function(){
        var tokenSet = AnyBoard.TokenManager.tokens;
        var isFirst = true;
        var firstToken;
        for(var key in tokenSet) {
            if (tokenSet[key].isConnected() && !tokenSet[key].driver.hasOwnProperty('print')) {
                if (isFirst) {
                    tokenSet[key].trigger("MOVE_TO",{"meta-eventType": "token-constraint","constraint": 2});
                    firstToken = tokenSet[key];
                    isFirst = false;
                }
                else{
                    tokenSet[key].trigger("MOVE_NEXT_TO",{"meta-eventType": "token-token","token": firstToken});
                }
            }
        }
    },

    // Discover bluetooth tokens in proximity
    discover: function() {
        var self = this;
        AnyBoard.TokenManager.scan(
            // success function to be executed upon _each_ token that is discovered
            function(token) {
                self.addDiscovered(token);
            },
            // function to be executed upon failure
            function(errorCode) {
                hyper.log(errorCode)
            }
        );
    },
    // Function to be executed upon having discovered a token
    addDiscovered: function(token) {
        if (!d.devices[token.address]) {
            d.devices[token.address] = token;

            // Add button for token to body
            $('#setup').append('<div class="token center"><button type="button" id="' + token.address +
            '" onclick="logic.connect(' + "'" + token.address + "'" +
            ')" class="grey token">' + token.name + ' </button>' +
            '<button class="player-icon' + '">&nbsp;</button>' + '</div>');

            // Add listener to be executed if the token connects
            token.on('connect', function() {
                if(token.driver.hasOwnProperty('print')){
                    $(document.getElementById(token.address)).next().addClass(token.color);
                    token.color = "yellow";
                    document.getElementById(token.address).className = 'yellow token';

                }
                else {
                    document.getElementById(token.address).className = 'green token';
                    token.color = d.colors.pop();
                    token.grid = d.grids.pop();
                    token.player = new AnyBoard.Player(
                        token.color + "-player",
                        {
                            "color": token.color,
                            "points": 0,
                            "locations": -1,
                            "token": token
                        }
                );
                    d.players.push(token.player);
                    token.id = token.player.name;
                    token.displayPattern(token.grid);

                }
                $(document.getElementById(token.address)).next().addClass(token.color);
                token.ledOn(token.color);
            });

            // Add listener to be executed if the token disconnects
            token.on('disconnect', function() {
                document.getElementById(token.address).className = 'grey token';
                $(document.getElementById(token.address)).next().removeClass(token.color);
                if(!token.driver.hasOwnProperty('print')) {
                    var playerIndex = d.players.indexOf(token.player);

                    if (playerIndex !== -1) {
                        d.players.splice(playerIndex, 1);
                    }
                    d.colors.push(token.color);
                    d.grids.push(token.grid);
                }
            })
        }

    },

    // Attempts to connect to token.
    connect: function(tokenAddress) {


        var token = d.devices[tokenAddress];

        // If already connecting, stop
        if (document.getElementById(tokenAddress).className.indexOf('blue') !== -1)
            return;

        // If already connected, disconnect
        if (document.getElementById(tokenAddress).className.indexOf('green') !== -1 || document.getElementById(tokenAddress).className.indexOf('yellow')!== -1) {
            token.disconnect();
            return;
        }
        // Signal that we're attempting to connect
        document.getElementById(tokenAddress).className = 'blue token';

        // Send connect command.
        token.connect();
    },

    startGame: function(){
        hyper.log("startGame");
        // d.questions = logic.shuffle(d.questions);
        d.currentQuestionPos = -1;
        ui.nextQuestion();
        for (var index in d.players) {
            if (d.players.hasOwnProperty(index))
                d.players[index].points = 0;
        }
    },

    nextQuestion: function(){
        if (logic.everyOneHasAnswered()) {
            ui.showAnswer();
            return;
        }
    },

    shuffle: function(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    addListener: function(name, callback) {
        if (!d.listeners[name])
            d.listeners[name] = [];
        d.listeners[name].push(callback);
    },

    trigger: function(name, options) {
        hyper.log("trigger: " + name);
        if (d.listeners[name]) {
            for (var i = d.listeners[name].length - 1; i >= 0; i--) {
                d.listeners[name][i](options);
            }
        }
    },

    getCurrentQuestion: function() {
        return d.questions[d.currentQuestionPos];
    },

    getNextQuestion: function() {
        hyper.log("nextQuestion");
        d.currentQuestionPos += 1;
        if (d.currentQuestionPos >= d.questions.length) {
            return undefined; // returns undefined if no more questions left
        }
        return d.questions[d.currentQuestionPos];
    },

    givePoints: function() {
        var question = logic.getCurrentQuestion();
        for (var key in d.players) {
            if (d.players.hasOwnProperty(key)) {
                var player = d.players[key];
                var answer = player.location;
                if (question.alternatives.hasOwnProperty(answer-3)) {
                    if (question.alternatives[answer-3].correct)
                        player.points += 1;
                }
            }
        }
    },

    everyOneHasAnswered: function() {
        var tokenSet = AnyBoard.TokenManager.tokens;
        for (var key in tokenSet) {
            if (tokenSet.hasOwnProperty(key) && tokenSet[key].isConnected()) {
                if (tokenSet[key].player && tokenSet[key].player.location < 3) {
                    return false;
                }
            }
        }
        return true;
    },

    everyOneReady: function() {
        var tokenSet = AnyBoard.TokenManager.tokens;
        for (var key in tokenSet) {
            if (tokenSet.hasOwnProperty(key) && tokenSet[key].isConnected()) {
                if (tokenSet[key].player && tokenSet[key].player.location !== 2) {
                    return false;
                }
            }
        }
        return true;
    },

    numberOfPlayers: function() {
        var tokenSet = AnyBoard.TokenManager.tokens;
        var numOfConnected = 0;
        for (var key in tokenSet) {
            if (tokenSet.hasOwnProperty(key) && tokenSet[key].isConnected() && !tokenSet[key].driver.hasOwnProperty('print')) numOfConnected += 1;
        }
        return numOfConnected;
    },

    printReceipt: function(){
        var tokenSet = AnyBoard.TokenManager.tokens
        for(var key in tokenSet){
            if(tokenSet[key].driver.hasOwnProperty('print')){
                var printString = "##L HOPE YOU HAD FUN!##f" +
                    "Results are as follows##f##f";
                for(var index in d.players){
                    printString+= d.players[index].name + " had " + d.players[index].points + " points##n"
                }
                tokenSet[key].print(printString);
                break;
            }
        }
    }
};