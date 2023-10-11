import React, {memo} from 'react';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import reportActionFragmentPropTypes from '../reportActionFragmentPropTypes';
import styles from '../../../../styles/styles';
import variables from '../../../../styles/variables';
import themeColors from '../../../../styles/themes/default';
import Text from '../../../../components/Text';
import * as EmojiUtils from '../../../../libs/EmojiUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import compose from '../../../../libs/compose';
import convertToLTR from '../../../../libs/convertToLTR';
import CONST from '../../../../CONST';
import editedLabelStyles from '../../../../styles/editedLabelStyles';
import RenderCommentHTML from './RenderCommentHTML';

const propTypes = {
    /** The reportAction's source */
    source: PropTypes.oneOf(['Chronos', 'email', 'ios', 'android', 'web', 'email', '']).isRequired,

    /** The message fragment needing to be displayed */
    fragment: reportActionFragmentPropTypes.isRequired,

    /** Should this message fragment be styled as deleted? */
    styleAsDeleted: PropTypes.bool.isRequired,

    /** Text of an IOU report action */
    iouMessage: PropTypes.string,

    /** Additional styles to add after local styles. */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]).isRequired,

    ...windowDimensionsPropTypes,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    iouMessage: undefined,
};

function TextCommentFragment(props) {
    const {fragment, styleAsDeleted} = props;
    const {html, text} = fragment;

    // If the only difference between fragment.text and fragment.html is <br /> tags
    // we render it as text, not as html.
    // This is done to render emojis with line breaks between them as text.
    const differByLineBreaksOnly = Str.replaceAll(html, '<br />', '\n') === text;

    // Only render HTML if we have html in the fragment
    if (!differByLineBreaksOnly) {
        const editedTag = fragment.isEdited ? `<edited ${styleAsDeleted ? 'deleted' : ''}></edited>` : '';
        const htmlContent = styleAsDeleted ? `<del>${html}</del>` : html;

        const htmlWithTag = editedTag ? `${htmlContent}${editedTag}` : htmlContent;

        return (
            <RenderCommentHTML
                source={props.source}
                html={htmlWithTag}
            />
        );
    }

    const containsOnlyEmojis = EmojiUtils.containsOnlyEmojis(text);

    return (
        <Text style={[containsOnlyEmojis ? styles.onlyEmojisText : undefined, styles.ltr, ...props.style]}>
            <Text
                selectable={!DeviceCapabilities.canUseTouchScreen() || !props.isSmallScreenWidth}
                style={[containsOnlyEmojis ? styles.onlyEmojisText : undefined, styles.ltr, ...props.style, styleAsDeleted ? styles.offlineFeedback.deleted : undefined]}
            >
                {convertToLTR(props.iouMessage || text)}
            </Text>
            {Boolean(fragment.isEdited) && (
                <>
                    <Text
                        selectable={false}
                        style={[containsOnlyEmojis ? styles.onlyEmojisTextLineHeight : undefined, styles.userSelectNone]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        {' '}
                    </Text>
                    <Text
                        fontSize={variables.fontSizeSmall}
                        color={themeColors.textSupporting}
                        style={[editedLabelStyles, styleAsDeleted ? styles.offlineFeedback.deleted : undefined, ...props.style]}
                    >
                        {props.translate('reportActionCompose.edited')}
                    </Text>
                </>
            )}
        </Text>
    );
}

TextCommentFragment.propTypes = propTypes;
TextCommentFragment.defaultProps = defaultProps;
TextCommentFragment.displayName = 'TextCommentFragment';

export default compose(withWindowDimensions, withLocalize)(memo(TextCommentFragment));