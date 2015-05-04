/* global define, describe, it */

define(['chai', 'underscore', 'lib/eon'], function (chai, _, eon) {
    describe('Efficient Object Notation', function () {
        var examples = [
            // expected // source
            [true       , '+'       ],
            [false      , '-'       ],
            [3          , '3'       ],
            [3.14       , '3.14'    ],
            ['abc'      , '"abc"'   ],
            ['a\bc'     , '"a\bc"'  ],
            ['a\"c'     , '"a\\"c"' ],
            ["a\'c"     , "'a\\'c'" ]
        ];

        _.each(examples, function (example) {
            it('should parse `' + example[1] + '` as ' + JSON.stringify(example[0]), function () {
                chai.expect(eon.parse(example[1])).to.deep.equal(example[0]);
            });
        });
    });
});
