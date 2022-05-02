import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';
import * as Expensicons from './Icon/Expensicons';

const propTypes = {
    /** Source for the avatar. Can be a URL or an icon. */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue' */
    fill: PropTypes.string,
};

const defaultProps = {
    source: null,
    imageStyles: [],
    containerStyles: [],
    size: CONST.AVATAR_SIZE.DEFAULT,
    fill: themeColors.icon,
};

class Avatar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isErrorFetchingImage: false,
        };
    }

    render() {
        if (!this.props.source) {
            return null;
        }

        const imageStyle = [
            StyleUtils.getAvatarStyle(this.props.size),
            ...this.props.imageStyles,
        ];

        const iconSize = StyleUtils.getAvatarSize(this.props.size);
        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {_.isFunction(this.props.source) || this.state.isErrorFetchingImage
                    ? (
                        <Icon
                            src={this.state.isErrorFetchingImage ? Expensicons.FallbackAvatar : this.props.source}
                            fill={this.state.isErrorFetchingImage ? themeColors.offline : this.props.fill}
                            height={iconSize}
                            width={iconSize}
                        />
                    )
                    : (
                        <Image source={{uri: this.props.source}} style={imageStyle} onError={() => this.setState({isErrorFetchingImage: true})} />
                    )}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
