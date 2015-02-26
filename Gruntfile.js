/* jshint node:true */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            dist: {
                files: [{
                    cwd: 'less/',
                    src: [ '!_**', '**.less' ],
                    dest: 'css/',
                    ext: '.css',
                    expand: true
                }]
            }
        },
        watch: {
            dist: {
                files: ['less/**.less'],
                tasks: [ 'less' ],
                options: {
                    spawn: false
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt);

    // Default task(s).
    grunt.registerTask('build', ['less']);
    grunt.registerTask('debug', ['build', 'watch']);

    grunt.registerTask('default', ['build']);
};