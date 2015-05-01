/* global define */

define([], function () {
    return {
        erazzor: {
            oscs: [
                {
                    vol: 0.5,
                    pan: 0,
                    crs: 0,
                    fl: 0,
                    fr: 2,
                    po: 0,
                    spd: 0,
                    type: 'triangle'
                },{
                    vol: 0.5,
                    pan: 0,
                    crs: 0,
                    fl: -2,
                    fr: 2,
                    po: 0,
                    spd: 0,
                    type: 'saw',
                    mod: 'PM'
                },{
                    vol: 0.5,
                    pan: 0,
                    crs: 0,
                    fl: -2,
                    fr: 0,
                    po: 0,
                    spd: 0,
                    type: 'saw',
                    mod: 'AM'
                }
            ]
        },
        guitar: {
            oscs: [
                {
                    vol: 0.33,
                    fl: -2,
                    type: 'exp'
                },{
                    vol: 0.33,
                    fl: -2,
                    fr: 2,
                    type: 'exp',
                    mod: 'PM'
                },{
                    vol: 0.33,
                    fr: -2,
                    type: 'exp',
                    mod: 'AM'
                }
            ]
        },
        supernova: {
            oscs: [
                {
                    vol: 0.12,
                    fl: -2,
                    fr: 2,
                    type: 'exp'
                },{
                    vol: 0.12,
                    fl: 4,
                    fr: -4,
                    type: 'exp',
                    mod: 'PM'
                },{
                    vol: 0.12,
                    fr: -2,
                    type: 'square',
                    mod: 'PM'
                }
            ],
        },
        kick: {
            oscs: [
                {
                    vol: 0.1,
                    crs: 24,
                    type: 'noise'
                }
            ]
        }
    };
});
