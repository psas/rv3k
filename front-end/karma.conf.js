//jshint strict: false
module.exports = function(config) {
    config.set({

        basePath: './app',

        // generates the coverage
        reporters: ['progress', 'coverage'],

        preprocessors: {
            // source files, that you want to generate coverage for
            'controllers/*.js': ['coverage']
        },

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'components/*.js',
            'app.js',
            'controllers/*.js',
            'controllers/main-controller.js'
        ],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-coverage'
        ],

        //enables colors in the output
        colors: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        junitReporter: {
            outputFile: 'test/unit/unit.xml',
            suite: 'unit'
        },

        // configure the reporter
        // creates an html file in the shows the code coverage
        // the file is located where dir specifies 
        coverageReporter: {
            type: 'html',
            dir: 'tests/coverage'
        }
    });
};
