/* global define */

define(['cm/lib/codemirror', 'lib/parser'], function (CodeMirror, parser) {
    CodeMirror.defineMode('aascii', function (config) {

        function startState () {
            return {};
        }

        function token (stream) {

            if (stream.sol()) {
                try {
                    parser.parseLine(stream.match(/^.*?$/, false)[0]);
                } catch (e) {
                    stream.skipToEnd();
                    return 'error';
                }
            }

            if (stream.eat(/[\[\](),]/)) {
                return 'bracket';
            } else if (stream.eat(/[\^.]/)) {
                return 'variable-2';
            } else if (stream.match(/^\s*#.*?$/)) {
                return 'comment';
            } else if (stream.match(/@\w+/)){
                return 'keyword';
            } else if (stream.match(/^\s*([^=]+)=/)) {
                stream.backUp(1);
                return 'def';
            } else if (stream.match(/^:(\w[\w\-]*)/)) {
                return 'atom';
            } else if (stream.match(/\d+/)) {
                return 'number';
            } else if (stream.match(/^([\w][\w\.'/#]*)/)) {
                return 'variable';
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
