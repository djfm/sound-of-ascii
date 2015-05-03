/* global define */

define(['views/view', 'jade!templates/home', 'views/editor'], function (View, homeTemplate, EditorView) {
    return View.extend({
        initialize: function initializeHomeView () {
            this.template = homeTemplate;
        },
        getRenderData: function () {
            return {};
        },
        afterRender: function () {

            this.editorView = new EditorView({el: this.$('#main-view')});
            this.editorView.render();

            return this;
        }
    });
});
