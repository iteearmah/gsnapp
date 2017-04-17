let config = require('../config.js');
let listItems = require('./list-items.js');
let drawerMenu = require('./drawer-menu.js');
let aboutus = require('../pages/aboutus.js');
let contact = require('../pages/contactus.js');
let settings = require('../pages/settings.js');
exports.createMenu = function(drawer, navigationView, shareAction) {
    //Category Page
    let drawableImageView = new tabris.ImageView({
        image: config.item.imagePath + "/drawer_header.jpg",
        scaleMode: "fill",
        left: 0,
        right: 0,
        top: 0,
        height: 200
    }).appendTo(drawer);
    let collectionView = new tabris.CollectionView({
        left: 0,
        top: [drawableImageView, 0],
        right: 0,
        background:'#ededed',
        bottom: config.item.bottom_banner_margin,
        items: drawerMenu.menuItems(),
        itemHeight: function(item, type) {
            return type === 'heading' ? 35 : 40;
        },
        cellType: function(item) {
            return item.type;
        },
        initializeCell: function(cell, type) {
            //console.log(type);
            if (type === 'heading') {
                headingcell(cell);
            } else {
                initializeStandardCell(cell);
            }
        }
    }).on('select', function({
        item
    }) {
        window.ga.trackView(item.slug);
        if (item.type == 'normal') {
        	if(item.slug == 'about')
        	{
        		aboutus.show(navigationView);
        	}
        	else if(item.slug == 'contact')
        	{
        		contact.show(navigationView);
        	}
            else if(item.slug == 'settings')
            {
                settings.show(navigationView);
            }
        	else
        	{
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
    }).appendTo(drawer);

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
        cell.highlightOnTouch = true;
        let imageView = new tabris.ImageView({
            width: 10,
            left: 2,
            bottom: 0,
            top: 0,
            left: 10,
            scaleMode: "fit",
        }).appendTo(cell);
        let textView = new tabris.TextView({
            top: 9,
            left: [imageView, 5],
            right: 5,
            markupEnabled: true,
            /*font: "16px Arial, sans-serif",*/
            textColor: "#000",
        }).appendTo(cell);
        cell.on('change:item', function({
            value: menuItem
        }) {
            textView.text = menuItem.title;
            imageView.image = {
                src: menuItem.image,
                scale: 1
            };
        });
    }

    function headingcell(cell) {
        let textView = new tabris.TextView({
            top: 5,
            left: 10,
            right: 5,
            bottom: 5,
            markupEnabled: true,
            textColor: "#fff",
        }).appendTo(cell);
        cell.background = config.item.primaryBgColor;
        cell.on('change:item', function({
            value: menuItem
        }) {
            textView.text = '<b>'+menuItem.title+'</b>';
        });
    }
}