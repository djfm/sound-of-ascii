/* global define */

define([
        'views/view',
        'jade!templates/editor',
        'lib/song-generator'
    ], function (View, template, songGenerator) {
    return View.extend({
        initialize: function initializeEditorView () {
            this.template = template;
        },
        events: {
            'keyup .source-code': function onEditorTextareaKeyup (e) {
                var text = this.$(e.target).val().trim();
                if (text !== this.text) {
                    this.text = text;
                    this.onSourceChanged(this.text);
                }
            }
        },
        onSourceChanged: function onSourceChanged (text) {
            this.songGenerator = songGenerator();
            try {
                this.songGenerator.addSource(text);
                var song = this.songGenerator.buildPattern(
                    this.songGenerator.getSongPatternName()
                );
                this.displayCompiledSong(song);
                this.errorFeedback(null); // clear previous errors
            } catch (e) {
                this.errorFeedback(e);
                this.displayCompiledSong(null); // clear previous result
            }
        },
        errorFeedback: function errorFeedback (message) {
            if (!message) {
                this.$('.error-feedback').html('&nbsp;');
            } else {
                this.$('.error-feedback').html('<div>' + message + '</div>');
            }
        },
        displayCompiledSong: function displayCompiledSong (songPattern) {
            if (!songPattern) {
                this.$('.compiled-song').html('');
            } else {
                var text = songPattern.flatten().toString();
                this.$('.compiled-song').html(text);
            }
        }
    });
});
