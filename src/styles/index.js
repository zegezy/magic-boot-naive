import {Menu} from '@/styles/override/menu';
import {LoadingBar} from "@/styles/override/loading-bar";
import {CommonStyle} from "@/styles/override/commonStyle";


/**
 * @type import('naive-ui').GlobalThemeOverrides
 */
export const lightThemeOverrides = {
    Menu: Menu,
    LoadingBar: LoadingBar,
    common: CommonStyle
}