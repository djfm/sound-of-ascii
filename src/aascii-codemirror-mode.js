/* global define */

define(['cm/lib/codemirror'], function (CodeMirror) {
    CodeMirror.defineMode('aascii', function (config) {

        function startState () {
            return {};
        }

        function token (stream) {

            if (stream.match(/^\s*#.*?$/)) {
                return 'comment';
            } else {
                stream.skipToEnd();
                return null;
            }
        }

        return {
            startState: startState,
            token: token
        };
    });
});
