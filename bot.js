const request = require('request');
const jsonPath = './oots.json';

var Discord = require('discord.io');
var logger = require('winston');

var auth = require('./auth.json');
var ootsSettings = require('./oots.json');

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
            case 'ootstimer':
                logger.info("Channel ID: " + channelID);
                setInterval(function () {
                    var date = new Date();
                    // var hour = date.getHours();
                    // var minute = date.getMinutes();
                    // var second = date.getSeconds();
                    // logger.info('ootstimer fire -- ' + (hour >= 10 ? hour : '0' + hour) + ':' + (minute >= 10 ? minute : '0' + minute) + ':' + (second >= 10 ? second : '0' + second));
                    if (date.getMinutes() % 20 === 0) {
                        request(ootsSettings.url, { json: true}, (err, res, body) => {
                            if (err) {
                                bot.sendMessage({
                                    to: channelID,
                                    message: err
                                });
                            }
                            url_location = body.search(/\/comics\/oots.*\.html/g);
                            message = 'http://www.giantitp.com' + res.body.substring(url_location, url_location+21)
                            if (message !== ootsSettings.previous) {
                                bot.sendMessage({
                                    to: channelID,
                                    message: 'New OOTS!\n' + message
                                });
                                ootsSettings.previous = message;
                                logger.info('New OOTS!');
                                logger.info(ootsSettings);
                            }
                        });
                    }
                }, ootsSettings.frequency)
            break;
            // Add additional cases here
        }
    }
});