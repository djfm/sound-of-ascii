/* global define */

define(['underscore', 'backbone'], function (_, bb) {
    return bb.View.extend({
        initialize: function () {

        },
        render: function renderHomeView () {
            this.el.innerHTML = this.template(this.getRenderData());
            _.defer(this.afterRender.bind(this));
            return this;
        },
        getRenderData: function () {
            return {};
        },
        afterRender: function () {
            return this;
        }
    });
});
