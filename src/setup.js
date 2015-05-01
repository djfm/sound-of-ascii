/* global requirejs */

requirejs.config({
    baseUrl: '/',
    paths: {
        backbone: 'node_modules/backbone/backbone-min',
        underscore: 'node_modules/underscore/underscore-min',
        jade: 'src/jade',
        jadeEngine: 'node_modules/jade/jade',
        jquery: 'src/jquery',
        q: 'node_modules/q/q',
        templates: 'views/templates',
        chai: 'node_modules/chai/chai'
    }
});
