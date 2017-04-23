let utils = require('../utils/fetchdata.js');
let config = require('../config.js');
exports.news_readPage = function(newsItem, shareAction) {
    shareAction.visible = true;
    let MARGIN_SMALL = 14;
    let MARGIN = 10;
    let INITIAL_TITLE_COMPOSITE_OPACITY = 0.85;
    let newsDetailpage = new tabris.Page({
        title: 'News'
    }).once("resize", function() { // TODO: used "resize" event as workaround for tabris-js#597
        //tabris.ui.set("toolbarVisible", false);
    });
    newsDetailpage.on("appear", function() {
        actionShareVisbility(shareAction, true);
    })
    newsDetailpage.on("disappear", function() {
        actionShareVisbility(shareAction, false);
    });
    let scrollView = new tabris.ScrollView({
        left: 0,
        right: 0,
        top: 0,
        bottom: 50
    }).appendTo(newsDetailpage);
    let imageComposite = new tabris.Composite({
        left: 0,
        right: 0,
        top: 0,
        id: "imageComposite",
    }).appendTo(scrollView);
    let imageView = new tabris.ImageView({
        left: 0,
        top: 0,
        right: 0,
        image: newsItem.image_large,
        scaleMode: "fill"
    }).appendTo(imageComposite);
    let titleComposite = new tabris.Composite({
        left: 0,
        right: 0,
        top: [imageView, 2],
        id: "titleComposite",
    }).appendTo(scrollView);
    let newsTitle = new tabris.TextView({
        left: MARGIN,
        top: MARGIN,
        right: MARGIN,
        markupEnabled: true,
        background: '#fff',
        text: "<b>" + newsItem.title + "</b>",
        font: "22px",
        textColor: "#1e1e1e"
    }).appendTo(titleComposite);
    let periodIcon = new tabris.ImageView({
        width: 20,
        left: 5,
        top: [newsTitle, 8],
        image: config.item.imagePath + '/' + 'ic_time_black_24dp.png',
        scaleMode: "fill"
    }).appendTo(titleComposite);
    let period = new tabris.TextView({
        left: [periodIcon, 5],
        top: [newsTitle, 8],
        right: MARGIN,
        markupEnabled: true,
        text: newsItem.pubDate,
        font: "13px",
        textColor: config.item.primaryColor
    }).appendTo(titleComposite);
    let contentComposite = new tabris.Composite({
        left: 0,
        right: 0,
        top: "#titleComposite",
        background: "white"
    }).appendTo(scrollView);
    let newsArticle = new tabris.TextView({
        left: MARGIN,
        right: MARGIN,
        top: MARGIN,
        markupEnabled: true,
        font: "16px",
    }).appendTo(contentComposite);
    let activityIndicator = new tabris.ActivityIndicator({
        centerX: 0,
        centerY: 0
    }).appendTo(newsDetailpage);
    shareAction.on("select", function() {
        window.plugins.socialsharing.share(newsItem.title, newsItem.title, null, newsItem.link);
    });
    scrollView.on("resize", function({
        height
    }) {
        imageView.height = height / 2;
        let titleCompHeight = titleComposite.height;
        // We need the offset of the title composite in each scroll event.
        // As it can only change on resize, we assign it here.
        titleCompY = Math.min(imageView.height - titleCompHeight, height / 2);
        titleComposite.top = titleCompY;
    });
    scrollView.on("scrollY", function({
        offset
    }) {
        imageView.transform = {
            translationY: Math.max(0, offset * 0.4)
        };
        titleComposite.transform = {
            translationY: Math.max(0, offset - titleCompY)
        };
        let opacity = calculateTitleCompositeOpacity(offset, titleCompY);
        titleComposite.background = '#fff';
    });

    function calculateTitleCompositeOpacity(scrollViewOffsetY, titleCompY) {
        let titleCompDistanceToTop = titleCompY - scrollViewOffsetY;
        let opacity = 1 - (titleCompDistanceToTop * (1 - INITIAL_TITLE_COMPOSITE_OPACITY)) / titleCompY;
        return opacity <= 1 ? opacity : 1;
    }
    let photo2View = new tabris.ImageView({
        left: 0,
        top: 0,
        right: 0,
        scaleMode: "fill"
    }).appendTo(scrollView);
    fetch_newsDetails(newsItem, newsArticle, activityIndicator, contentComposite, titleComposite, period, imageComposite);
    return newsDetailpage;
}

function rgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function displayVideo(newsItem, page) {
    let webview = new tabris.WebView({
        layoutData: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            height: 500
        },
        url: config.item.apiUrl + "/post/" + newsItem.id + "?" + new Date().getTime(),
    }).appendTo(page);
}

