/* global define */

define([
    'jquery',
    'backbone',
    'src/scratch',
    'views/editor',
    'views/home',
], function ($, bb, scratch, EditorView, HomeView) {

    var Router = bb.Router.extend({
        routes: {
            '': 'editor',
            'edit': 'editor',
            'home': 'home',
            'scratch': scratch()
        },
        mount: function mountView (name, ViewConstructor) {
            var view = this[name];

            var wasRestored = false;

            if (!view) {
                view = this[name] = new ViewConstructor();
                view.render();
                wasRestored = true;
            }

            $('#main-view').html(view.el);

            view.afterMount(wasRestored);
        },
        home: function () {
            this.mount('homeView', HomeView);
        },
        editor: function displayEditorView () {
            this.mount('editorView', EditorView);
        }
    });

    return {
        start: function () {
            new Router();
            bb.history.start();
        }
    };
});
