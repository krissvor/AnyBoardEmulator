'use strict'
module.exports = function (grunt) {
    grunt.initConfig({
        jsdoc2md: {
            separateOutputFilePerInput: {
                files: [
                    { src: 'drivers/dummyPawn.js', dest: '../document/dummyPawn.md' },
                    { src: 'js/emulator.js', dest: '../document/emulator.md' },
                    { src: 'drivers/dummyPrinter.js', dest: '../document/dummyPrinter.md' },
                    { src: 'drivers/dummyDiscoveryDriver.js', dest: '../document/discovery.md' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc-to-markdown')
    grunt.registerTask('default', 'jsdoc2md')
}