const Nick = require("nickjs")
const nick = new Nick()

const fs = require('fs')
var parse = require('csv-parse')

fs.readFile("/Users/work/Downloads/POS_MS.csv", function (err, fileData) {
  parse(fileData, {columns: false, trim: true}, function(err, rows) {
	// Your CSV data is in an array of arrys passed to this callback as rows.
	let allWebsitePromises = findAllWebsites(rows);
	let allWebsites = {};
	allWebsitePromises.forEach(async websitePromise => {
		await websitePromise.then(data => {
			allWebsites[data.name] = data.site;
		}).catch(test => console.log(test));
	});
	Promise.all(allWebsitePromises).then(() => console.log(allWebsites));

  })
})


let findAllWebsites = (csvData) => {
	let websites = [];
	for(let i = 0; i < 20; i++) { //csvData.length; i++) {
		let currRestaurantName = csvData[i][0];
		// console.log(currRestaurantName);
		websites.push(tabLoader(currRestaurantName));
	}
	return websites;
}


let tabLoader = async (restaurantName) => {
	// console.log(restaurantName);
	const tab = await nick.newTab()
	await tab.open(`www.google.com/search?q=${restaurantName}+chicago`)

	await tab.untilVisible("body") // Make sure we have loaded the page

	await tab.inject("http://code.jquery.com/jquery-3.2.1.min.js") // We're going to use jQuery to scrape
	console.log(restaurantName);

	const googleData = await tab.evaluate((arg, callback) => {
		callback(null, {
			site: $("body").find(".r").first().find("a").attr("href"),
		})
	})

	googleData.name = restaurantName;

	return googleData;

};