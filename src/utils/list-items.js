let loadFeed = require("./load.feed.js");
let utils = require("./fetchdata.js");
let detail_page = require("../pages/news-details.js");
let config = require('../config.js');
exports.createItems = function(firstsection = false, json_url, image_size, margin, target_page, storage_key, navigationView,shareAction) {
    localStorage.setItem('current_page_' + storage_key, 1);
    let collectionView = new tabris.CollectionView({
        left: 0,
        top: 0,
        right: 0,
        bottom: config.item.bottom_banner_margin,
        refreshEnabled: true,
        itemHeight: 110,
        id: storage_key,
        cellType: function(item) {
            return item.loading ? 'loading' : 'normal';
        },
        initializeCell: function(cell, type) {
            cell.highlightOnTouch = true;
            if (type === 'loading') {
                initializeLoadingCell(cell);
            } else {
                initializeStandardCell(cell, image_size, margin);
            }
        }
    });

    collectionView.on("refresh", function() {
        loadFeed.fetch_newslist(collectionView, json_url, storage_key);
    }).appendTo(target_page);
    if (firstsection == true) {
        loadFeed.fetch_newslist(collectionView, json_url, storage_key);
    } else {
        loadFeed.fetch_other_newslist(collectionView, json_url, storage_key);
    }
    collectionView.on('scroll', function({
        target,
        deltaY
    }) {
        if (deltaY > 0) {
            var remaining = target.items.length - target.lastVisibleIndex;
            if (remaining < 5) {
                loadFeed.loadNewItems(collectionView, json_url, storage_key);
            }
        }
    }).on('select', function({
        item
    }) {
        var newsDetailPage = detail_page.news_readPage(item,shareAction);
        newsDetailPage.title = item.title + ' - News';
        newsDetailPage.appendTo(navigationView);
    }).appendTo(target_page);
}

function initializeLoadingCell(cell) {
    new tabris.TextView({
        left: 12,
        right: 12,
        centerY: 0,
        alignment: 'center',
        text: 'loading ...'
    }).appendTo(cell);
}

function initializeStandardCell(cell, image_size, margin) {
    let imageView = new tabris.ImageView({
        left: 5,
        top: 5,
        width: image_size,
        bottom: 10,
        scaleMode: "fill"
    }).appendTo(cell);
    let titleView = new tabris.TextView({
        top: 5,
        left: [imageView, margin],
        right: 5,
        markupEnabled: true,
        font: "15px Arial, sans-serif",
        textColor: "#000",
    }).appendTo(cell);
    let periodView = new tabris.TextView({
        top: [titleView, 10],
        left: [imageView, margin],
        right: 5,
        markupEnabled: true,
        textColor: "#ffb400"
    }).appendTo(cell);
    let bottomline = new tabris.Composite({
        left: 0,
        top: [imageView, 7],
        right: 0,
        height: 1,
        background: '#f0f0f0'
    }).appendTo(cell);
    cell.on('change:item', function({
        value: newsItems
    }) {
        imageView.image = {
            src: newsItems.image
        };
        titleView.text = '<b>' + newsItems.title + '</b>';
        periodView.text = '<small>' + newsItems.pubDate + '</small>';
    });
}