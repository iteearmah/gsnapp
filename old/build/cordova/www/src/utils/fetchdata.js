exports.getJSON=function(url) {
	//console.log(url);
  return fetch(url).then(function(response) {
    return response.json();
  });
}