/**
 * Start an animation loop
 *
 * @param {function(): void} callback callback invoked at each animation frame
 * @return {Handle} handle that, when cancelled, stops the animation loop
 */
function requestAnimationFrames(callback) {
    let handle = null;

    const requestNextFrame = () => {
        handle = requestAnimationFrame(() => {
            callback();
            requestNextFrame();
        });
    };

    requestNextFrame();

    return {
        cancel: () => {
            cancelAnimationFrame(handle);
        },
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    requestAnimationFrames,
};
