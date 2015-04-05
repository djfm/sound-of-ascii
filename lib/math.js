/* global define */

define([], function () {
    return {
        /**
         * Taken from: http://rosettacode.org/wiki/Least_common_multiple#JavaScript
         * Rewritten according to jshint standards
         */
        leastCommonMultiple: function leastCommonMultiple (arrayOfIntegers) {
            var n = arrayOfIntegers.length, a = Math.abs(arrayOfIntegers[0]);
            for (var i = 1; i < n; i++) {
                var b = Math.abs(arrayOfIntegers[i]), c = a;
                while (a && b) {
                    if (a > b) {
                        a %= b;
                    } else {
                        b %= a;
                    }
                }
                a = Math.abs(c*arrayOfIntegers[i])/(a+b);
            }
            return a;
        }
    };
});
