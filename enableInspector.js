const fs = require("fs");

var NeuConfig = fs.readFileSync("neutralino.config.json");
NeuConfig = JSON.parse(NeuConfig);

if (process.argv[2] == 'true') {
	NeuConfig.modes.window.enableInspector = true;
	fs.writeFileSync("neutralino.config.json", JSON.stringify(NeuConfig, null, "\t"));
} else if (process.argv[2] == 'false') {
	NeuConfig.modes.window.enableInspector = false;
	fs.writeFileSync("neutralino.config.json", JSON.stringify(NeuConfig, null, "\t"));
} else {
	console.log("Invalid Input: '" + process.argv[2] + "'");
}
