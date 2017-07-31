exports.getJSON = function(url) {
    //console.log(url);
    return fetch(url, {
        timeout: (1000 * 30) // request timeout in ms
    }).then(function(response) {
        return response.json();
    });
}