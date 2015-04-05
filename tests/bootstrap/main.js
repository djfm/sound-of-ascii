/* global requirejs */

requirejs.config({
    baseUrl: '../src',
    paths: {
        tests: '../tests/tests',
        lib: '../lib',
        jquery: '../vendor/jquery',
        backbone: '../vendor/backbone',
        underscore: '../vendor/underscore',
        mocha: '../node_modules/mocha/mocha',
        chai: '../node_modules/chai/chai',
    },
    map: {
        '*': {
            jquery: 'jquery-private'
        },
        'jquery-private': {
            jquery: 'jquery'
        }
    }
});

/* global mocha */
requirejs(['chai', 'mocha'], function (chai) {
    chai.should();
    mocha.setup('bdd');

    requirejs(['tests/pattern'], function () {
        mocha.run();
    });
});
