/* global define */

define(['jquery', 'jadeEngine'], function ($, jade) {
    return {
        normalize: function (name) {
            return name;
        },
        load: function (name, req, onload) {
            var jadeTemplateURL = req.toUrl(name + '.jade');
            $.get(jadeTemplateURL).then(function (source) {
                var fn = jade.compile(source);
                onload(fn);
            });
        }
    };
});
