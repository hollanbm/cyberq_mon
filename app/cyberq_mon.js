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
var set_food2_temp = process.env['SET_FOOD2_TEMP'];
var cyberq_host = process.env['cyberq_host'];

console.log('starting')
var j = schedule.scheduleJob(`*/${interval_mins} * * * *`, function(){
    console.log('sending request')
    request(
        { uri: `http://${cyberq_host}/status.xml` },
        function(error, response, body) {
            console.log('got status')
            var result = convert.xml2json(body, {compact: true, spaces: 4});
            var jsonObj = JSON.parse(result);
            var cook_temp = (jsonObj.nutcstatus.COOK_TEMP._text / 10).toFixed(1)
            var food1_temp = (jsonObj.nutcstatus.FOOD1_TEMP._text / 10).toFixed(1)
            var food2_temp = (jsonObj.nutcstatus.FOOD2TEMP._text / 10).toFixed(1)
            console.log(`current cook_temp: ${cook_temp}`)
            console.log(`current food1_temp: ${food1_temp}`)
            console.log(`current food2_temp: ${food2temp}`)


            sendAlert('Temp Alert', `The grill temperature is ${cook_temp}`);
    
            if(food1_temp >= set_food1_temp - 20)
            {
                sendAlert('Food almost done', `Food1 is ${(set_food1_temp -  food1_temp).toFixed(1)} degrees from being done`);
            }
            if(food2_temp >= set_food2_temp - 20)
            {
                sendAlert('Food almost done', `Food2 is ${(set_food2_temp -  food2_temp).toFixed(1)} degrees from being done`);
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