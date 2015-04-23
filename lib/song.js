/* global define */

define(['underscore', 'lib/pattern', 'lib/solfege'], function (_, patternLib, solfege) {

    var Pattern = patternLib.Pattern;

    function Slot () {
        this.notes = [];
        this.tStart = null;
        this.duration = function duration () {
            var that = this;
            return _.reduce(this.notes, function (maxDuration, note) {
                return Math.max(maxDuration, note.tStart + note.duration - that.tStart);
            }, 0);
        };
        this.merge = function merge (otherSlot) {
            this.notes = this.notes.concat(otherSlot.notes);
            return this;
        };
    }

    function Degree () {
        this.slots = [];
        var slotsByTStart = {};

        this.addNote = function addNote (note, tStart, duration) {

            note = _.extend(note, {
                duration: duration,
                tStart: tStart
            });

            if (!_.has(slotsByTStart, tStart)) {
                var slot = slotsByTStart[tStart] = new Slot();
                slot.tStart = tStart;
                this.slots.push(slot);
            }
            slotsByTStart[tStart].notes.push(note);
        };

        this.sortAndMerge = function sortAndMerge () {

            this.slots.sort(function (a, b) {
                return a.tStart - b.tStart;
            });

            var tLast = 0;

            this.slots = _.reduce(this.slots, function (slots, slot) {
                var tOffset = slot.tStart - tLast;

                if (tOffset >= 0) {
                    slot.tOffset = tOffset;
                    slots.push(slot);
                    tLast = slot.tStart + slot.duration();
                } else {
                    var previousSlot = slots[slots.length - 1];
                    previousSlot.merge(slot);
                    tLast = previousSlot.tStart + previousSlot.duration();
                }

                return slots;
            }, []);
        };
    }

    function Track (name) {

        this.degreesByName = {};
        this.degrees = [];
        this.name = name;

        this.addAtom = function (atom, tStart, duration) {
            var note = solfege.parseNote(atom.value);

            if (null === note.value && note.name === '.') {
                // ignore silence notes
                return this;
            }

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

    function Song(pattern, atomDuration) {

        atomDuration = atomDuration || 0.25;

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
                        track = new Track(trackName);
                        that.tracksByName[trackName] = track;
                        that.tracks.push(track);
                    }
                    var d = atom.duration();
                    track.addAtom(atom, dt, d);
                    dt += d;
                });
            });

            _.each(this.tracks, function (track) {
                /**
                 * Sort degrees by note height (in semitones)
                 */
                track.degrees.sort(function (a, b) {
                    return b.value - a.value;
                });

                _.each(track.degrees, function (degree) {
                    degree.sortAndMerge();
                });
            });
        }

        buildTracks.call(this);

        this.forEachNote = function forEachNote (callback) {
            _.each(this.tracks, function (track) {
                _.each(track.degrees, function (degree) {
                    _.each(degree.slots, function (slot) {
                        _.each(slot.notes, function (note) {
                            callback(note, atomDuration);
                        });
                    });
                });
            });
        };
    }

    return {
        Song: Song
    };
});
