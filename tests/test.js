
var assert = chai.assert;
function runMochaTests() {
    var lastFunction = ""
    mocha.run()
    describe('DummyDiscovery', function () {
        describe('scan()', function () {
            choosePath("tests");
        });
    });

    describe('DummyDiscovery', function () {
        describe('scan()', function () {
            it('should create four dummyPawns and one dummyPrint', function () {
                frame.AnyBoard.TokenManager.scan();
                var tokenSet = frame.AnyBoard.TokenManager.tokens;
                var numberOfTokens = 0;
                for (var key in tokenSet) {
                    numberOfTokens++;
                }
                var oldNumberOfTokens = numberOfTokens;
                frame.AnyBoard.TokenManager.scan();
                tokenSet = frame.AnyBoard.TokenManager.tokens;
                numberOfTokens = 0;
                for (var key in tokenSet) {
                    numberOfTokens++;
                }
                assert.equal(numberOfTokens - oldNumberOfTokens, 4);
            });
        });
        describe("connect()", function () {
            it("should connect to token with address 0", function () {
                frame.AnyBoard.TokenManager.get(0).connect();
                console.log(frame.AnyBoard.TokenManager.get(0).isConnected())
                assert.equal(frame.AnyBoard.TokenManager.get(0).isConnected(), true);
            })
        });
        describe("disconnect()", function () {
            it("should disconnect from token with address 0", function () {
                frame.AnyBoard.TokenManager.get(0).connect();
                console.log(frame.AnyBoard.TokenManager.get(0).isConnected())
                assert.equal(frame.AnyBoard.TokenManager.get(0).isConnected(), true);
            })
        });


    });


    describe('Emulator', function () {
        describe("tapToken()", function () {
            it("should tap the token", function () {
                frame.AnyBoard.TokenManager.get(0).connect();
                frame.AnyBoard.TokenManager.get(1).connect();
                frame.AnyBoard.TokenManager.get(0).on("TAP", function () {
                    lastFunction = "TAP";
                });
                tapToken(0)
                assert.equal(lastFunction, "TAP");
            })
        });
        describe("doubleTapToken()", function () {
            it("should double tap the token", function () {
                frame.AnyBoard.TokenManager.get(0).on("DOUBLE_TAP", function () {
                    lastFunction = "DOUBLETAP";
                });
                doubleTapToken(0);
                assert.equal(lastFunction, "DOUBLETAP");
            })
        });
        describe("tiltToken()", function () {
            it("should tilt the token", function () {
                frame.AnyBoard.TokenManager.get(0).on("TILT", function () {
                    lastFunction = "TILT";
                });
                tiltToken(0);
                assert.equal(lastFunction, "TILT");
            })
        });
        describe("shakeToken()", function () {
            it("should shake the token", function () {
                frame.AnyBoard.TokenManager.get(0).on("SHAKE", function () {
                    lastFunction = "SHAKE";
                });
                shakeToken(0)
                assert.equal(lastFunction, "SHAKE");
            })
        });
        describe("rotateToken(clockwise)", function () {
            it("should rotate the token clockwise", function () {
                frame.AnyBoard.TokenManager.get(0).on("ROTATE",
                    function (direction) {
                        if (direction.direction === 1) {
                            lastFunction = "ROTATECLOCKWISE";
                        }
                    });
                rotateToken(1, 0)
                assert.equal(lastFunction, "ROTATECLOCKWISE");
            })
        });

        describe("rotateToken(counter clockwise)", function () {
            it("should rotate the token counter clockwise", function () {
                frame.AnyBoard.TokenManager.get(0).on("ROTATE",
                    function (direction) {
                        if (direction.direction === 1) {
                            lastFunction = "ROTATECOUNTERCLOCKWISE";
                        }
                    });
                rotateToken(1, 0)
                assert.equal(lastFunction, "ROTATECOUNTERCLOCKWISE");
            })
        });
        describe("moveTokenToConstraint()", function () {
            it("should move the token to a constraint", function () {
                frame.AnyBoard.TokenManager.get(0).on("MOVE",
                    function (constraint) {
                        if (constraint.newTile === 3) {
                            lastFunction = "MOVETOCONSTRAINT";
                        }
                    });
                moveTokenToConstraint(0, 3);
                assert.equal(lastFunction, "MOVETOCONSTRAINT");
            })
        });
        describe("moveTokenToToken()", function () {
            it("should move the token to another token", function () {
                frame.AnyBoard.TokenManager.onTokenTokenEvent("MOVE_NEXT_TO",
                    function (initatingToken, respondingToken) {
                        if (respondingToken.address === "1") {
                            lastFunction = "MOVETOKENTOTOKEN";
                        }
                    });
                moveTokenToToken(0, 1);
                assert.equal(lastFunction, "MOVETOKENTOTOKEN");
            })
        });


    });
}