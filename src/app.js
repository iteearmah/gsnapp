const {
    Button,
    TextView,
    ui,
    NavigationView,
    Page
} = require('tabris');
let config = require('./config.js');
let interConnection = require('./utils/noconnection.js');
let tabs = require('./utils/tabs.js');
let listItems = require('./utils/list-items.js');
let drawerMenu = require('./utils/drawer.js');
let drawer = tabris.ui.drawer;
drawer.enabled = true;
//drawer.locked = false;
ui.statusBar.background = config.item.primaryBgColor; //set statusbar color
let navigationView = new NavigationView({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    toolbarColor: config.item.primaryBgColor,
    drawerActionVisible: true,
}).appendTo(ui.contentView);

function catUrl(category = 'latest-news') {
    return config.item.apiUrl + '/category/' + category;
}
var shareAction = new tabris.Action({
    id: "shareaction",
    title: "Share",
    visible: false,
    image: {
        src: config.item.imagePath + "/ic_share_white_48dp.png",
        scale: 3
    }
}).appendTo(navigationView);
drawerMenu.createMenu(drawer, navigationView, shareAction);
//check connection of app
//interConnection.check();
//Main Page
let mainPage = new tabris.Page({
    /*title: config.item.appTitle,*/
    image: {
        src: config.item.imagePath + '/' + config.item.appLogo,
        scale: 3
    }
}).appendTo(navigationView);
//create tabs
let latestNewsTab = tabs.createTab('News', mainPage);
let worldfootballTab = tabs.createTab('World Football', mainPage);
let ghPlayersAbroadTab = tabs.createTab('Players Abroad', mainPage);
let ghPremLeagueTab = tabs.createTab('Ghana Premier League', mainPage);
let nationalTeamTab = tabs.createTab('National Teams', mainPage);
let latestPhotosTab = tabs.createTab('Photos', mainPage);
//let latestVideosTab = tabs.createTab('Videos', mainPage);
//Tab listings
window.plugins.OneSignal.startInit("e07acd71-e6f4-45ab-807e-6af82c1912d4").inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification).endInit();
admob.initAdmob(config.item.bottom_banner, config.item.Interstitial);
admob.cacheInterstitial(); // load admob Interstitial
admob.showBanner(admob.BannerSize.SMART_BANNER, admob.Position.BOTTOM_CENTER);
let adTimer;
adTimer = setInterval(function() {
        admob.cacheInterstitial(); // load admob Interstitial
        admob.isInterstitialReady(function(isReady) {
            admob.showInterstitial();
        });
        //window.plugins.toast.showLongBottom('Main');
    }, (1000 * 60) * 2);

tabris.app.on('foreground', function() {
    adTimer = setInterval(function() {
        admob.cacheInterstitial(); // load admob Interstitial
        admob.isInterstitialReady(function(isReady) {
            admob.showInterstitial();
        });
        //window.plugins.toast.showLongBottom('foreground mode one');
    }, (1000 * 60) * 2);
}).on('pause', function() {
    clearInterval(adTimer);
});
/*admob.setOptions({
    overlap: true,
});
admob.banner.config({
    id: config.item.bottom_banner,
})
// Create banner
admob.banner.prepare();
// Show the banner
admob.banner.show();
admob.interstitial.config({
    id: config.item.Interstitial,
})
let adTimer;
adTimer = setInterval(function() {
    admob.interstitial.prepare();
    admob.interstitial.show()
    //window.plugins.toast.showLongBottom('Main');
}, (1000 * 60) * 2);
tabris.app.on('foreground', function() {
    adTimer = setInterval(function() {
        admob.interstitial.prepare();
        admob.interstitial.show();
        //window.plugins.toast.showLongBottom('foreground mode one');
    }, (1000 * 60) * 2);
}).on('pause', function() {
    clearInterval(adTimer);
});*/


listItems.createItems(true, catUrl('latest-news'), config.item.imageSize, config.item.marign, latestNewsTab, 'lateestnews_list', navigationView, shareAction);
listItems.createItems(false, catUrl('world-football'), config.item.imageSize, config.item.marign, worldfootballTab, 'worldfootball_list', navigationView, shareAction);
listItems.createItems(false, catUrl('ghana-players-abroad'), config.item.imageSize, config.item.marign, ghPlayersAbroadTab, 'ghplayersabroad_list', navigationView, shareAction);
listItems.createItems(false, catUrl('ghana-prem-league'), config.item.imageSize, config.item.marign, ghPremLeagueTab, 'ghpremleague_list', navigationView, shareAction);
listItems.createItems(false, catUrl('national-teams'), config.item.imageSize, config.item.marign, nationalTeamTab, 'national_teams_list', navigationView, shareAction);
listItems.createItems(false, catUrl('latest-pictures'), config.item.imageSize, config.item.marign, latestPhotosTab, 'latest_pictures_list', navigationView, shareAction);