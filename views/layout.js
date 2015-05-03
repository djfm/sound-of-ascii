/* global define */

define(['views/view', 'jade!templates/layout'], function (View, layoutTemplate) {
    return View.extend({
        initialize: function initializeLayoutView () {
            this.template = layoutTemplate;
        }
    });
});
