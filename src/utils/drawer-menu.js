let config = require('../config.js');
exports.menuItems = function() {
	let rightarrow = 'ic_arrow_right_blk_48dp.png';
    let menuItems = [
     	['More News', '', '', 'heading'],//heading
        ['Transfer News & Rumours', rightarrow, 'transfer-news-rumours', 'normal'],
        ['Newspapers and Gossip', rightarrow, 'newspapers-gossip', 'normal'],
        ['Features and Interviews', rightarrow, 'features-interviews', 'normal'],

        ['National Teams', '', 'national-teams', 'heading'],//heading
        ['Black Stars', rightarrow, 'black-stars', 'normal'],
        ['Black Satellites', rightarrow, 'black-satellites', 'normal'],
        ['Black Starlets', rightarrow, 'black-starlets', 'normal'],
        ['Black Meteors', rightarrow, 'black-meteors', 'normal'],
        ['Black Queens', rightarrow, 'black-queens', 'normal'],
        ['Black Princesses', rightarrow, 'black-princesses', 'normal'],
        
        ['Ghana Premier League', '', 'ghana-prem-league', 'heading'],//heading
        ['Kumasi Asante Kotoko', rightarrow, 'kotoko', 'normal'],
        ['Accra Hearts of Oak', rightarrow, 'heartsofoak', 'normal'],
        ['Medeama Sporting Club', rightarrow, 'medeama', 'normal'],
        ['AshantiGold', rightarrow, 'ashgold', 'normal'],
        ['Ebusua Dwarfs', rightarrow, 'dwarfs', 'normal'],
        ['Bolga All Stars', rightarrow, 'bolga-all-stars', 'normal'],
        ['Aduana Stars', rightarrow, 'aduana-stars', 'normal'],
        ['Berekum Chelsea', rightarrow, 'berekumchelsea', 'normal'],
        ['Liberty Professionals', rightarrow, 'liberty-profs', 'normal'],
        ['Elmina Sharks', rightarrow, 'elmina-sharks', 'normal'],
        ['Bechem United', rightarrow, 'bechem-united', 'normal'],
        ['Inter Allies', rightarrow, 'inter-allies', 'normal'],
        ['Wa All Stars', rightarrow, 'wa-all-stars', 'normal'],
        ['WAFA', rightarrow, 'wafa', 'normal'],
        ['Tema Youth', rightarrow, 'tema-youth', 'normal'],
        ['Accra Great Olympics', rightarrow, 'accra-great-olympic', 'normal'],
       
        ['Ghanasoccernet', '', '', 'heading'],//heading
        ['Settings', 'ic_settings_black_48dp.png', 'settings', 'normal'],
        ['About Us', rightarrow, 'about', 'normal'],
        ['Contact Us', rightarrow, 'contact', 'normal'],
    ].map(function(element) {	
        return {
            title: element[0],
            image: config.item.imagePath + '/' + element[1],
            slug: element[2],
            type: element[3]
        };
    });
    return menuItems;
}