/* global define */

define(['underscore', 'lib/pattern', 'lib/solfege'], function (_, patternLib, solfege) {

    var Pattern = patternLib.Pattern;

    function Slot () {
        this.notes = [];
        this.tStart = null;
        this.duration = function duration () {
            return _.reduce(this.notes, function (maxDuration, note) {
                return Math.max(maxDuration, note.duration);
            }, 0);
        };
    }

    function Degree () {
        this.slots = [];
        var slotsByTStart = {};

        this.addNote = function addNote (note, tStart, duration) {

            note = _.extend(note, {
                duration: duration
            });

            if (!_.has(slotsByTStart, tStart)) {
                var slot = slotsByTStart[tStart] = new Slot();
                slot.tStart = tStart;
                this.slots.push(slot);
            }
            slotsByTStart[tStart].notes.push(note);
        };
    }

    function Track () {

        this.degreesByName = {};
        this.degrees = [];

        this.addAtom = function (atom, tStart, duration) {
            var note = solfege.parseNote(atom.value);

            var degree;

            if (_.has(this.degreesByName, note.name)) {
                degree = this.degreesByName[note.name];
            } else {
                degree = this.degreesByName[note.name] = new Degree();
                degree.name = note.name;
                degree.value = note.value;
                this.degrees.push(degree);
            }

            degree.addNote(note, tStart, duration);

            return this;
        };
    }

    function Song(pattern) {
        if (!(pattern instanceof Pattern)) {
            throw new Error('The `pattern` argument should be an instance of `Pattern`.');
        }

        pattern = pattern.flatten();

        this.tracks = [];
        this.tracksByName = {};

        this.getTrackByName = function getTrackByName (trackName) {
            if (_.has(this.tracksByName, trackName)) {
                return this.tracksByName[trackName];
            } else {
                return null;
            }
        };

        function buildTracks () {
            var that = this;
            _.each(pattern.children, function (seqOfAtoms) {
                var dt = 0;
                _.each(seqOfAtoms.children, function (atom) {
                    var trackName = atom.trackName || 'master';
                    var track = that.getTrackByName(trackName);
                    if (!track) {
                        track = new Track();
                        that.tracksByName[trackName] = track;
                        that.tracks.push(track);
                    }
                    var d = atom.duration();
                    track.addAtom(atom, dt, d);
                    dt += d;
                });
            });

            _.each(this.tracks, function (track) {

                track.degrees.sort(function (a, b) {
                    return b.value - a.value;
                });

                _.each(track.degrees, function (degree) {

                    degree.slots.sort(function (a, b) {
                        return a.tStart - b.tStart;
                    });

                    var tLast = 0;
                    _.each(degree.slots, function (slot) {
                        var tEnd = slot.tStart + slot.duration();
                        slot.tOffset = slot.tStart - tLast;
                        tLast = tEnd;
                    });
                });
            });
        }

        buildTracks.call(this);
    }

    return {
        Song: Song
    };
});
