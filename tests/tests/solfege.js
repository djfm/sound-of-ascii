/* global define, describe, it */

define(['underscore', 'lib/solfege'], function (_, solfege) {

    var noteToSemitones = solfege.noteToSemitones;
    var semitonesToFreq = solfege.semitonesToFreq;

    describe('Solfege', function () {

        var strAndExpectedSemitones = [
            ['c'    , 0 ],
            ['c0'   , 0 ],
            ['a0'   , 9 ],
            ['c1'   , 12],
            ['c#'   , 1 ],
            ['c+'   , 1 ],
            ['c♯'   , 1 ],
            ['d♭'   , 1 ],
            ['db'   , 1 ],
            ['d-'   , 1 ],
            ['g4'   , 55]
        ];

        _.each(strAndExpectedSemitones, function (strAndExpectedSemitone) {
            var str = strAndExpectedSemitone[0], semitone = strAndExpectedSemitone[1];
            it('`' + str + '` should have semitone `' + semitone + '`', function () {
                noteToSemitones(str).should.equal(semitone);
            });
        });

        var semitonesAndExpectedFreqs = [
            [0   ,   16.35],
            [12  ,   32.70],
            [13  ,   34.64]
        ];

        _.each(semitonesAndExpectedFreqs, function (semitonesAndExpectedFreq) {
            var semitone = semitonesAndExpectedFreq[0], freq = semitonesAndExpectedFreq[1];
            it('`' + semitone + '` should have freq `' + freq + '`', function () {
                semitonesToFreq(semitone).should.equal(freq);
            });
        });
    });
});
