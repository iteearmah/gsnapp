let loadFeed = require("./load.feed.js");
let utils = require("./fetchdata.js");
let detail_page = require("../pages/news-details.js");
let config = require('../config.js');
exports.createItems = function(firstsection = false, json_url, image_size, margin, target_page, tabID, navigationView, shareAction) {
    localStorage.setItem('current_page_' + tabID, 1);
    let loading;
    let items = [];
    let collectionView = new tabris.CollectionView({
        left: 0,
        top: 0,
        right: 0,
        bottom: config.item.bottom_banner_margin,
        refreshEnabled: true,
        cellHeight: 110,
        id: tabID,
        createCell: (type) => {
            let cell = new tabris.Composite({
                cornerRadius: 2,
                background: 'white',
                elevation: 2,
                highlightOnTouch: true
            });
            //console.log('tabID:' + tabID);
            return initializeStandardCell(cell, image_size, margin, tabID);
        },
        updateCell: (view, index) => {
            utils.getJSON(json_url).then(function(json) {
                localStorage.setItem('current_page_' + tabID, 1);
                items = json.items;
                collectionView.itemCount = items.length;
                let item = items[index];
                //view.find('#' + tabID).first().item = item;
                view.find('#' + tabID + '_thumbImage').set('image', {
                    src: item.image
                });
                view.find('#' + tabID + '_titleView').set('text', '<b>' + item.title + '</b>');
                view.find('#' + tabID + '_periodView').set('text', '<small>' + item.pubDate + '</small>');
                collectionView.refreshIndicator = false;
            });
        }
    });
    collectionView.on("refresh", function() {}).appendTo(target_page);
    if (firstsection == true) {
        loadInitialItems(collectionView, json_url);
    } else {
        loadInitialItems(collectionView, json_url);
    }
    collectionView.on('scroll', ({
        target: scrollView,
        deltaY
    }) => {
        if (deltaY > 0) {
            if (deltaY > 0) {
                let remaining = items.length - scrollView.lastVisibleIndex;
                if (remaining < 5) {
                    let pageUrl = '';
                    current_page = localStorage.getItem('current_page_' + tabID);
                    current_page++;
                    localStorage.setItem('current_page_' + tabID, current_page);
                    pageUrl = json_url + '?page=' + current_page;
                    //console.log(pageUrl);
                    utils.getJSON(pageUrl).then(function(json) {
                        //localStorage.setItem(key, JSON.stringify(json));
                        let insertionIndex = items.length;
                        items = items.concat(json.items);
                        collectionView.insert(insertionIndex, json.items.length);
                    });
                }
            }
        }
    }).appendTo(target_page);
    collectionView.on('select', function({
        index
    }) {
        let item = items[index];
        //console.log('selected', items[index].title);
        let newsDetailPage = detail_page.news_readPage(item, shareAction);
        newsDetailPage.title = item.title;
        newsDetailPage.appendTo(navigationView);
    }).appendTo(target_page);
}

function loadInitialItems(collectionView, json_url) {
    collectionView.refreshIndicator = true;
    utils.getJSON(json_url).then(function(json) {
        items = json.items;
        collectionView.itemCount = items.length;
        collectionView.refreshIndicator = false;
        //console.log('ITEM LENGTH: ' + items.length);
        return items;
    });
}

function initializeLoadingCell(cell) {
    new tabris.TextView({
        left: 12,
        right: 12,
        centerY: 0,
        alignment: 'center',
        text: 'loading ...'
    }).appendTo(cell);
    return cell;
}

function initializeStandardCell(cell, image_size, margin, tabID) {
    let imageView = new tabris.ImageView({
        left: 5,
        top: 5,
        width: image_size,
        id: tabID + '_thumbImage',
        bottom: 10,
        scaleMode: "fill"
    }).appendTo(cell);
    let titleView = new tabris.TextView({
        top: 5,
        left: [imageView, margin],
        id: tabID + '_titleView',
        right: 5,
        markupEnabled: true,
        font: "15px Arial, sans-serif",
        textColor: "#000",
    }).appendTo(cell);
    let periodView = new tabris.TextView({
        top: [titleView, 10],
        id: tabID + '_periodView',
        left: [imageView, margin],
        right: 5,
        markupEnabled: true,
        textColor: "#ffb400"
    }).appendTo(cell);
    let bottomline = new tabris.Composite({
        left: 0,
        id: tabID + '_bottomline',
        top: [imageView, 7],
        right: 0,
        height: 1,
        background: '#f0f0f0'
    }).appendTo(cell);
    return cell;
}