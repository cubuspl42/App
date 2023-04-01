import _ from 'lodash';
import React, {PureComponent} from 'react';
import {Animated, View} from 'react-native';
import {BoundsObserver} from '@react-ng/bounds-observer';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import {defaultProps, propTypes} from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

class Tooltip extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // Is tooltip rendered?
            isRendered: false,

            isVisible: false,

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

        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.updateBounds = this.updateBounds.bind(this);
    }

    updateBounds(bounds) {
        this.setState({
            wrapperWidth: bounds.width,
            wrapperHeight: bounds.height,
            xOffset: bounds.x,
            yOffset: bounds.y,
        });
    }

    /**
     * Display the tooltip in an animation.
     */
    showTooltip() {
        if (!this.state.isRendered) {
            this.setState({
                isRendered: true,
            });
        }

        this.setState({
            isVisible: true,
        });

        this.animation.stopAnimation();
        this.shouldStartShowAnimation = true;

        // Defer the animation, so the tooltip measurement is guaranteed to finish
        _.defer(() => {
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

        this.setState({
            isVisible: false,
        });
    }

    render() {
        // Skip the tooltip and return the children if the text is empty,
        // we don't have a render function or the device does not support hovering
        if ((_.isEmpty(this.props.text) && this.props.renderTooltipContent == null) || !this.hasHoverSupport) {
            return this.props.children;
        }

        let child = (
            <BoundsObserver
                activate={this.state.isVisible}
                onBoundsChange={this.updateBounds}
            >
                <View
                    ref={el => this.wrapperView = el}
                    onBlur={this.hideTooltip}
                    focusable={this.props.focusable}
                    style={this.props.containerStyles}
                >

                    {this.props.children}
                </View>
            </BoundsObserver>
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

                    if (_.isFunction(this.props.children.props.onBlur)) {
                        this.props.children.props.onBlur(el);
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
