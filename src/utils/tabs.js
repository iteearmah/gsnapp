const {
    Tab,
    ui
} = require('tabris');
let config = require('../config.js');
exports.createTab = function(title, tabFolder) {
    var tabObj = new Tab({
        title: title,
        background: "#fff"
    }).appendTo(tabFolder);
    return tabObj;
};