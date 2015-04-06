/* global define */

define(['jquery', 'backbone', 'views/home'], function ($, bb, HomeView) {

    var Router = bb.Router.extend({
        routes: {
            '': 'home'
        },
        home: function () {
            var homeView = new HomeView();
            $('body').html(homeView.render().el);
        }
    });

    return {
        start: function () {
            new Router();
            bb.history.start();
        }
    };
});
