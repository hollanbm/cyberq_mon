var request = require("request");
var convert = require('xml-js');
var schedule = require('node-schedule');
var push = require('pushover-notifications');

var p = new push({
    user: process.env['PUSHOVER_USER'],
    token: process.env['PUSHOVER_TOKEN'],
});

var interval_mins = process.env['INTERVAL_MINS']
var set_cook_temp = process.env['SET_COOK_TEMP'];
var set_food1_temp = process.env['SET_FOOD1_TEMP'];

console.log('starting')
var j = schedule.scheduleJob(`*/${interval_mins} * * * *`, function(){
    console.log('sending request')
    request(
        { uri: "http://cyberq.bholland.lan/status.xml" },
        function(error, response, body) {
            console.log('got status')
            var result = convert.xml2json(body, {compact: true, spaces: 4});
            var jsonObj = JSON.parse(result);
            var cook_temp = (jsonObj.nutcstatus.COOK_TEMP._text / 10).toFixed(1)
            var food1_temp = (jsonObj.nutcstatus.FOOD1_TEMP._text / 10).toFixed(1)
            console.log(`current cook_temp: ${cook_temp}`)
            console.log(`current food1_temp: ${food1_temp}`)


            sendAlert('Temp Alert', `The grill temperature is ${cook_temp}`);
    
            if(food1_temp >= set_food1_temp - 20)
            {
                sendAlert('Food almost done', `Food1 is ${set_food1_temp -  food1_temp} degrees from being done`);
            }
        }
    );
});

function sendAlert(title, message) {
    console.log('sending alert')
    var msg = {
        message: message,
        title: title
    }

    p.send(msg, function( err, result ) {
        if (err) {
          console.log(err)
        }
        console.log(result);
      })
}