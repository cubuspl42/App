/* eslint-disable no-underscore-dangle */
import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Platform} from 'react-native';
import PropTypes from 'prop-types';
import RNPickerSelect from 'react-native-picker-select';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {ScrollContext} from '../ScrollViewWithContext';

const propTypes = {
    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Input value */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The items to display in the list of selections */
    items: PropTypes.arrayOf(PropTypes.shape({
        /** The value of the item that is being selected */
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

        /** The text to display for the item */
        label: PropTypes.string.isRequired,
    })).isRequired,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    /** Customize the Picker background color */
    backgroundColor: PropTypes.string,

    /** A callback method that is called when the value changes and it receives the selected value as an argument */
    onValueChange: PropTypes.func.isRequired,

    /** Size of a picker component */
    size: PropTypes.oneOf(['normal', 'small']),

    /** An icon to display with the picker */
    icon: PropTypes.func,

    /** Callback called when the Picker looses focus */
    onBlur: PropTypes.func,

    /** Callback called when the picker gains focus */
    onFocus: PropTypes.func,

    /** Additional events passed to the core Picker for specific platforms such as web */
    additionalPickerEvents: PropTypes.func,
};

const defaultProps = {
    isDisabled: false,
    backgroundColor: undefined,
    value: undefined,
    placeholder: {},
    size: 'normal',
    icon: size => (
        <Icon
            src={Expensicons.DownArrow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(size === 'small' ? {width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height} : {})}
        />
    ),
    onFocus: () => {},
    onBlur: () => {},
    additionalPickerEvents: () => {},
};

class BasePicker extends PureComponent {
    constructor(props) {
        super(props);
    }

    blur() {
        if (Platform.OS === 'web') {
            this.picker.blur();
        } else if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    focus() {
        if (Platform.OS === 'web') {
            this.picker.focus();
        } else if (this.props.onFocus) {
            this.props.onFocus();
        }
    }

    measureLayout(...args) {
        return this.root.measureLayout(...args);
    }

    render() {
        const extraPickerProps = Platform.OS === 'web' ? {
            onFocus: this.props.onFocus,
            onBlur: this.props.onBlur,
            onMouseDown: this.props.onFocus,
        } : {};

        return (
            <RNPickerSelect
                onValueChange={this.props.onValueChange}

                // We add a text color to prevent white text on white background dropdown items on Windows
                items={_.map(this.props.items, item => ({...item, color: themeColors.pickerOptionsTextColor}))}
                style={this.props.size === 'normal'
                    ? styles.picker(this.props.isDisabled, this.props.backgroundColor)
                    : styles.pickerSmall(this.props.backgroundColor)}
                useNativeAndroidPickerStyle={false}
                placeholder={this.props.placeholder}
                value={this.props.value}
                Icon={() => this.props.icon(this.props.size)}
                disabled={this.props.isDisabled}
                fixAndroidTouchableBug
                onOpen={this.props.onFocus}
                onClose={this.props.onBlur}
                textInputProps={{allowFontScaling: false}}
                pickerProps={{
                    ...extraPickerProps,
                    ref: el => this.picker = el,
                }}
                scrollViewRef={this.context && this.context.scrollViewRef}
                scrollViewContentOffsetY={this.context && this.context.contentOffsetY}
            />
        );
    }
}

BasePicker.propTypes = propTypes;
BasePicker.defaultProps = defaultProps;
BasePicker.contextType = ScrollContext;

// eslint-disable-next-line react/jsx-props-no-spreading
export default React.forwardRef((props, ref) => <BasePicker {...props} ref={ref} key={props.inputID} />);
