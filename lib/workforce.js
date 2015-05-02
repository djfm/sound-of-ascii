/* global define */

define(['q', 'underscore'], function (q, _) {

    var workerURL = '/lib/worker.js';
    var currentMessageId = 0;
    var messageQueue = {};
    var workersCount = 0;

    var maxWorkers = 4;
    var workers = [];
    var workerIndex = 0;

    function newMessageId () {
        return currentMessageId++;
    }

    function newWorker () {
        var worker = new Worker(workerURL);

        ++workersCount;
        workers.push(worker);


        worker.onmessage = function onmessageCallerSide (e) {
            var mId = e.data.id;
            var payload = e.data.payload;

            if (e.data.errorString) {
                messageQueue[mId].reject(new Error(e.data.errorString));
            } else {
                messageQueue[mId].resolve(payload);
            }

            delete messageQueue[mId];
        };

        return worker;
    }

    function getWorker () {
        if (workersCount < maxWorkers) {
            // Get a new worker if we're allowed to
            return newWorker();
        } else {
            // Alternate over the existing ones otherwise
            return workers[(workerIndex++) % maxWorkers];
        }
    }

    function sendToWorker(worker, message) {
        var mId = newMessageId();
        var d = q.defer();
        messageQueue[mId] = d;

        worker.postMessage({
            id: mId,
            payload: message
        });

        return d.promise;
    }

    function hire (/* actor, arg1, ..., argN */) {
        var args = _.toArray(arguments);

        var actor = args[0], moduleId = null, selector = null;
        var passAlong = args.slice(1);

        var select = actor.split('::');
        if (select.length === 2) {
            moduleId = select[0];
            selector = select[1];
        } else {
            moduleId = actor;
        }

        var worker = getWorker();

        return sendToWorker(worker, {
            fromModule: moduleId,
            select: selector,
            apply: passAlong
        });
    }

    return {
        hire: hire,
        setWorkerScriptURL: function setWorkerScriptURL (url) {
            workerURL = url;
            return this;
        },
        count: function getWorkersCount () {
            return workersCount;
        },
        setMaxWorkers: function setMaxWorkers (n) {
            maxWorkers = n;
            return this;
        }
    };
});
