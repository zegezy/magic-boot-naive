import * as NaiveUI from 'naive-ui'
import common from '@/scripts/common'

export function setupNaiveDiscreteApi() {
    const {message, dialog, notification, loadingBar} = NaiveUI.createDiscreteApi(
        ['message', 'dialog', 'notification', 'loadingBar']
    );
    window['$message'] = message;
    window['$dialog'] = dialog;
    window['$notification'] = notification;
    window['$loading'] = loadingBar;
    window['$common'] = common
}
