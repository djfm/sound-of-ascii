/* global self, requirejs */

self.importScripts('../node_modules/requirejs/require.js', '../src/setup.js');



self.onmessage = function onmessageWorkerSide (e) {
    var data = e.data;

    if (data.payload.fromModule) {
        requirejs([data.payload.fromModule], function withModule (mod) {

            try {
                if (data.payload.select) {
                    mod = mod[data.payload.select];
                }
                if (data.payload.apply) {
                    var result = mod.apply(undefined, data.payload.apply);
                    data.payload = result;
                    self.postMessage(data);
                }
            } catch (error) {
                data.errorString = error.message;
                self.postMessage(data);
            }
        });
    }
};
