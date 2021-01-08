const http = require("http");
const fs = require("fs");
const chalk = require("chalk");

function onGetRequest(res) {
	let db = JSON.parse(fs.readFileSync("db.json"));
	res.setHeader("Content-Type", "application/json");
	res.write(JSON.stringify(db["content"]));
	res.end();
}

function onPutRequest(req, res) {
	let db = JSON.parse(fs.readFileSync("db.json"));
	let data = "";
	req.on("data", chunk => {
		data += chunk;
	});
	req.on("end", () => {
		let toPut;
		try {
			toPut = JSON.parse(data);
		} catch (error) {
			console.error("Provided Json is invalid!");
			return;
		}
		if(!validate(toPut)) {
			res.statusCode = 400;
			res.write("");
			res.end();
			return;
		}
		else {
			res.statusCode = 200;
			res.write("");
			res.end();
		}
		let handled = false;
		db["content"].forEach(element => {
			if(element["name"] == toPut["name"] && element["unit"] == toPut["unit"]) {
				console.log(chalk.blue("Element already found. Appending"));
				element["amount"] += toPut["amount"];
				handled = true;
				fs.writeFileSync("db.json", JSON.stringify(db, null, 4));
				return;
			}
		});
		if(!handled) {
			console.log(chalk.blue("Element not found. Adding"));
			db["content"].push(toPut);
			fs.writeFileSync("db.json", JSON.stringify(db, null, 4));
		}
	});
}

function validate(json) {
	console.log(chalk.green(`Validating request ${JSON.stringify(json)}`));
	let name = json["name"];
	let amount = json["amount"];
	let unit = json["unit"];
	if(name == undefined || name == "") {
		console.log(chalk.red(`name was ${name}`));
		return false;
	}
	if(amount == undefined || amount <= 0) {
		console.log(chalk.red(`amount was ${amount}`));
		return false;
	}
	if(unit == undefined || (unit != "pieces" && unit != "gramms" && unit != "kilogramms" && unit != "packs")) {
		console.log(chalk.red(`unit was ${unit}`));
		return false;
	}
	console.log(chalk.green("Request was valid"));
	return true;
}

http.createServer(function (req, res) {
	switch(req.method) {
	case "GET": onGetRequest(res);
		break;
	case "PUT": onPutRequest(req, res);
		break;
	default: res.statusCode = 405;
		res.write("");
		res.end();
		break;
	}
}).listen(8080);




