/* global define */

define(['underscore', 'lib/math'], function (_, math) {

    function NotePattern (note) {
        this.note = note;
        this.data = {};
    }

    function SeqPattern (left, right) {
        this.left = left;
        this.right = right;
        this.data = {};
    }

    function SumPattern (primary, secondary) {
        this.primary = primary;
        this.secondary = secondary;
        this.data = {};
    }

    return {
        NotePattern: NotePattern,
        SeqPattern: SeqPattern,
        SumPattern: SumPattern
    };
});
