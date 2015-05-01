/* global requirejs */

requirejs.config({
    baseUrl: '/',
    paths: {
        backbone: 'vendor/backbone',
        underscore: 'vendor/underscore',
        jade: 'src/jade',
        jadeEngine: 'node_modules/jade/jade',
        jquery: 'src/jquery',
        templates: 'views/templates',
        chai: 'node_modules/chai/chai'
    }
});
