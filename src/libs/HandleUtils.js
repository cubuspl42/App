/**
 * @typedef Handle handle to some cancellable (disposable) resource
 * @property {function(): void} cancel a function cancelling the handle
 */

/**
 * @param {...Handle} handles target handles
 * @returns {Handle} a handle that, when canceled, cancels all target handles
 */
function mergeHandles(...handles) {
    return {
        cancel: () => {
            _.forEach(handles, (handle) => {
                handle.cancel();
            });
        },
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    mergeHandles,
};
