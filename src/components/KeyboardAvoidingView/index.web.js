import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent, View} from 'react-native';
import _ from 'underscore';

const KeyboardAvoidingView = (props) => {
    const viewProps = _.omit(props, ['behavior', 'contentContainerStyle', 'enabled', 'keyboardVerticalOffset']);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View dataSet={props.shouldDisableAutoScroll && {autoscroll: 'none'}} {...viewProps} />
    );
};

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
