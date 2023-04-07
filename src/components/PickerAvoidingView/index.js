/*
 * The PickerAvoidingView is only used on ios
 */
import React from 'react';
import {View} from 'react-native';

const PickerAvoidingView = (props) => {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...props} />
    );
};

PickerAvoidingView.displayName = 'PickerAvoidingView';

export default PickerAvoidingView;
