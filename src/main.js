/* global requirejs */

requirejs.config({
    paths: {
        src: '.',
        lib: '../lib',
        views: '../views',
        templates: '../views/templates',
        jquery: '../vendor/jquery',
        backbone: '../vendor/backbone',
        underscore: '../vendor/underscore',
        jadeEngine: '../node_modules/jade/jade'
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

requirejs(['src/router'], function (router) {
    router.start();
});
