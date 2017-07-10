const {
    Button,
    TextView,
    ui,
    TabFolder,
    NavigationView,
    Page
} = require('tabris');
let config = require('./config.js');
let interConnection = require('./utils/noconnection.js');
let tabs = require('./utils/tabs.js');
let listItems = require('./utils/list-items.js');
let drawerMenu = require('./utils/drawer.js');
let detail_page = require("./pages/news-details.js");
let drawer = tabris.ui.drawer;
drawer.enabled = true;
//drawer.locked = false;
//https://tabrisjs.com/downloads/nightly-2.x/tabris.tgz
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
drawerMenu.createMenu(drawer, navigationView,shareAction);
//check connection of app
//interConnection.check();
//Main Page
let mainPage = new tabris.Page({
    /*title: config.item.appTitle,*/
    image: {
        src: config.item.appLogo,
        scale: 3
    }
}).appendTo(navigationView);
let tabFolder = new TabFolder({
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
tabFolder.appendTo(mainPage);
window.plugins.OneSignal.startInit().inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification).endInit();
window.plugins.OneSignal.startInit("e07acd71-e6f4-45ab-807e-6af82c1912d4").handleNotificationOpened(function(jsonData) {
    //console.log('didOpenRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
    if (jsonData.notification.payload) {
        let newsDetailPage = detail_page.news_readPage(jsonData.notification.payload.additionalData, shareAction);
        newsDetailPage.title = jsonData.notification.payload.title + ' - News';
        newsDetailPage.appendTo(navigationView);
    }
}).inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None).endInit();

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

//create tabs
let latestNewsTab = tabs.createTab('News', tabFolder);
let worldfootballTab = tabs.createTab('World Football', tabFolder);
let ghPlayersAbroadTab = tabs.createTab('Players Abroad', tabFolder);
let ghPremLeagueTab = tabs.createTab('Ghana Premier League', tabFolder);
let nationalTeamTab = tabs.createTab('National Teams', tabFolder);
let latestVideosTab = tabs.createTab('Videos', tabFolder);
let latestPhotosTab = tabs.createTab('Photos', tabFolder);

listItems.createItems(true, catUrl('latest-news'), config.item.imageSize, config.item.marign, latestNewsTab, 'latestnews_list', navigationView, shareAction);
listItems.createItems(false, catUrl('world-football'), config.item.imageSize, config.item.marign, worldfootballTab, 'worldfootball_list', navigationView, shareAction);
listItems.createItems(false, catUrl('ghana-players-abroad'), config.item.imageSize, config.item.marign, ghPlayersAbroadTab, 'ghplayersabroad_list', navigationView, shareAction);
listItems.createItems(false, catUrl('ghana-prem-league'), config.item.imageSize, config.item.marign, ghPremLeagueTab, 'ghpremleague_list', navigationView, shareAction);
listItems.createItems(false, catUrl('national-teams'), config.item.imageSize, config.item.marign, nationalTeamTab, 'national_teams_list', navigationView, shareAction);
listItems.createItems(false, catUrl('latest-videos'), config.item.imageSize, config.item.marign, latestVideosTab, 'latest_videos_list', navigationView, shareAction);
listItems.createItems(false, catUrl('latest-pictures'), config.item.imageSize, config.item.marign, latestPhotosTab, 'latest_pictures_list', navigationView, shareAction);


window.ga.startTrackerWithId(config.item.googleAnalytics);
window.ga.trackView('Listing Section');
window.ga.setUserId(tabris.app.id);
window.ga.setAppVersion(tabris.app.version);



