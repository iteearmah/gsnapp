exports.getJSON = function(url) {
    //console.log(url);
    return fetch(url, {
        timeout: 5000 // request timeout in ms
    }).then(function(response) {
        return response.json();
    });
}