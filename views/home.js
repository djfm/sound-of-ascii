/* global define */

define(['views/view', 'jade!templates/home'], function (View, homeTemplate) {
    return View.extend({
        initialize: function initializeHomeView () {
            this.template = homeTemplate;
        },
        render: function renderHomeView () {
            this.el.innerHTML = this.template();

            return this;
        }
    });
});
