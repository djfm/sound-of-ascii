/* global define */

define(['views/view', 'jade!templates/home'], function (View, homeTemplate) {
    return View.extend({
        initialize: function initializeHomeView () {
            this.template = homeTemplate;
        }
    });
});
