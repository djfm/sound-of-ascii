/* global define */

define(['underscore', 'lib/math'], function (_, math) {
    return {
        Pattern: function Pattern (kind) {

            if ('sum' !== kind && 'seq' !== kind && 'atom' !== kind) {
                throw new Error(
                    'Pattern should have either `seq`, `sum` or `atom` as kind. Got: `' + kind + '`.'
                );
            }

            this.kind = kind;

            this.sustain = 1;
            this.resolution = 1;

            this.forEachAtom = function forEachAtom (callback) {
                if ('atom' === this.kind) {
                    callback(this);
                } else {
                    _.each(this.children, function (child) {
                        child.forEachAtom(callback);
                    });
                }
            };

            if ('atom' === this.kind) {
                this.value = arguments[1];
                this.duration = function () {
                    return this.sustain * this.resolution;
                };
            } else {
                this.children = _.toArray(arguments).splice(1);

                if (Object.prototype.toString.call(this.children[0]) === '[object Array]') {
                    this.children = this.children[0];
                }

                if ('seq' === this.kind) {
                    this.duration = function () {
                        return this.sustain * _.reduce(this.children, function (sum, child) {
                            return sum + child.duration();
                        }, 0);
                    };
                } else if ('sum' === this.kind) {
                    this.duration = function () {
                        return this.sustain * _.reduce(this.children, function (maxDuration, child) {
                            return Math.max(maxDuration, child.duration());
                        }, 0);
                    };
                }
            }

            /**
             * This function turns any pattern
             * into a `sum` of `seq` of `atom`s.
             */
            this.flatten = function () {
                function addSilenceLines (node, number, sustain) {
                    for (var i = 0; i < number; ++i) {
                        var silence = new Pattern('atom', '.');
                        silence.sustain = sustain;
                        node.children.push(new Pattern('seq', silence));
                    }
                }

                var sum;
                var trackName = this.trackName;

                function updateAtom (atom) {
                    if (trackName) {
                        atom.trackName = trackName;
                    }
                }

                if ('atom' === this.kind) {
                    sum = new Pattern('sum', new Pattern('seq', _.clone(this)));
                } else if ('seq' === this.kind) {
                    _.each(this.children, function (child) {
                        child = child.flatten();
                        if (!sum) {
                            sum = child;
                        } else {
                            var targetRes = math.leastCommonMultiple([sum.resolution, child.resolution]);
                            var leftResAdj = targetRes / sum.resolution, rightResAdj = targetRes / child.resolution;
                            if (leftResAdj > 1) {
                                sum.forEachAtom(function (atom) {
                                    atom.resolution *= leftResAdj;
                                });
                            }
                            if (rightResAdj > 1) {
                                child.forEachAtom(function (atom) {
                                    atom.resolution *= rightResAdj;
                                });
                            }

                            sum.resolution = targetRes;

                            var d = sum.duration();
                            addSilenceLines(child, sum.children.length - child.children.length, child.duration());
                            _.each(child.children, function (seqToAppend, height) {
                                addSilenceLines(sum, height - sum.children.length + 1, d);
                                sum.children[height].children = sum.children[height].children.concat(seqToAppend.children);
                            });
                        }
                    });

                    var sustain = this.sustain;
                    sum.forEachAtom(function (atom) {
                        atom.sustain *= sustain;
                        updateAtom(atom);
                    });
                } else if ('sum' === this.kind) {
                    var referenceDuration = this.children[0].duration() * this.sustain;
                    var durations = [this.duration()];

                    var children = _.reduce(this.children, function (sofar, child) {
                        var flatChild = child.flatten();
                        durations.push(flatChild.duration());
                        return sofar.concat(flatChild.children);
                    }, []);

                    sum = new Pattern('sum', children);
                    var lcmDuration = math.leastCommonMultiple(durations);
                    sum.resolution = lcmDuration / referenceDuration;

                    _.each(children, function adjustDurations (seqOfAtoms) {
                        var dSustain = lcmDuration / seqOfAtoms.duration();
                        _.each(seqOfAtoms.children, function (atom) {
                            atom.sustain *= dSustain;
                            updateAtom(atom);
                        });
                    });
                }

                return sum;
            };

            this.toString = function () {
                if ('atom' === this.kind) {
                    var arr = [this.value.toString()];
                    for (var d = 1; d < this.duration(); ++d) {
                        arr.push('^');
                    }
                    return arr.join(' ');
                } else if ('seq' === this.kind) {
                    return _.map(this.children, function (child) {
                        return child.toString();
                    }).join(' ');
                } else if ('sum' === this.kind) {
                    return '[' + _.map(this.children, function (child) {
                        return child.toString();
                    }).join(', ') + ']';
                }
            };
        }
    };
});
