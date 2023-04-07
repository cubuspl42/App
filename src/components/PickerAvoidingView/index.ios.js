/* eslint-disable react/no-unused-state */
import React from 'react';
import {View} from 'react-native';
import themeColors from '../../styles/themes/default';
import withPickerState from '../withPickerState';

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    top: {
        flex: 1,
    },
    bottom: {
        height: 260,
        backgroundColor: themeColors.appBG,
    },
};

function PickerAvoidingView(props) {
    return (
        <View style={styles.container}>
            <View style={styles.top}>
                {props.children}
            </View>
            {props.isPickerShown && <View style={styles.bottom} />}
        </View>
    );
}

export default withPickerState(PickerAvoidingView);
