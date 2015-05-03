/* global define */
define(['jquery'], function ($) {

    function getWidget () {
        return $('#main-nav .notifications');
    }

    return {
        error: function notifyError (message) {
            getWidget().html('<span class="label label-danger">' + message + '</span>');
        },
        clear: function () {
            getWidget().html('');
        }
    };

});
