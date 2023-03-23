import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Animated, View} from 'react-native';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import {propTypes, defaultProps} from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import * as PromiseUtils from '../../libs/PromiseUtils';
import * as AnimationUtils from '../../libs/AnimationUtils';
import * as CallbackUtils from '../../libs/CallbackUtils';
import * as HandleUtils from '../../libs/HandleUtils';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

class Tooltip extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // Is tooltip rendered?
            isRendered: false,

            // The distance between the left side of the wrapper view and the left side of the window
            xOffset: 0,

            // The distance between the top of the wrapper view and the top of the window
            yOffset: 0,

            // The width and height of the wrapper view
            wrapperWidth: 0,
            wrapperHeight: 0,
        };

        // Whether the tooltip is first tooltip to activate the TooltipSense
        this.isTooltipSenseInitiator = false;
        this.shouldStartShowAnimation = false;
        this.animation = new Animated.Value(0);
        this.hasHoverSupport = DeviceCapabilities.hasHoverSupport();
        this.syncingPositionHandle = null;

        this.getWrapperBounds = this.getWrapperBounds.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    componentWillUnmount() {
        if (!this.syncingPositionHandle) {
            return;
        }

        this.syncingPositionHandle.cancel();
        this.syncingPositionHandle = null;
    }

    /**
     * Measure the bounds of the wrapper view relative to the window.
     *
     * @returns {Promise.<{x: number, y: number, width: number, height: number}>}
     */
    getWrapperBounds() {
        return new Promise(((resolve) => {
            // Make sure the wrapper is mounted before attempting to measure it.
            if (this.wrapperView && _.isFunction(this.wrapperView.measureInWindow)) {
                this.wrapperView.measureInWindow((x, y, width, height) => resolve({
                    x, y, width, height,
                }));
            } else {
                resolve({
                    x: 0, y: 0, width: 0, height: 0,
                });
            }
        }));
    }

    /**
     * Start syncing the tooltip's position with wrapper's position
     *
     * @param {function(): void} onStarted a callback called once bounds are established for the first ime
     * @returns {Handle} a handle to the syncing process
     */
    startSyncingPosition({
        onStarted,
    }) {
        /**
         * @param {{x: number, y: number, width: number, height: number}} position
         * @returns {void}
         */
        const updatePosition = ({
            x, y, width, height,
        }) => {
            this.setState({
                wrapperWidth: width,
                wrapperHeight: height,
                xOffset: x,
                yOffset: y,
            });
        };

        /**
         * Function that processes each new bounds, updating the tooltip position and ensuring that onStarted is called
         * when we got first bounds
         *
         * @param {{x: number, y: number, width: number, height: number}} position
         * @returns {void}
         */
        const processWrapperBounds = CallbackUtils.merge(
            updatePosition,
            CallbackUtils.calledOnce((_) => {
                onStarted();
            }),
        );

        /**
         * Handle called at each animation frame, starting the position getting async task
         *
         * @type {{
         *   call: function(): void,
         *   cancel: function(): void,
         * }}
         */
        const processAnimationFrameHandle = PromiseUtils.transformAsync(processWrapperBounds, this.getWrapperBounds);

        /**
         * Handle to the animation loop that drives the whole syncing process
         *
         * @type {Handle}
         */
        const animationHandle = AnimationUtils.requestAnimationFrames(processAnimationFrameHandle.call);

        return HandleUtils.mergeHandles(
            processAnimationFrameHandle,
            animationHandle,
        );
    }

    /**
     * Display the tooltip in an animation.
     */
    showTooltip() {
        if (!this.state.isRendered) {
            this.setState({isRendered: true});
        }
        this.animation.stopAnimation();
        this.shouldStartShowAnimation = true;

        this.syncingPositionHandle = this.startSyncingPosition({
            onStarted: () => {
                // We may need this check due to the reason that the animation start will fire async
                // and hideTooltip could fire before it thus keeping the Tooltip visible
                if (this.shouldStartShowAnimation) {
                    // When TooltipSense is active, immediately show the tooltip
                    if (TooltipSense.isActive()) {
                        this.animation.setValue(1);
                    } else {
                        this.isTooltipSenseInitiator = true;
                        Animated.timing(this.animation, {
                            toValue: 1,
                            duration: 140,
                            delay: 500,
                            useNativeDriver: false,
                        }).start();
                    }
                    TooltipSense.activate();
                }
            },
        });
    }

    /**
     * Hide the tooltip in an animation.
     */
    hideTooltip() {
        this.animation.stopAnimation();
        this.shouldStartShowAnimation = false;
        if (TooltipSense.isActive() && !this.isTooltipSenseInitiator) {
            this.animation.setValue(0);
        } else {
            // Hide the first tooltip which initiated the TooltipSense with animation
            this.isTooltipSenseInitiator = false;
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 140,
                useNativeDriver: false,
            }).start();
        }
        TooltipSense.deactivate();

        if (this.syncingPositionHandle) {
            this.syncingPositionHandle.cancel();
            this.syncingPositionHandle = null;
        }
    }

    render() {
        // Skip the tooltip and return the children if the text is empty,
        // we don't have a render function or the device does not support hovering
        if ((_.isEmpty(this.props.text) && this.props.renderTooltipContent == null) || !this.hasHoverSupport) {
            return this.props.children;
        }
        let child = (
            <View
                ref={el => this.wrapperView = el}
                onBlur={this.hideTooltip}
                focusable={this.props.focusable}
                style={this.props.containerStyles}
            >
                {this.props.children}
            </View>
        );

        if (this.props.absolute && React.isValidElement(this.props.children)) {
            child = React.cloneElement(React.Children.only(this.props.children), {
                ref: (el) => {
                    this.wrapperView = el;

                    // Call the original ref, if any
                    const {ref} = this.props.children;
                    if (_.isFunction(ref)) {
                        ref(el);
                    }
                },
                onBlur: (el) => {
                    this.hideTooltip();

                    // Call the original onBlur, if any
                    const {onBlur} = this.props.children;
                    if (_.isFunction(onBlur)) {
                        onBlur(el);
                    }
                },
                focusable: true,
            });
        }

        return (
            <>
                {this.state.isRendered && (
                    <TooltipRenderedOnPageBody
                        animation={this.animation}
                        windowWidth={this.props.windowWidth}
                        xOffset={this.state.xOffset}
                        yOffset={this.state.yOffset}
                        wrapperWidth={this.state.wrapperWidth}
                        wrapperHeight={this.state.wrapperHeight}
                        shiftHorizontal={_.result(this.props, 'shiftHorizontal')}
                        shiftVertical={_.result(this.props, 'shiftVertical')}
                        text={this.props.text}
                        maxWidth={this.props.maxWidth}
                        numberOfLines={this.props.numberOfLines}
                        renderTooltipContent={this.props.renderTooltipContent}
                    />
                )}
                <Hoverable
                    absolute={this.props.absolute}
                    containerStyles={this.props.containerStyles}
                    onHoverIn={this.showTooltip}
                    onHoverOut={this.hideTooltip}
                >
                    {child}
                </Hoverable>
            </>
        );
    }
}

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
export default withWindowDimensions(Tooltip);
