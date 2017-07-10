exports.imageLeftBlock = function(parent,title,period,image) {
	let blockBox = new tabris.Composite({
        left: 0,
        top: 0,
        right: 0,
    }).appendTo(parent);

    let imageView = new tabris.ImageView({
        width: 120,
        left: 5,
        bottom: 0,
        top: 0,
        background: '#ccc',
        image: {
            src: image
        },
        scaleMode: 'fill'
    }).appendTo(blockBox);

    let titleView = new tabris.TextView({
        top: 5,
        left: [imageView, 10],
        right: 5,
        markupEnabled: true,
        text:'<b>' + title + '</b>',
        font: "15px Arial, sans-serif",
        textColor: "#000",
    }).appendTo(blockBox);
    let periodView = new tabris.TextView({
        top: [titleView, 10],
        left: [imageView, 10],
        right: 5,
        markupEnabled: true,
        text:'<small>' + period+ '</small>',
        textColor: "#D71A21"
    }).appendTo(blockBox);

    let bottomLine = new tabris.Composite({
    	height:1,
        left: 0,
        top: [periodView,10],
        right: 0,
        background:'rgba(0, 0, 0, 0.1)'
    }).appendTo(blockBox);

    return blockBox;
}
