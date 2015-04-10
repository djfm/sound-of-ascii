/* global define */

define(['underscore', 'lib/pattern', 'lib/solfege'], function (_, patternLib, solfege) {

    var Pattern = patternLib.Pattern;

    function Track () {
        this.addAtom = function (atom) {
            var degreesByName = {};
            var degrees = [];

            var degreeIndex = solfege.noteToSemitones('a');
        };
    }

    function Song(pattern) {
        if (!(pattern instanceof Pattern)) {
            throw new Error('The `pattern` argument should be an instance of `Pattern`.');
        }

        pattern = pattern.flatten();

        var tracks = [];
        var tracksByName = {};

        function getTrackByName (trackName) {
            if (_.has(tracksByName, trackName)) {
                return tracksByName[trackName];
            } else {
                return null;
            }
        }

        function buildTracks () {
            for (var dt = 0, t = pattern.duration(); dt < t; ++dt) {
                _.each(pattern.children, function (seqOfAtoms) {
                    var atom = seqOfAtoms.children[dt];
                    var trackName = atom.trackName || 'master';
                    var track = getTrackByName(trackName);
                    if (!track) {
                        track = new Track();
                        tracksByName[trackName] = track;
                        tracks.push(track);
                    }
                    track.addAtom(atom);
                });
            }
        }

        buildTracks();

        this.tracks = function () {
            return tracks;
        };
    }

    return {
        Song: Song
    };
});
