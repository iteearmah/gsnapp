let config = require('../config.js');
let listItems = require('./list-items.js');
let drawerMenu = require('./drawer-menu.js');
let aboutus = require('../pages/aboutus.js');
let contact = require('../pages/contactus.js');
let settings = require('../pages/settings.js');
exports.createMenu = function(drawer, navigationView, shareAction) {
    //Category Page
    let items = drawerMenu.menuItems();
    let scrollView = new tabris.ScrollView({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        direction: 'vertical',
    }).appendTo(drawer);
    let collectionView = new tabris.CollectionView({
        left: 0,
        top: 0,
        right: 0,
        background: '#ededed',
        itemCount: items.length,
        bottom: config.item.bottom_banner_margin,
        cellType: index => items[index].type,
        cellHeight: (index, type) => {
            type === 'heading' ? 35 : 40
            if (type === 'heading') {
                return 35;
            } else if (type === 'drawerimage') {
                return 200;
            } else {
                return 40;
            }
        },
        createCell: (type) => {
            let cell = new tabris.Composite({
                /*highlightOnTouch: true*/
            });
            if (type === 'heading') {
                return headingcell(cell);
            } else if (type == 'drawerimage') {
                let drawableImageView = new tabris.ImageView({
                    scaleMode: "fill",
                    left: 0,
                    id: 'drawerimage',
                    right: 0,
                    top: 0,
                    height: 200
                }).appendTo(cell);
                return cell;
            } else {
                return initializeStandardCell(cell);
            }
        },
        updateCell: (view, index) => {
            let item = items[index];
            collectionView.itemCount = items.length;
            if (item.type === 'drawerimage' && index == 0) {
                view.find('#drawerimage').set('image', {
                    src: config.item.imagePath + "/drawer_header.jpg"
                });
            } else {
                view.find('#menuImage').set('image', {
                    src: item.image,
                    scaleMode: 1
                });
                view.find('#menuText').set('text', item.title);
                view.find('#drawerMenuHeading').set('text', '<b>' + item.title + '</b>');
            }
        }
    }).on('select', function({
        index
    }) {
        let item = items[index];
        //analytics
        window.ga.startTrackerWithId(config.item.googleAnalytics);
        window.ga.trackView(item.slug);
        window.ga.setUserId(tabris.app.id);
        window.ga.setAppVersion(tabris.app.version);
        if (item.type == 'normal') {
            if (item.slug == 'about') {
                aboutus.show(navigationView);
            } else if (item.slug == 'contact') {
                contact.show(navigationView);
            } else if (item.slug == 'settings') {
                settings.show(navigationView);
            } else {
                let categoryPage = new tabris.Page({
                    title: item.title,
                    image: {
                        src: config.item.imagePath + '/' + config.item.appLogo,
                        scale: 3
                    }
                }).appendTo(navigationView);
                let url = config.item.apiUrl + '/category/' + item.slug;;
                listItems.createItems(true, url, config.item.imageSize, config.item.marign, categoryPage, item.slug + '_list', navigationView, shareAction);
            }
            drawer.close();
        }
    }).appendTo(scrollView);
    /* let drawerBottom = new tabris.Composite({
         height:config.item.bottom_banner_margin,
         left: 0,
         right: 0,
         top: [collectionView, 0],
         background: '#ededed'
     }).appendTo(drawer);*/
    /* let drawerBottomText = new tabris.TextView({
         left: 10,
         right: 0,
         top: 15,
         textColor:'#fff',
         text:config.item.appDomain
     }).appendTo(drawerBottom);*/
    function initializeStandardCell(cell) {
        let imageView = new tabris.ImageView({
            width: 10,
            left: 2,
            bottom: 0,
            top: 0,
            id: 'menuImage',
            left: 10,
            scaleMode: "fit",
        }).appendTo(cell);
        let textView = new tabris.TextView({
            top: 9,
            left: [imageView, 5],
            right: 5,
            id: 'menuText',
            markupEnabled: true,
            /*font: "16px Arial, sans-serif",*/
            textColor: "#000",
        }).appendTo(cell);
        return cell;
    }

    function headingcell(cell) {
        let textView = new tabris.TextView({
            top: 5,
            left: 10,
            right: 5,
            bottom: 5,
            markupEnabled: true,
            textColor: "#fff",
            id: 'drawerMenuHeading'
        }).appendTo(cell);
        cell.background = config.item.primaryBgColor;
        return cell;
    }
}