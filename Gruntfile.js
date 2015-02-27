/* jshint node:true */
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            dist: {
                options: {
                    plugins: [
                        new (require('less-plugin-autoprefix'))({
                            browsers: ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1", "ie >= 9"]
                        })
                    ]
                },
                files: [{
                    cwd: 'less/',
                    src: ['!_**', '**.less'],
                    dest: 'css/',
                    ext: '.css',
                    expand: true
                }]
            }
        },
        nunjucks: {
            templates: {
                baseDir: 'templates/',
                src: 'templates/**.nun',
                dest: 'js/templates.js',
                options: {
                    name: function (filename) {
                        return filename.replace((/\//g), '.').slice(0, -4);
                    }
                }
            }
        },
        watch: {
            styles: {
                files: ['less/**.less'],
                tasks: ['less'],
                options: {
                    interrupt: true
                }
            },
            templates: {
                files: ['templates/**'],
                tasks: ['nunjucks'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt);

    // Default task(s).
    grunt.registerTask('build', ['less', 'nunjucks']);
    grunt.registerTask('debug', ['build', 'watch']);

    grunt.registerTask('default', ['build']);
};