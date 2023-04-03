import React from 'react';
import {ScrollView, View} from 'react-native';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

const ScrollContext = React.createContext();

// eslint-disable-next-line react/forbid-foreign-prop-types
const propTypes = ScrollView.propTypes;

const styles = {
    wrapper: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    main: {
        flex: 1,
    },
    space: {
        height: 260,
        // height: 0,
    },
};

/*
* <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
* <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
* if it contains one or more <Picker /> / <RNPickerSelect /> components.
* Using this wrapper will automatically handle scrolling to the picker's <TextInput />
* when the picker modal is opened
*/
class ScrollViewWithContext extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentOffsetY: 0,
            isPickerOpen: false,
        };
        this.scrollViewRef = this.props.innerRef || React.createRef(null);

        this.setContextScrollPosition = this.setContextScrollPosition.bind(this);
        this.setPickerOpen = this.setPickerOpen.bind(this);
    }

    setContextScrollPosition(event) {
        if (this.props.onScroll) {
            this.props.onScroll(event);
        }
        this.setState({contentOffsetY: event.nativeEvent.contentOffset.y});
    }

    setPickerOpen(isPickerOpen) {
        this.setState({
            isPickerOpen,
        });
    }

    render() {
        return (
            <ScrollView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.scrollViewRef}
                onScroll={this.setContextScrollPosition}
                scrollEventThrottle={this.props.scrollEventThrottle || MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
            >
                <ScrollContext.Provider
                    value={{
                        scrollViewRef: this.scrollViewRef,
                        contentOffsetY: this.state.contentOffsetY,
                        setPickerOpen: this.setPickerOpen,
                    }}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.main}>
                            {this.props.children}
                        </View>
                        {this.state.isPickerOpen && <View style={styles.space} />}
                    </View>
                </ScrollContext.Provider>
            </ScrollView>
        );
    }
}
ScrollViewWithContext.propTypes = propTypes;

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScrollViewWithContext {...props} innerRef={ref} />
));

export {
    ScrollContext,
};
