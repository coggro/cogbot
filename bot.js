const request = require('request');
const fs = require('fs');
const jsonPath = './oots.json';

var Discord = require('discord.io');
var logger = require('winston');

var auth = require('./auth.json');
var oots = require('./oots.json');

// Configure Logger Settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

// Bot Logic
bot.on('message', function(user, userId, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that start with '!'
    if (message.substring(0,7) == '/cogbot') {
        var args = message.substring(8).split(' ');
        var cmd = args[0];

        logger.info(user + ' used the \'' + cmd + '\' command.')

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            case 'oots':
                request('http://www.giantitp.com/cgi-bin/GiantITP/ootscript', { json: true}, (err, res, body) => {
                    if (err) {
                        bot.sendMessage({
                            to: channelID,
                            message: err
                        });
                    }
                    url_location = body.search(/\/comics\/oots.*\.html/g);
                    message = 'http://www.giantitp.com' + res.body.substring(url_location, url_location+21)
                    bot.sendMessage({
                        to: channelID,
                        message: message
                    });
                });
                break;
            case 'channelid':
                bot.sendMessage({
                    to: channelID,
                    message: "Channel ID: " + channelID
                })
                break;
            // case 'ootstimer':
            //     logger.info("Channel ID: " + channelID);
            //     // Run code over interval in settings.
            //     setInterval(function () {
            //         var date = new Date();
            //         // var hour = date.getHours();
            //         // var minute = date.getMinutes();
            //         // var second = date.getSeconds();
            //         // logger.info('ootstimer fire -- ' + (hour >= 10 ? hour : '0' + hour) + ':' + (minute >= 10 ? minute : '0' + minute) + ':' + (second >= 10 ? second : '0' + second));
            //         // if the current minute is divisible by 20
            //         if (date.getMinutes() % 20 === 0) {
            //             // Make a request to ootscript
            //             request(oots.url, { json: true}, (err, res, body) => {
            //                 // Handle an error
            //                 if (err) {
            //                     bot.sendMessage({
            //                         to: channelID,
            //                         message: err
            //                     });
            //                 }
            //                 // Find the URL in the body of the response via regex
            //                 url_location = body.search(/\/comics\/oots.*\.html/g);
            //                 // Set the URL
            //                 oots_url = 'http://www.giantitp.com' + res.body.substring(url_location, url_location+21)
            //                 // if the current comic url is different from the last one
            //                 if (oots_url !== oots.previous) {
            //                     // Sen the URL in chat
            //                     bot.sendMessage({
            //                         to: channelID,
            //                         message: 'New OOTS!\n' + oots_url
            //                     });
            //                     // Set the current url as the previous variable for future comparison
            //                     oots.previous = oots_url;
            //                     // Log to the console for debugging
            //                     logger.info('New OOTS!');
            //                     logger.info(oots);
            //                 }
            //             });
            //         }
            //     }, oots.frequency);
            //     break;
            // break;
            // Add additional cases here
        }
    }
});

var webcomics_channel_id = 408124087534223360;
var test_channel_id = 489433194773348353;
var active_channel_id = test_channel_id;
setInterval(function () {
    var date = new Date();
    // var hour = date.getHours();
    // var minute = date.getMinutes();
    // var second = date.getSeconds();
    // logger.info('ootstimer fire -- ' + (hour >= 10 ? hour : '0' + hour) + ':' + (minute >= 10 ? minute : '0' + minute) + ':' + (second >= 10 ? second : '0' + second));
    // if the current minute is divisible by 20
    if (date.getMinutes() % 20 === 0) {
        // Make a request to ootscript
        request(oots.url, { json: true}, (err, res, body) => {
            // Handle an error
            if (err) {
                bot.sendMessage({
                    to: active_channel_id,
                    message: err
                });
            }
            // Find the URL in the body of the response via regex
            url_location = body.search(/\/comics\/oots.*\.html/g);
            // Set the URL
            oots_url = 'http://www.giantitp.com' + res.body.substring(url_location, url_location+21)
            // if the current comic url is different from the last one
            if (oots_url !== oots.previous) {
                // Sen the URL in chat
                bot.sendMessage({
                    to: active_channel_id,
                    message: 'New OOTS!\n' + oots_url
                });
                // Set the current url as the previous variable for future comparison
                oots.previous = oots_url;
                // Log to the console for debugging
                logger.info('New OOTS!');
                logger.info(oots);
                fs.writeFile(jsonPath, JSON.stringify(oots), (err) => {
                    if (err) {
                        logger.info(err);
                    }

                    logger.info('JSON Overridden');
                })
            }
        });
    }
}, oots.frequency);