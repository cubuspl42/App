/**
 * @param {function(...any): void} callback target callback
 * @returns {function(...any): void} a function that calls the target callback
 * with all its arguments, but ignores all calls after the first ones
 */
function calledOnce(callback) {
    let wasCalled = false;

    return () => {
        if (!wasCalled) {
            callback();
            wasCalled = true;
        }
    };
}

/**
 * @param {...(function(...any): any)} callbacks target callbacks
 * @returns {function(...any): any} a function calling all target callbacks with
 * all its arguments
 */
function merge(...callbacks) {
    return (...args) => {
        _.forEach(callbacks, (callback) => {
            callback(...args);
        });
    };
}

export {
    calledOnce,
    merge,
};
