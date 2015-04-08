/* global define */

define(['lib/pattern'], function (patternLib) {

    var Pattern = patternLib.Pattern;

    function Song(pattern) {
        if (!(pattern instanceof Pattern)) {
            throw new Error('The `pattern` argument should be an instance of `Pattern`.');
        }
    }

    return {
        Song: Song
    };
});
