let config = require('../config.js');
exports.show = function(navigationView) {
    let pageTitle = 'Settings - ' + config.item.appTitle;
    let page = new tabris.Page({
        title: pageTitle
    });
    let scrollView = new tabris.ScrollView({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }).appendTo(page);
    let notification = settingsRow('notification', 'Notification');
    notification.appendTo(scrollView);
    page.appendTo(navigationView);
}

function settingsRow(compositeId, label) {
    let settingKey = 'settings_' + compositeId;
    let settings_value = false;
    settings_value=localStorage.getItem(settingKey);
    if (localStorage.getItem(settingKey) === null) {
        settings_value = true;
    }
    settings_value=JSON.parse(settings_value);
    let row = new tabris.Composite({
        height: 45,
        left: 0,
        right: 0,
        top: 5,
        id: compositeId,
    });
    let labelTextView = new tabris.TextView({
        left: 10,
        right: 5,
        top: 10,
        text: label
    }).appendTo(row);
    let settingCheck = new tabris.Switch({
        top: 7,
        right: 5,
        thumbOnColor: config.item.primaryBgColor,
        id: 'switch_' + compositeId,
        checked: settings_value
    }).on('change:checked', function({
        value: checked
    }) {
        settings_value = checked;
        localStorage.setItem(settingKey, settings_value);
        OnOffNotification(compositeId,settings_value);
    }).appendTo(row);
    let bottomline = new tabris.Composite({
        left: 0,
        top: [settingCheck, 8],
        right: 0,
        height: 1,
        background: '#f0f0f0'
    }).appendTo(row);
    return row;
}

function OnOffNotification(compositeId,settings_value)
{
    if(compositeId=='notification')
    {
        window.plugins.OneSignal.setSubscription(settings_value);
    }
}