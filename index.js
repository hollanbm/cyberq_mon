var request = require("request");
var convert = require('xml-js');
var push = require('pushover-notifications');
var p = new push({
    user: process.env['PUSHOVER_USER'],
    token: process.env['PUSHOVER_TOKEN'],
});

var set_cook_temp = process.env['SET_COOK_TEMP'];
var set_food1_temp = process.env['SET_FOOD1_TEMP'];

request(
    { uri: "http://cyberq.bholland.lan/status.xml" },
    function(error, response, body) {
        var result = convert.xml2json(body, {compact: true, spaces: 4});
        var jsonObj = JSON.parse(result);
        var cook_temp = jsonObj.nutcstatus.COOK_TEMP._text / 10
        var food1_temp = jsonObj.nutcstatus.FOOD1_TEMP._text / 10

        if(cook_temp > set_cook_temp)
        {
            sendAlert('Temp Alert', `The grill temperature is ${cook_temp}`);
        }

        if(food1_temp >= set_food1_temp - 20)
        {
            sendAlert('Food almost done', `Food1 is ${set_food1_temp -  food1_temp} degrees from being done`);
        }
    }
);

function sendAlert(title, message) {
    var msg = {
        message: message,
        title: title
    }

    p.send(msg, function( err, result ) {
        if (err) {
          throw err
        }
        console.log(result);
      })
}