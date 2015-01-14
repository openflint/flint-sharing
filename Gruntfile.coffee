module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        browserify:
            sender:
                files:
                    'src/js/flint_sender_sdk.js': ['lib/sender/exports.coffee']
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']

        concat:
            sender:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, development. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'src/js/flint_sender_sdk.js'
                dest: 'src/js/flint_sender_sdk.js'

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-contrib-concat'

    grunt.registerTask 'default', ['browserify', 'concat']