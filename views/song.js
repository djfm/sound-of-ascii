/* global define */
define(['underscore', 'lib/solfege', 'views/view', 'jade!views/templates/song'], function (_, solfege, View, songTemplate) {

    function Song (song) {

        this.song = song;
        var tracks = this.tracks = new Tracks();

        this.song.forEachNote(1, 0, this.song.getAbsoluteDuration(), function (sStart, sDuration, note, control) {
            note = solfege.parseNote(note);
            if (note.freq > 0) {
                tracks.addNote(sStart, sDuration, note, control.trackName || 'master');
            }
        });

        tracks.prepare();

        this.render = function renderSong (canvas) {
            canvas.width = this.getWidth();
            canvas.height = this.getHeight();
            this.tracks.render(canvas, 0, 0);
        };

        this.getWidth = function songGetWidth () {
            return this.tracks.getWidth();
        };

        this.getHeight = function songGetHeight () {
            return this.tracks.getHeight();
        };
    }

    function Tracks () {
        this.tracks = {};

        this.addNote = function tracksAddNote (sStart, sDuration, note, trackName) {
            if (!_.has(this.tracks, trackName)) {
                this.tracks[trackName] = new Track(trackName);
            }

            this.tracks[trackName].addNote(sStart, sDuration, note);
        };

        this.prepare = function tracksPrepare () {
            _.each(this.tracks, function (track) {
                track.prepare();
            });
        };

        this.render = function renderTracks (canvas, left, top) {
            _.each(this.tracks, function (track) {
                top = track.render(canvas, left, top);
            });
        };

        this.getWidth = function tracksGetWidth () {
            return _.reduce(this.tracks, function (acc, track) {
                return Math.max(acc, track.getWidth());
            }, 0);
        };

        this.getHeight = function tracksGetHeight () {
            return _.reduce(this.tracks, function (acc, track) {
                return acc + track.getHeight();
            }, 0);
        };
    }

    function Track (name) {
        this.name = name;
        this.degrees = new Degrees();
        this.marginBottom = 40;

        this.addNote = function trackAddNote (sStart, sDuration, note) {
            this.degrees.addNote(sStart, sDuration, note);
        };

        this.prepare = function trackPrepare () {
            this.degrees.prepare();
        };

        this.render = function trackRender (canvas, left, top) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.font = '18pt Arial';
            ctx.fillText(this.name, left, top + 15);
            top += this.marginBottom;

            return this.degrees.render(canvas, left, top);
        };

        this.getWidth = function trackGetWidth () {
            return this.degrees.getWidth();
        };

        this.getHeight = function trackGetHeight () {
            return this.degrees.getHeight() + this.marginBottom;
        };
    }

    function Degrees () {

        this.degrees = {};
        this.degreesArray = [];
        this.marginBottom = 20;

        this.addNote = function degreesAddNote (sStart, sDuration, note) {
            if (!_.has(this.degrees, note.name)) {
                this.degreesArray.push(this.degrees[note.name] = new Degree(note, note.name));
            }
            this.degrees[note.name].addNote(sStart, sDuration);
        };

        this.prepare = function degreesPrepare () {

            this.degreesArray.sort(function (a, b) {
                return b.note.freq - a.note.freq;
            });

            _.each(this.degrees, function (degree) {
                degree.prepare();
            });
        };

        this.render = function degreesRender (canvas, left, top) {
            _.each(this.degreesArray, function (degree) {
                top = degree.render(canvas, left, top);
            });

            return top + this.marginBottom;
        };

        this.getWidth = function degreesGetWidth () {
            return _.reduce(this.degreesArray, function (acc, degree) {
                return Math.max(acc, degree.getWidth());
            }, 0);
        };

        this.getHeight = function degreesGetHeight () {
            return this.degreesArray.length * this.degreesArray[0].getHeight() + this.marginBottom;
        };
    }

    function Degree (note, name) {
        this.note = note;
        this.name = name;

        this.slots = [];

        this.pxPerSecond = 5;
        this.leftSpacing = 50;

        this.addNote = function degreeAddnote (sStart, sDuration) {
            this.slots.push({
                sStart: sStart,
                sDuration: sDuration
            });
        };

        this.prepare = function degreePrepare () {
            this.slots.sort(function (a, b) {
                if (a.sStart < b.sStart) {
                    return -1;
                } else if (a.sStart === b.sStart) {
                    return a.sDuration - b.sDuration;
                } else {
                    return 1;
                }
            });
        };

        this.getWidth = function degreeGetWidth () {
            var lastSlot = this.slots[this.slots.length - 1];
            return this.leftSpacing + (lastSlot.sStart + lastSlot.sDuration) * this.pxPerSecond;
        };

        this.getHeight = function degreeGetWidth () {
            return 20;
        };

        this.render = function degreeRender (canvas, left, top) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.font = '13pt Arial';
            ctx.fillText(this.name, left, top + 7);

            _.each(this.slots, function (slot) {
                ctx.fillStyle = 'green';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                var x = left + this.leftSpacing + slot.sStart * this.pxPerSecond,
                    y = top,
                    w = slot.sDuration * this.pxPerSecond,
                    h = 13;

                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);
            }, this);

            return top + this.getHeight();
        };
    }

    return View.extend({
        initialize: function initializeSongView () {

        },
        template: songTemplate,
        afterRender: function songViewAfterRender () {
            var $canvas = this.$('canvas'), canvas = $canvas.get(0);

            var song = new Song(this.song);
            song.render(canvas);
        }
    });
});
