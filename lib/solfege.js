/* global define */

define(['underscore'], function (_) {

    var scale = {
        c: 0,
        d: 2,
        e: 4,
        f: 5,
        g: 7,
        a: 9,
        b: 11
    };

    return {
        noteToSemitones: function noteToSemitones (str, options) {
            options = _.defaults(options || {}, {
                baseOctave: 4
            });

            var noteExpr = /^([a-g])([#♯+\-♭b]?)(\d?)$/;
            var m = noteExpr.exec(str);

            if (m) {
                var note = m[1];

                if (!_.has(scale, note)) {
                    return null;
                }

                var semitone = scale[note];

                var modifier = m[2];
                if (modifier) {
                    if ("#♯+".indexOf(modifier) >= 0) {
                        ++semitone;
                    } else {
                        --semitone;
                    }
                }

                var octave = +m[3];

                semitone = semitone + octave * 12;

                return semitone;
            }


            return null;
        }
    };
});
