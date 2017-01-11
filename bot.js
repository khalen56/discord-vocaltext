'use strict';

// Loading env configuration
require('dotenv').config({path: `${__dirname}/.env`});

const Discord = require("discord.js");
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
});

client.on('voiceStateUpdate', (oldState, newstate) => {

    if (oldState.voiceChannel && newstate.voiceChannel && oldState.voiceChannel.name === newstate.voiceChannel.name) {
        return;
    }

    if (oldState.voiceChannel) {
        const textChannel = oldState.guild.channels.reduce((acc, channel) => {
            if (!acc && channel.type === "text" && channel.name === oldState.voiceChannel.name.toLowerCase().replace(/ /g, '_')) {
                acc = channel;
            }
            return acc;
        }, null);

        if (textChannel) {
            textChannel.permissionOverwrites.forEach( permission => {
                if (permission.id === oldState.id) {
                    permission.delete();
                }
            });
            if (process.env.ANNOUNCE && process.env.ANNOUNCE_LEAVE) {
                textChannel.sendMessage(process.env.ANNOUNCE_LEAVE.replace(/\$1/g, oldState.user.username));
            }
        }
    }

    if (newstate.voiceChannel) {
        const textChannel = newstate.guild.channels.reduce((acc, channel) => {
            if (!acc && channel.type === "text" && channel.name === newstate.voiceChannel.name.toLowerCase().replace(/ /g, '_')) {
                acc = channel;
            }
            return acc;
        }, null);
        if (textChannel) {
            textChannel.overwritePermissions(oldState, {"READ_MESSAGES": true});
            if (process.env.ANNOUNCE && process.env.ANNOUNCE_ENTER) {
                textChannel.sendMessage(process.env.ANNOUNCE_ENTER.replace(/\$1/g, newstate.user.username));
            }
        }
    }
});

client.login(process.env.TOKEN);
