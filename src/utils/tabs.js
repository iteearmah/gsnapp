const {TabFolder,Tab,ui} = require('tabris');
let config =  require('../config.js');
var tabFolder = new TabFolder({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    background: config.item.primaryBgColor,
    textColor: config.item.primaryColor,
    paging: true,
    tabMode: 'scrollable',
    tabBarLocation: 'auto',
    /*elevation: 4*/
});

exports.createTab = function(title,page) {
    tabFolder.appendTo(page);
    var tabObj = new Tab({
        title: title,
        background: "#fff"
    }).appendTo(tabFolder);
    return tabObj;
};