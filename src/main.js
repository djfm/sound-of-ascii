/* global requirejs */

requirejs.config({
    paths: {
        lib: '../lib',
        jquery: '../vendor/jquery',
        backbone: '../vendor/backbone',
        underscore: '../vendor/underscore'
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

requirejs(['jquery', 'backbone', 'lib/dummy'], function ($) {
    console.log($);
});

// TODO: IDEA: Use git for storage!!!
