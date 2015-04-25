/* global define */

define([], function () {
    return {
        erazzor: [
            {
                vol: 0.33,
                pan: 0,
                crs: 0,
                fl: -2,
                fr: 0,
                po: 0,
                spd: 0,
                type: 'saw',
                mod: 'AM'
            },{
                vol: 0.33,
                pan: 0,
                crs: 0,
                fl: -2,
                fr: 2,
                po: 0,
                spd: 0,
                type: 'saw',
                mod: 'PM'
            },{
                vol: 0.33,
                pan: 0,
                crs: 0,
                fl: 0,
                fr: 2,
                po: 0,
                spd: 0,
                type: 'triangle'
            }
        ],
        guitar: [
            {
                vol: 0.33,
                fr: -2,
                type: 'exp',
                mod: 'AM'
            },{
                vol: 0.33,
                fl: -2,
                fr: 2,
                type: 'exp',
                mod: 'PM'
            },{
                vol: 0.33,
                fl: -2,
                type: 'exp'
            }
        ],
        supernova: [
            {
                vol: 0.33,
                fr: -2,
                type: 'square',
                mod: 'PM'
            },{
                vol: 0.33,
                fl: 4,
                fr: -4,
                type: 'exp',
                mod: 'PM'
            },{
                vol: 0.33,
                fl: -2,
                fr: 2,
                type: 'exp'
            }
        ],
        kick: [
            {
                vol: 0.1,
                crs: 20,
                type: 'noise'
            }
        ]
    };
});
