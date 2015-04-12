/* global define */

define(['jquery', 'backbone', 'views/home', 'src/scratch'], function ($, bb, HomeView, scratch) {

    var Router = bb.Router.extend({
        routes: {
            '': 'home',
            'scratch': scratch()
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
