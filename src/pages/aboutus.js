let config = require('../config.js');
let utils = require('../utils/fetchdata.js');
exports.show = function(navigationView) {
    let pageTitle = 'About Us - ' + config.item.appTitle;
    let page = new tabris.Page({
        title: pageTitle
    });
    let scrollView = new tabris.ScrollView({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }).appendTo(page);
    let imageView = new tabris.ImageView({
        left: 0,
        top: 0,
        right: 0,
        height: 100,
        image: {
            src: config.item.imagePath + '/' + config.item.appLogo,
            scale: 2
        },
        scaleMode: "none"
    }).appendTo(scrollView);
    let pageContentBox = new tabris.TextView({
        left: 5,
        right: 5,
        top: [imageView,5],
        bottom: config.item.bottom_banner_margin,
        markupEnabled: true
    }).appendTo(scrollView);
    let activityIndicator = new tabris.ActivityIndicator({
        centerX: 0,
        centerY: 0
    }).appendTo(page);
    page.appendTo(navigationView);
    let url=config.item.apiUrl + '/post/about-us';
    //console.log(url);
    utils.getJSON(url).then(function(json) {
        activityIndicator.visible = true;
        pageContentBox.text = json.article;
        activityIndicator.visible = false;
    });
}