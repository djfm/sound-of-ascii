/* global define */

define(['underscore'], function (_) {
    return {
        sum: function sumList (list) {
            return _.reduce(list, function (sum, item) {
                return sum + item;
            }, 0);
        },
        oops: function oops () {
            throw new Error('Oops!');
        }
    };
});
