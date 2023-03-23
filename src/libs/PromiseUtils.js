/**
 * Wrapper to make any promise cancellable
 * from https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 *
 * @param {Promise.<T>} promise
 * @returns {{promise: Promise.<T>, cancel: function(): void}} handle
 */
function makeCancellable(promise) {
    let hasCancelled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(val => (hasCancelled ? undefined : resolve(val)));
        promise.catch(error => (hasCancelled ? undefined : reject(error)));
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCancelled = true;
        },
    };
}

/**
 * @param {function(any): void} callback callback called each time an async task finishes
 * @param {function(...any): Promise.<any>} transform a function returning a promise representing an async task
 * @returns {{call: function(...any): void, cancel: function(): void}} a handle that
 *   ...when called: starts the async task, or does nothing if there's already a running task
 *   ...when cancelled: cancels the running async task (if any)
 */
function transformAsync(callback, transform) {
    let runningTaskHandle = null;

    return {
        call: (...args) => {
            if (!runningTaskHandle) {
                const taskHandle = makeCancellable(transform(...args));
                runningTaskHandle = taskHandle;

                taskHandle.promise.then((result) => {
                    callback(result);
                    runningTaskHandle = null;
                });
            }
        },
        cancel: () => {
            if (runningTaskHandle) {
                runningTaskHandle.cancel();
                runningTaskHandle = null;
            }
        },
    };
}

export {
    makeCancellable,
    transformAsync,
};
