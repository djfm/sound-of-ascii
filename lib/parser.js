/* global define */

define(['underscore', 'lib/solfege'], function (_, solfege) {

    function tokenizePatternDefinitionRHS (str) {

        var forms = [
            {regExp: new RegExp('^(' + solfege.getNoteExp().replace(/[()]/g,'') + ')'), type: 'note'},
            {regExp: /^(\s+)/, type: null},
            {regExp: /^(\[)/, type: 'open-square'},
            {regExp: /^(\])/, type: 'close-square'},
            {regExp: /^(,)/, type: 'comma'},
            {regExp: /^(\^)/, type: 'sustain'},
            {regExp: /^:(\w+)/, type: 'track-name'},
            {regExp: /^([\w.][\w\.'/#]*)/, type: 'identifier'}
        ];

        var tokens = [];

        while (str.length > 0) {
            var found = false;
            for (var f = 0, len = forms.length; f < len; ++f) {
                var form = forms[f];
                var match = form.regExp.exec(str);
                if (match) {
                    found = true;
                    var token = match[1];
                    /* jshint maxdepth:4 */
                    if (null !== form.type) {
                        tokens.push({
                            type: form.type,
                            value: token
                        });
                    }
                    str = str.substr(match[0].length);
                    break;
                }
            }
            if (!found) {
                throw new Error('Invalid token at: ' + str);
            }
        }

        return tokens;
    }

    function parsePatternDefinitionRHS (tokenList) {
        var lists = [];
        var rhs;
        var processed = [];
        var currentTrackName = null;

        function newList (type) {
            var list = {
                type: type,
                value: [],
                sustain: 1,
                trackName: currentTrackName
            };

            if (inList()) {
                lists[lists.length - 1].value.push(list);
            }

            lists.push(list);
        }

        function increaseSustain () {
            if (!inList()) {
                throw new Error('Cannot increase the sustain of an undefined pattern.');
            }
            var currentList = lists[lists.length - 1];
            ++currentList.value[currentList.value.length - 1].sustain;
        }

        function inList (type) {
            return (lists.length > 0) && (undefined === type || lists[lists.length - 1].type === type);
        }

        function endList (type) {
            currentTrackName = null;
            rhs = lists.pop();
            if (undefined === rhs || (undefined !== type && rhs.type !== type)) {
                throw new Error('Parse error at end of list: ' + processed.join(' '));
            }
        }

        function append(token) {
            lists[lists.length - 1].value.push({
                type: 'ref',
                value: token,
                sustain: 1,
                trackName: currentTrackName
            });
        }

        _.each(tokenList, function (token) {
            if ('[' === token.value) {
                newList('sum');
                newList('seq');
            } else if (',' === token.value) {
                endList('seq');
                newList('seq');
            } else if (']' === token.value) {
                while (inList('seq')) {
                    endList('seq');
                }
                endList('sum');
            } else if ('^' === token.value) {
                increaseSustain();
            } else if ('track-name' === token.type) {
                currentTrackName = token.value;
            } else {
                if (!inList('seq')) {
                    newList('seq');
                }
                append(token.value);
            }
            processed.push(token.value);
        });

        if (inList('seq')) {
            endList('seq');
        }

        if (inList()) {
            throw new Error('Unterminated list found!');
        }

        return rhs;
    }

    return {
        parseLine: function parseLine (line) {

            if (line.trim() === '') {
                return {type: 'noop'};
            }

            var comment = /^\s*#\s*(.*?)\s*$/.exec(line);
            if (comment) {
                return {
                    type: 'comment',
                    value: comment[1]
                };
            }

            var patternDefinition = /^\s*(\w.*?)\s*=\s*(.*?)\s*$/.exec(line);
            if (patternDefinition) {
                var lhs = patternDefinition[1];

                return {
                    type: 'patternDefinition',
                    lhs: lhs,
                    rhs: parsePatternDefinitionRHS(tokenizePatternDefinitionRHS(patternDefinition[2]))
                };
            }

            var directive = /^\s*@(\w+)\s*(?:\((.*?)\))?\s*=\s*(.*?)\s*$/.exec(line);
            if (directive) {

                var args = [];

                if (directive[2]) {
                    args = _.map(directive[2].split(','), function (arg) {
                        return arg.trim();
                    });
                }

                return {
                    type: 'directive',
                    name: directive[1],
                    arguments: args,
                    value: directive[3]
                };
            }

            throw new Error('Unrecognized line: ' + line);
        },
        unParseLine: function unParseLine (ast) {

            var str;

            if ('patternDefinition' === ast.type) {
                str = ast.lhs + ' = ' + unParseLine(ast.rhs);
            } else if ('seq' === ast.type) {
                str = _.map(ast.value, unParseLine).join(' ');
            } else if ('sum' === ast.type) {
                str = '[' + _.map(ast.value, unParseLine).join(', ') + ']';
            } else if ('ref' === ast.type) {
                str = ast.value;
            }

            for (var i = 1; i < ast.sustain; ++i) {
                str += ' ^';
            }

            return str;
        }
    };
});
