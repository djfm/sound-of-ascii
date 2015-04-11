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

    var freqs = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87];

    function Note () {
        this.name = null;
        this.value = null;
        this.freq = null;
    }

    return {
        Note: Note,
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
        },
        semitonesToFreq: function semitonesToFreq (semitones) {
            var height = semitones % 12;
            var octave = (semitones - height) / 12;
            return freqs[height] * Math.pow(2, octave);
        },
        parseNote: function parseNote (name) {
            var note = new Note();
            note.value = this.noteToSemitones(name);
            note.name = name;
            if (null !== note.value) {
                note.freq = this.semitonesToFreq(note.value);
            }
            return note;
        }
    };
});
