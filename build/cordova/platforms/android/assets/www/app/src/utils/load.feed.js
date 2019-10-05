let utils = require('./fetchdata.js');
exports.getNewsList = function(json_url, image_size, margin, targt_page, collectionView_News, storage_key = 'news_list', detail_page = '') {
    let scrollPosition = 0;
    localStorage.setItem('current_page_' + storage_key, 1);
    collectionView_News.on("refresh", function() {
        fetch_newslist(collectionView_News, json_url, storage_key);
    }).appendTo(targt_page);
    collectionView_News.on("scroll", function(view, scroll) {
        if (scroll.deltaY > 0) {
            let totalItems = parseInt(view.get("items").length);
            let remaining = totalItems - parseInt(view.get("lastVisibleIndex"));
            if (remaining == 1) {
                console.log(' items count' + view.get("items").length + ' | lastVisibleIndex: ' + view.get("lastVisibleIndex"));
                loadNewItems(collectionView_News, json_url, storage_key);
            }
        }
    });
}

function fetch_newslist(view, json_url, key) {
    utils.getJSON(json_url).then(function(json) {
        localStorage.setItem(key, JSON.stringify(json));
        load_news(view, json, key);
    });
}
exports.loadNewItems = function(view, json_url, key) {
    itemsView = view.get("items");
    //page=parseInt(itemsView[itemsView.length-1].page);
    current_page = localStorage.getItem('current_page_' + key);
    current_page++;
    //console.log('current_page: '+current_page);
    localStorage.setItem('current_page_' + key, current_page);
    json_url = json_url + '?page=' + current_page;
    // console.log('news '+json_url);
    utils.getJSON(json_url).then(function(json) {
        //localStorage.setItem(key, JSON.stringify(json));
        view.insert(json.items);
    });
}
exports.fetch_newslist = function(collectionView, json_url, key) {
    utils.getJSON(json_url).then(function(json) {
        items = json.items;
         collectionView.insert(0, items.length);
        //console.log(JSON.stringify(items));
        collectionView.itemCount = items.length;
        return items;
    });
}
exports.fetch_other_newslist = function(collectionView, json_url, key) {
    collectionView.refreshIndicator = true;
    utils.getJSON(json_url).then(function(json) {
        //console.log(JSON.stringify(json.items));
        items = json.items;
        collectionView.itemCount = items.length;
        collectionView.refreshIndicator = false;
        return items;
        //localStorage.setItem(key, JSON.stringify(json));
    });
}

function load_news(collectionView, newsData, key) {
    // newsitems = JSON.parse(localStorage.getItem(key));
    items = newsData;
    collectionView.itemCount = items.length;
    collectionView.refreshIndicator = false;
}

function load_topNews(newsData, key, topStoryImage, topStoryTitle) {
    newsitems = JSON.parse(localStorage.getItem(key));
    newsitems = newsData.items;
    topStoryImage.set("image", {
        src: newsitems[0].image
    });
    topStoryTitle.set("title", "<b>" + newsitems[0].title + "</b>");
    //console.log(newsitems[0].title);
}
/////////////////////////////////////////
exports.getNewsItems = function(json_url, key) {
    utils.getJSON(json_url).then(function(json) {
        load_news(view, json, key);
    });
}