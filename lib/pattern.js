/* global define */

define(['underscore'], function (_) {

    function Pattern () {
        this.sustain = 1;
    }

    Pattern.prototype.getNotes = function patternGetNotes (unitOfTime, tStart, tDuration) {
        var got = [];
        this.forEachNote(unitOfTime, tStart, tDuration, function () {
            got.push(_.toArray(arguments));
        });
        return got;
    };

    Pattern.prototype.toString = function patternToString () {
        return '[' + _.map(this.flatten(this.getAbsoluteDuration()), notesToString).join(', ') + ']';
    };

    function notesToString (listOfNotes) {

        function showNote (noteDescription) {
            var noteName = noteDescription[2].toString(),
                sustain  = noteDescription[1];

            var out = noteName;
            for (var s = 1; s < sustain; ++s) {
                out += ' ^';
            }

            return out;
        }

        return _.map(listOfNotes, showNote).join(' ');
    }

    function NotePattern (note) {
        Pattern.call(this);

        this.note = note;
        this.control = {};

        this.forEachNote = function notePatternForEachNote (unitOfTime, tStart, tDuration, cb) {
            cb(tStart * unitOfTime, tDuration * unitOfTime, this.note, this.control);
            return this;
        };

        this.getAbsoluteDuration = function notePatternGetAbsoluteDuration () {
            return this.sustain;
        };

        this.flatten = function notePatternFlatten (duration) {
            return [this.getNotes(1, 0, duration)];
        };

        return this;
    }

    function SeqPattern (left, right) {
        Pattern.call(this);

        this.left = left;
        this.right = right;
        this.control = {};

        this.getLeftRelativeDuration = function getLeftRelativeDuration () {
            return this.left.getAbsoluteDuration() / this.getAbsoluteDuration();
        };

        this.forEachNote = function seqPatternForEachNote (unitOfTime, tStart, tDuration, cb) {

            var left = this.getLeftRelativeDuration();
            var right = 1 - left;

            this.left.forEachNote(unitOfTime, tStart, tDuration * left, cb);
            this.right.forEachNote(unitOfTime, tStart + tDuration * left, tDuration * right, cb);

            return this;
        };

        this.getAbsoluteDuration = function seqPatternGetAbsoluteDuration () {
            return this.sustain * (this.left.getAbsoluteDuration() + this.right.getAbsoluteDuration());
        };

        this.flatten = function seqPatternFlatten (duration) {

            var left = this.getLeftRelativeDuration();

            var flatLeft = this.left.flatten(left * duration);
            var flatRight = this.right.flatten((1 - left) * duration);

            var leftDuration = this.left.getAbsoluteDuration();

            // make left and right the same length, padding with silence
            for (var lenLeft = flatLeft.length, lenRight = flatRight.length; lenLeft < lenRight; ++lenLeft) {
                flatLeft.push([[0, leftDuration, '.', {}]]);
            }

            return _.map(flatLeft, function (seq, i) {
                return seq.concat(flatRight[i]);
            });
        };
    }

    function SumPattern (primary, secondary) {
        Pattern.call(this);

        this.primary = primary;
        this.secondary = secondary;
        this.control = {};

        this.forEachNote = function sumPatternForEachNote (unitOfTime, tStart, tDuration, cb) {
            this.primary.forEachNote(unitOfTime, tStart, tDuration, cb);
            this.secondary.forEachNote(unitOfTime, tStart, tDuration, cb);
            return this;
        };

        this.getAbsoluteDuration = function sumPatternGetAbsoluteDuration () {
            return this.sustain * this.primary.getAbsoluteDuration();
        };

        this.flatten = function sumPatternFlatten (duration) {
            return this.primary.flatten(duration).concat(this.secondary.flatten(duration));
        };
    }

    NotePattern.prototype = Object.create(Pattern.prototype);
    NotePattern.prototype.constructor = NotePattern;

    SeqPattern.prototype = Object.create(Pattern.prototype);
    SeqPattern.prototype.constructor = SeqPattern;

    SumPattern.prototype = Object.create(Pattern.prototype);
    SumPattern.prototype.constructor = SumPattern;

    return {
        NotePattern: NotePattern,
        SeqPattern: SeqPattern,
        SumPattern: SumPattern
    };
});
