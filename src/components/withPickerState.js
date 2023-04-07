/* eslint-disable react/no-unused-state */
import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const PickerStateContext = createContext(null);

const pickerStatePropTypes = {
    /** Whether the picker is open */
    isPickerShown: PropTypes.bool.isRequired,

    notifyPickerShown: PropTypes.func,

    notifyPickerHidden: PropTypes.func,
};

const pickerStateProviderPropTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

class PickerStateProvider extends React.Component {
    constructor(props) {
        super(props);

        this.notifyPickerShown = this.notifyPickerShown.bind(this);
        this.notifyPickerHidden = this.notifyPickerHidden.bind(this);

        this.state = {
            isPickerShown: false,
        };
    }

    notifyPickerShown() {
        this.setState({
            isPickerShown: true,
        });
    }

    notifyPickerHidden() {
        this.setState({
            isPickerShown: false,
        });
    }

    render() {
        return (
            <PickerStateContext.Provider
                value={{
                    isPickerShown: this.state.isPickerShown,
                    notifyPickerShown: this.notifyPickerShown,
                    notifyPickerHidden: this.notifyPickerHidden,
                }}
            >
                {this.props.children}
            </PickerStateContext.Provider>
        );
    }
}

PickerStateProvider.propTypes = pickerStateProviderPropTypes;

/**
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
export default function withPickerState(WrappedComponent) {
    const WithPickerState = forwardRef((props, ref) => (
        <PickerStateContext.Consumer>
            {pickerStateProps => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...pickerStateProps} {...props} ref={ref} />
            )}
        </PickerStateContext.Consumer>
    ));

    WithPickerState.displayName = `withPickerState(${getComponentDisplayName(WrappedComponent)})`;
    return WithPickerState;
}

export {
    PickerStateProvider,
    pickerStatePropTypes,
};
