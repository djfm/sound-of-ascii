/* global define */

define(['underscore', 'lib/pattern', 'lib/solfege'], function (_, patternLib, solfege) {

    var Pattern = patternLib.Pattern;

    function Slot () {
        this.notes = [];
        this.tStart = null;
    }

    function Degree () {
        this.slots = [];
        var slotsByTStart = {};

        this.addNote = function addNote (note, tStart) {
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

        this.addAtom = function (atom, tStart) {
            var note = solfege.parseNote(atom.value);

            var degree;

            if (_.has(this.degreesByName, note.name)) {
                degree = this.degreesByName[note.name];
            } else {
                degree = this.degreesByName[note.name] = new Degree();
                this.degrees.push(degree);
            }

            degree.addNote(note, tStart);

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

        function getTrackByName (trackName) {
            if (_.has(this.tracksByName, trackName)) {
                return this.tracksByName[trackName];
            } else {
                return null;
            }
        }

        function buildTracks () {
            for (var dt = 0, t = pattern.duration(); dt < t; ++dt) {
                var that = this;
                _.each(pattern.children, function (seqOfAtoms) {
                    var atom = seqOfAtoms.children[dt];
                    var trackName = atom.trackName || 'master';
                    var track = getTrackByName(trackName);
                    if (!track) {
                        track = new Track();
                        that.tracksByName[trackName] = track;
                        that.tracks.push(track);
                    }
                    track.addAtom(atom, dt);
                });
            }
        }

        buildTracks.call(this);
    }

    return {
        Song: Song
    };
});
