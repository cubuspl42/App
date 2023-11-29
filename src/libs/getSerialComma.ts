import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type Locale = ValueOf<typeof CONST.LOCALES>;

export default function getSerialComma(locale: Locale): string | undefined {
    if (locale === CONST.LOCALES.EN) {
        return ',';
    }

    return undefined;
}
