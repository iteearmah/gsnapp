let loadFeed = require("./load.feed.js");
let utils = require("./fetchdata.js");
let detail_page = require("../pages/news-details.js");
let config = require('../config.js');
exports.createItems = function(firstsection = false, json_url, image_size, margin, target_page, tabID, navigationView) {
    let loading;
    let items = [];
    localStorage.setItem('current_page_' + tabID, 1);
    let collectionView = new tabris.CollectionView({
        left: 0,
        top: 0,
        right: 0,
        bottom: config.item.bottom_banner_margin,
        background: '#f5f5f5',
        refreshEnabled: true,
        cellHeight: (index, type) => {
            return items[index].loading ? 0 : 130;
        },
        id: tabID,
        cellType: index => items[index].loading ? 'loading' : 'normal',
        createCell: (type) => {
            if (type === 'normal') {
                return createItemCell(image_size, margin, tabID, detail_page, navigationView);
            }
            return createLoadingCell();
            //return createItemCell(image_size, margin, tabID);
        },
        updateCell: (view, index) => {
            let item = items[index];
            //console.log(JSON.stringify(item.title));
            if (!(item.loading)) {
                view.find('#' + tabID + '_container').first().item = item;
                view.find('#' + tabID + '_thumbImage').set('image', {
                    src: item.image
                });
                view.find('#' + tabID + '_titleView').set('text', '<b>' + item.title + '</b>');
                view.find('#' + tabID + '_periodView').set('text', '<small>' + item.pubDate + '</small>');
                collectionView.refreshIndicator = false;
            }
        }
    });
    collectionView.on("refresh", function() {
        loadNewItems(collectionView, json_url, tabID);
        loadInitialItems(collectionView, json_url);
    }).appendTo(target_page);
    if (firstsection == true) {
        loadInitialItems(collectionView, json_url, tabID);
    } else {
        loadInitialItems(collectionView, json_url, tabID);
    }
    collectionView.on('scroll', ({
        target: scrollView,
        deltaY
    }) => {
        if (deltaY > 0) {
            if (deltaY > 0) {
                //console.log("ScrollItems: "+items.length);
                let remaining = items.length - scrollView.lastVisibleIndex;
                //console.log('remaining: '+remaining);
                if (remaining <= 1) {
                    loadMoreItems(collectionView, json_url, tabID);
                }
            }
        }
    }).appendTo(target_page);
    collectionView.on('select', function({
        index
    }) {
        /*let item = items[index];
        //console.log('selected', items[index].title);
        let newsDetailPage = detail_page.news_readPage(item);
        newsDetailPage.title = item.title;
        newsDetailPage.appendTo(navigationView);*/
    }).appendTo(target_page);

    function loadInitialItems(collectionView, json_url) {
        collectionView.refreshIndicator = true;
        utils.getJSON(json_url).then(json => {
            items = json.items;
            collectionView.itemCount = json.items.length;
            collectionView.refreshIndicator = false;
            //console.log('ITEM LENGTH: ' + items.length);
            return items;
        });
    }

    function createLoadingCell() {
        /* return new tabris.TextView({
             centerY: 0,
             id:'loading',
             alignment: 'center',
             text: 'Loading...'
         });*/
        return new tabris.Composite();
    }

    function createDetailsPage(item, detail_page, navigationView) {
        //console.log(JSON.stringify(item));
        let newsDetailPage = detail_page.news_readPage(item);
        newsDetailPage.title = item.title;
        newsDetailPage.appendTo(navigationView);
    }

    function createItemCell(image_size, margin, tabID, detail_page, navigationView) {
        let cell = new tabris.Composite();
        let container = new tabris.Composite({
            id: tabID + '_container',
            left: 10,
            right: 10,
            top: 5,
            bottom: 5,
            cornerRadius: 2,
            elevation: 2,
            background: 'white',
            highlightOnTouch: true
        }).appendTo(cell);
        container.on('tap', ({
            target: view
        }) => createDetailsPage(view.item, detail_page, navigationView))
        let imageView = new tabris.ImageView({
            left: 5,
            top: 5,
            width: image_size,
            id: tabID + '_thumbImage',
            bottom: 10,
            scaleMode: "fill"
        }).appendTo(container);
        let titleView = new tabris.TextView({
            top: 5,
            left: [imageView, margin],
            id: tabID + '_titleView',
            right: 5,
            markupEnabled: true,
            font: "15px Arial, sans-serif",
            textColor: "#000",
        }).appendTo(container);
        let periodView = new tabris.TextView({
            top: [titleView, 10],
            id: tabID + '_periodView',
            left: [imageView, margin],
            right: 5,
            markupEnabled: true,
            textColor: "#ffb400"
        }).appendTo(container);
        /*let bottomline = new tabris.Composite({
            left: 0,
            id: tabID + '_bottomline',
            top: [imageView, 7],
            right: 0,
            height: 1,
            background: '#f0f0f0'
        }).appendTo(container);*/
        return cell;
    }

    function loadNewItems(collectionView, json_url, tabID) {
        if (!loading) {
            loading = true;
            utils.getJSON(json_url).then(json => {
                loading = false;
                collectionView.refreshIndicator = false;
                if (json.items.length > 0) {
                    collectionView.insert(0, json.items.length);
                    collectionView.reveal(0);
                }
            });
        }
    }

    function loadMoreItems(collectionView, json_url, tabID) {
        if (!loading) {
            loading = true;
            window.plugins.toast.showShortBottom('Loading...');
            items.push({
                loading: true
            });
            collectionView.insert(items.length, 1);
            let pageUrl = '';
            current_page = localStorage.getItem('current_page_' + tabID);
            current_page++;
            //console.log('LoadingMore:'+current_page);
            localStorage.setItem('current_page_' + tabID, current_page);
            pageUrl = json_url + '?page=' + current_page;
            utils.getJSON(pageUrl).then(json => {
                loading = false;
                // remove placeholder item
                items.splice(collectionView.lastVisibleIndex - 1, 1);
                collectionView.remove(-1);
                // insert new items
                let insertionIndex = json.items.length;
                items = items.concat(json.items);
                collectionView.insert(insertionIndex, json.items.length - 1);
            });
        }
    }
}