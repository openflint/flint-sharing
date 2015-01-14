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

        uglify:
            sender:
                options: { mangle: true, compress: true }
                src: 'src/js/flint_sender_sdk.js'
                dest: 'src/js/flint_sender_sdk.min.js'

        concat:
            sender:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, development. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'src/js/flint_sender_sdk.js'
                dest: 'src/js/flint_sender_sdk.js'
            sender_prod:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, production. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'src/js/flint_sender_sdk.min.js'
                dest: 'src/js/flint_sender_sdk.min.js'

    # Load the plugin that provides the "coffee" task.

    # Load the plugin that provides the "uglify" task.
    # grunt.loadNpmTasks 'grunt-contrib-uglify'

    # Default task(s).
    # grunt.registerTask 'default', ['coffee', 'uglify']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-concat'

    grunt.registerTask 'default', ['browserify', 'uglify', 'concat']
