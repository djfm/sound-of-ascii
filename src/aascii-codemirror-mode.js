/* global define */

define(['cm/lib/codemirror'], function (CodeMirror) {
    CodeMirror.defineMode('aascii', function (config) {

        function startState () {
            return {};
        }

        function token (stream) {
            if (stream.eat(/[\[\](),]/)) {
                return 'bracket';
            } else if (stream.match(/^\s*#.*?$/)) {
                return 'comment';
            } else if (stream.match(/@\w+/)){
                return 'keyword';
            } else if (stream.match(/^\s*([^=]+)=/)) {
                stream.backUp(1);
                return 'def';
            } else {
                stream.next();
                return null;
            }
        }

        return {
            startState: startState,
            token: token
        };
    });
});
