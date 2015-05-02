/* global define, describe, it */

define(['lib/workforce'], function (workforce) {
    describe('The Workforce', function () {
        it('should provide Workers', function (done) {
            workforce.hire('tests/workforce/exampleModule::sum', [1, 2, 3]).then(function (value) {
                value.should.equal(6);
                done();
            }).fail(function (err) {
                done(err);
            });
        });
        it('should limit the number of workers to 4 by default', function () {
            for (var i = 0; i < 10; ++i) {
                workforce.hire('tests/workforce/exampleModule::sum', [1, 2, 3]);
            }
            workforce.count().should.equal(4);
        });
        it('should notify caller of errors', function (done) {
            workforce.hire('tests/workforce/exampleModule::oops').fail(function (err) {
                if (err.message === 'Oops!') {
                    done();
                } else {
                    done(new Error('Did not get the expected error message, got `' + err.message + '` instead of `Oops!`.'));
                }
            }).then(function () {
                done(new Error('The call should not have been successful.'));
            });
        });
    });
});