function testUrlForMedia(pastedData) {
    let success = false;
    let media = {};
    if (pastedData.match('http://(www.)?youtube|youtu\.be')) {
        if (pastedData.match('embed')) {
            youtube_id = pastedData.split(/embed\//)[1].split('"')[0];
        } else {
            youtube_id = pastedData.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0];
        }
        media.type = "youtube";
        media.id = youtube_id;
        success = true;
    } else if (pastedData.match('http://(player.)?vimeo\.com')) {
        vimeo_id = pastedData.split(/video\/|http:\/\/vimeo\.com\//)[1].split(/[?&]/)[0];
        media.type = "vimeo";
        media.id = vimeo_id;
        success = true;
    } else if (pastedData.match('http://player\.soundcloud\.com')) {
        soundcloud_url = unescape(pastedData.split(/value="/)[1].split(/["]/)[0]);
        soundcloud_id = soundcloud_url.split(/tracks\//)[1].split(/[&"]/)[0];
        media.type = "soundcloud";
        media.id = soundcloud_id;
        success = true;
    }
    if (success) {
        return media;
    } else {
        console.log('No valid media id detected');
    }
    return false;
}

function fetch_newsDetails(newsItem, newsArticle, activityIndicator, contentComposite, titleComposite, period,imageComposite) {
    activityIndicator.visible = true;
    let article = '';
    json_url = config.item.apiUrl + '/post/' + newsItem.id;
    utils.getJSON(json_url).then(function(json) {
        //console.log(json);
        let data = json;
        //console.log(json_url+':'+JSON.stringify(data));
        if (newsItem.category == 'latest-videos_zzz') {
            media = testUrlForMedia(data.article);
            //displayVideo(newsItem.id,contentComposite);
            let videoId = media.id;
            videoId = videoId.replace(/(\?.*)|(#.*)/g, "");
            //console.log(videoId);
            new tabris.Button({
                left: 0,
                top: 10,
                right: 0,
                text: 'Play Video'
            }).on('select', function() {
                YoutubeVideoPlayer.openVideo(videoId);
                //VideoPlayer.play("https://www.youtube.com/watch?v=" + videoId);
            }).appendTo(contentComposite);
            if (videoId) {
                //VideoPlayer.play("https://www.youtube.com/watch?v=" + videoId);
                YoutubeVideoPlayer.openVideo(videoId);
            } else {
                newsArticle.text = 'Video couldn\'t be played. <p><a href="' + newsItem.link + '">Watch in browser</a></p>';
            }
        } else {
            let articleArticle = data.article;
            newsArticle.text = articleArticle;
            if (data.video) {
                if (data.video.videotype == 'youtube' || data.video.videotype == 'twitter') {
                    new tabris.Button({
                        left: 5,
                        top: [period, 30],
                        right: 5,
                        image: {
                            src: config.item.imagePath + '/ic_play_circle_outline_white_48dp.png',
                            height: 50,
                        },
                        background: '#B70404',
                        textColor: '#fff',
                        text: 'Watch Video'
                    }).on('select', function() {
                        if (data.video.videotype == 'youtube') {
                            //youtud video
                            YoutubeVideoPlayer.openVideo(data.video.videoid);
                        } else if (data.video.videotype == 'twitter') {
                            //twitter video
                            cordova.InAppBrowser.open(config.item.apiUrl + '/video?type=twitter&videoid=' + data.video.videoid, '_blank', 'location=no', 'zoom=no');
                        }
                    }).appendTo(titleComposite);
                }
               /* let videoPlayIcon = new tabris.ImageView({
                    centerX: 0,
                    centerY: 0,
                    image: {
                        src: config.item.imagePath + '/ic_play_circle_outline_white_48dp.png',
                        height: 50,
                    },
                }).appendTo(imageComposite);*/
            }
            if (data.photos) {
                for (let i = 0; i < data.photos.length; i++) {
                    createphotos(data.photos[i], contentComposite, i);
                }
            }
        }
        activityIndicator.visible = false;
        //console.log(data.photos[0]);
    });
}

function actionShareVisbility(shareAction, isVisible) {
    shareAction.visible = isVisible;
}

function createphotos(photoSrc, wParent, photoIndex) {
    let photoView = new tabris.ImageView({
        left: 0,
        top: ["prev()", 5],
        right: 0,
        scaleMode: "fill",
        image: {
            src: photoSrc
        },
        id: 'photo_' + photoIndex
    }).appendTo(wParent);
    return photoView;
}

function videoBox(wParent, src) {
    var video = new tabris.Video({
        left: 0,
        top: ["prev()", 5],
        right: 0,
        url: 'https://cdn.video.playwire.com/18132/videos/5396570/video-sd.mp4',
        controlsVisible: true
    }).appendTo(wParent);
}