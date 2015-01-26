module.exports = (grunt) ->

    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        browserify:
            lib:
                files:
                    'release/js/lib/UdpSocket.js': ['lib/UdpSocket.coffee']
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-browserify'

    grunt.registerTask 'default', ['browserify']
