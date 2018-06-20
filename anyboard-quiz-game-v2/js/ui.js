var ui = {
    initiate: function() {
        $('.activate-next-panel').click(function(){
            $(this).parents('.panel').hide();
            $(this).parents('.panel').next().show();
            logic.trigger($(this).parents('.panel').next()[0].id);
        });
        $('.init-game').click(function(){
            ui.activatePanel('game-init');
        });
        $('.discover-bluetooth').click(function(){
            logic.discover();
        });

        $('.activate-question').click(function(){
            ui.nextQuestion();
        });
        $('.activate-answer').click(ui.showAnswer);
    },

    activatePanel: function(panelName) {
        $('.panel:visible').hide();
        $('.panel.panel-' + panelName).show();
        logic.trigger(panelName);
    },

    nextQuestion: function(){
        var question = logic.getNextQuestion();

        if (question) {
            $('.question-wrapper').remove();
            var alternativesHTML = "";
            var alternatives = question.alternatives;
            for (var i = 0; i < alternatives.length; i++) {
                alternativesHTML += '<p class="alternative ' + d.locations[i+3] + '">' +
                '    ' + alternatives[i].text +
                '<span style="float:right">' + d.userInteractions[i] + '' +
                '</span></p>'
            }
            $('#game').prepend("" +
                '<div class="question-wrapper">' +
                '<p class="question-text">' + question.question + '</p>' +
                alternativesHTML +
                '</div>'
            )
        } else {
            ui.activatePanel('summary');
        }
    },

    showAnswer: function() {
        var question = logic.getCurrentQuestion();
        logic.givePoints();
        $('.question-wrapper').remove();
        $('#game').prepend("" +
            '<div class="question-wrapper">' +
            '<p class="question-text">' + question.question + '</p>' +
            '<p class="answer">Answer: ' + question.answer + '</p>' +
            '<p class="game-instruction">Put your tokens back on black question tile when you\'re ready for the next question</p>' +
            '</div>'
        )
    },

    finishGame: function(){
        $('#summary .content').html('');
        $('#summary .content').prepend('<h4>Game over! - Results:</h4>');
        var playersHTML = "";
        for (var index in d.players) {
            playersHTML += '<div class="result"><button class="player-icon ' + d.players[index].color +
            '">&nbsp;</button>' + d.players[index].points + ' points</div>';
        }
        $('#summary .content').append(playersHTML)
        d.currentQuestionPos = undefined;
        var tokenSet = AnyBoard.TokenManager.tokens;
        for(var key in tokenSet){
            if(tokenSet[key].driver.hasOwnProperty('print')){
                var printHTML = '<div class="print"><button type="button" id="printButton" class="discover-bluetooth center" onclick="logic.printReceipt()"> Print receipt </button></div>';
                $('#summary .content').append(printHTML)
                break;
            }
        }
        //logic.print(token);
		//$('#summary .content').append('<button type="button">Print the rewards !</button>');
    }
};