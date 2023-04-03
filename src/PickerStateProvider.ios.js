import React from 'react';
import {View} from 'react-native';
import PickerContext from './PickerContext';

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
        height: 300,
        // height: 0,
    },
};

function PickerStateProvider(props) {
    const [isPickerOpen, setPickerOpen] = React.useState(false);

    return (
        <PickerContext.Provider value={{setPickerOpen}}>
            <View style={styles.wrapper}>
                <View style={styles.main}>
                    {props.children}
                </View>
                {isPickerOpen && <View style={styles.space} />}
            </View>
        </PickerContext.Provider>
    );
}

export default PickerStateProvider;
