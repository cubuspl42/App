/* eslint-disable no-underscore-dangle */
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';

const propTypes = {
    /** Whether checkbox is checked */
    isChecked: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** Children (icon) for Checkbox */
    children: PropTypes.node,

    /** Additional styles to add to checkbox button */
    style: stylePropTypes,

    /** Callback that is called when mousedown is triggered. */
    onMouseDown: PropTypes.func,
};

const defaultProps = {
    isChecked: false,
    hasError: false,
    disabled: false,
    style: [],
    children: null,
    onMouseDown: undefined,
};

class Checkbox extends React.Component {
    constructor(props) {
        super(props);

        this.root = null;
        this.state = {
            isFocused: false,
        };

        this._enterFocus = this._enterFocus.bind(this);
        this._leaveFocus = this._leaveFocus.bind(this);
        this._handleSpaceKey = this._handleSpaceKey.bind(this);
        this._firePressHandlerOnClick = this._firePressHandlerOnClick.bind(this);
        this.focus = this.focus.bind(this);
        this.blur = this.blur.bind(this);
    }

    _enterFocus() {
        this.setState({isFocused: true});
    }

    _leaveFocus() {
        this.setState({isFocused: false});
    }

    _handleSpaceKey(event) {
        if (event.code !== 'Space') {
            return;
        }

        this.props.onPress();
    }

    _firePressHandlerOnClick(event) {
        // Pressable can be triggered with Enter key and by a click. As this is a checkbox,
        // We do not want to toggle it, when Enter key is pressed.
        if (event.type && event.type !== 'click') {
            return;
        }

        const wasChecked = this.props.isChecked;

        // If checkbox is checked and focused, make sure it's unfocused when pressed.
        if (this.state.isFocused && wasChecked) {
            this._leaveFocus();
        }

        this.props.onPress();
    }

    focus() {
        this._enterFocus();
    }

    blur() {
        this._leaveFocus();
    }

    measureLayout(...args) {
        return this.root.measureLayout(...args);
    }

    render() {
        return (
            <Pressable
                disabled={this.props.disabled}
                onPress={this._firePressHandlerOnClick}
                onMouseDown={this.props.onMouseDown}
                onFocus={this._enterFocus}
                onBlur={this._leaveFocus}
                ref={el => this.root = el}
                onPressOut={this._leaveFocus}
                style={this.props.style}
                onKeyDown={this._handleSpaceKey}
                accessibilityRole="checkbox"
                accessibilityState={{
                    checked: this.props.isChecked,
                }}
            >
                {this.props.children
                    ? this.props.children
                    : (
                        <View
                            style={[
                                styles.checkboxContainer,
                                this.props.isChecked && styles.checkedContainer,
                                this.props.hasError && styles.borderColorDanger,
                                this.props.disabled && styles.cursorDisabled,
                                (this.state.isFocused || this.props.isChecked) && styles.borderColorFocus,
                            ]}
                        >
                            {this.props.isChecked && <Icon src={Expensicons.Checkmark} fill={themeColors.textLight} height={14} width={14} />}
                        </View>
                    )}
            </Pressable>
        );
    }
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;

export default Checkbox;
