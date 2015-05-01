/* global define */

define(['underscore', 'lib/math'], function (_, math) {

    function Pattern () {
        this.sustain = 1;
        this.control = {};
    }

    Pattern.prototype.getNotes = function patternGetNotes (unitOfTime, tStart, tDuration) {
        var got = [];

        function wrapNoteRepresentation (sStart, sDuration, note, control) {
            return [sStart, sDuration, note, control];
        }

        this.forEachNote(unitOfTime, tStart, tDuration, function () {
            got.push(wrapNoteRepresentation.apply(undefined, _.toArray(arguments)));
        });
        return got;
    };

    Pattern.prototype.toString = function patternToString () {
        return '[' + _.map(this.flatten(this.getAbsoluteDuration()), notesToString).join(', ') + ']';
    };

    Pattern.prototype.listTrackNames = function patternListTrackNames () {
        return _.uniq(_.map(this.getNotes(), function (note) {
            return note[3].trackName || 'master';
        }));
    };

    function decorateNote (sStart, sDuration, note, control, pattern) {
        if (pattern.control.trackName) {
            control.trackName = pattern.control.trackName;
        }
    }

    function getNoteDecorator (pattern, userCallback) {
        return function noteDecorator (sStart, sDuration, note, control) {
            decorateNote(sStart, sDuration, note, control, pattern);
            userCallback(sStart, sDuration, note, control);
        };
    }

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

        this.forEachNote = function notePatternForEachNote (unitOfTime, tStart, tDuration, cb) {
            decorateNote(tStart * unitOfTime, tDuration * unitOfTime, this.note, this.control, this);
            cb(tStart * unitOfTime, tDuration * unitOfTime, this.note, this.control);
            return this;
        };

        this.getScalingFactor = function notePatternGetScalingFactor () {
            return 1;
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

        var getLeftRelativeDuration = (function getLeftRelativeDuration () {
            return this.left.getAbsoluteDuration() / this.getAbsoluteDuration();
        }).bind(this);

        this.forEachNote = function seqPatternForEachNote (unitOfTime, tStart, tDuration, cb) {

            var left = getLeftRelativeDuration();
            var right = 1 - left;

            this.left.forEachNote(unitOfTime, tStart, tDuration * left, getNoteDecorator(this, cb));
            this.right.forEachNote(unitOfTime, tStart + tDuration * left, tDuration * right, getNoteDecorator(this,cb));

            return this;
        };

        this.getScalingFactor = function seqPatternGetScalingFactor () {
            return 1;
        };

        this.getAbsoluteDuration = function seqPatternGetAbsoluteDuration () {
            return this.sustain * (this.left.getAbsoluteDuration() + this.right.getAbsoluteDuration());
        };

        this.flatten = function seqPatternFlatten (duration) {

            var left = getLeftRelativeDuration();

            var leftScalingFactor = this.left.getScalingFactor(), rightScalingFactor = this.right.getScalingFactor();
            var scale = math.leastCommonMultiple([leftScalingFactor, rightScalingFactor]);
            var leftScale = scale / leftScalingFactor;
            var rightScale = scale / rightScalingFactor;

            var flatLeft = this.left.flatten(left * duration * leftScale);
            var flatRight = this.right.flatten((1 - left) * duration * rightScale);

            var leftDuration = this.left.getAbsoluteDuration();

            // make left and right the same length, padding with silence
            for (var lenLeft = flatLeft.length, lenRight = flatRight.length; lenLeft < lenRight; ++lenLeft) {
                flatLeft.push([[0, leftDuration * leftScale, '.', {}]]);
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

        this.forEachNote = function sumPatternForEachNote (unitOfTime, tStart, tDuration, cb) {
            this.primary.forEachNote(unitOfTime, tStart, tDuration, getNoteDecorator(this, cb));
            this.secondary.forEachNote(unitOfTime, tStart, tDuration, getNoteDecorator(this, cb));
            return this;
        };

        this.getScalingFactor = function sumPatternGetScalingFactor () {
            return math.leastCommonMultiple([
                this.primary.getAbsoluteDuration(),
                this.secondary.getAbsoluteDuration()
            ]) / this.primary.getAbsoluteDuration();
        };

        this.getAbsoluteDuration = function sumPatternGetAbsoluteDuration () {
            return this.sustain * this.primary.getAbsoluteDuration();
        };

        this.flatten = function sumPatternFlatten (duration) {
            duration *= this.getScalingFactor();
            return this.primary.flatten(duration).concat(this.secondary.flatten(duration));
        };
    }

    function ProxyPattern (target) {
        Pattern.call(this);
        this.target = target;

        this.forEachNote = function proxyPatternForEachNote (unitOfTime, tStart, tDuration, cb) {
            this.target.forEachNote(unitOfTime, tStart, tDuration, getNoteDecorator(this, cb));
            return this;
        };

        this.getScalingFactor = this.target.getScalingFactor.bind(this.target);

        this.getAbsoluteDuration = function proxyPatternGetAbsoluteDuration () {
            return this.sustain * this.target.getAbsoluteDuration();
        };

        this.flatten = this.target.flatten.bind(this.target);
    }

    NotePattern.prototype = Object.create(Pattern.prototype);
    NotePattern.prototype.constructor = NotePattern;

    SeqPattern.prototype = Object.create(Pattern.prototype);
    SeqPattern.prototype.constructor = SeqPattern;

    SumPattern.prototype = Object.create(Pattern.prototype);
    SumPattern.prototype.constructor = SumPattern;

    ProxyPattern.prototype = Object.create(Pattern.prototype);
    ProxyPattern.prototype.constructor = ProxyPattern;

    return {
        NotePattern: NotePattern,
        SeqPattern: SeqPattern,
        SumPattern: SumPattern,
        ProxyPattern: ProxyPattern
    };
});
