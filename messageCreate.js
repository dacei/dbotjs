const { goldenData } = require('./config.json');
const Discord = require('discord.js');

function resetList(msg) {
  console.log(msg);
}

function loc_usersInVoice(channel) {
  var currentUserlist = [];
  for (const [memberID] of channel.members) currentUserlist.push(memberID);
  return currentUserlist;
}

function loc_checkChannel(cache, user) {
  const channel = cache.find(c => c.name === user);
  if (channel) return true;
  else return false;
}

function loc_usersWithChannel(cache, voiceList) {
  var returnDict = {};
  voiceList.forEach(u => {
    if (loc_checkChannel(cache, u)) returnDict[u] = true;
    else returnDict[u] = false;
  });
  return returnDict;
}

function loc_sendMessage(msg, ch) {
  let embed = new Discord.MessageEmbed();
  embed.setAuthor({name: msg.author.username, iconURL: msg.author.avatarURL()});
  embed.setColor('#c5a790');
  if (msg.content) embed.setDescription(msg.content);
  if (msg.attachments.size > 0) {
    if (msg.attachments.size > 1) {
      console.log("[Attachments] > 1 Case:");
      console.log(msg);
    }
    else {
      msg.attachments.each(att => {
        embed.setImage(att.url);
      });
    }
  }
  ch.send({embeds: [embed]});
}

function loc_createChannel(chs, userID, groupID, serverID, botID) {
  console.log('creating channels');
  chs.create(userID)
    .then(ch => {
      ch.setParent(groupID);
      ch.overwriteOptions([
        {
          id: serverID,
          deny: 'VIEW_CHANNEL'
        },
        {
          id: userID,
          allow: 'VIEW_CHANNEL'
        },
        {
          id: botID,
          allow: 'VIEW_CHANNEL'
        }
      ], 'Deny everyone from reading channel');
    });
}

function createChannels(msg) {
  var voiceChannel = msg.guild.channels.cache.get(goldenData.voiceChannelID);
  var userList = loc_usersInVoice(voiceChannel);
  var userChannelList = loc_usersWithChannel(msg.guild.channels.cache, userList);
  for (let [key, val] of Object.entries(userChannelList)) {
    if (val === false) loc_createChannel(msg.guild.channels, key, goldenData.channelGroupID, goldenData.guildID);
  }
}

function logToPersonalChannel(msg) {
  var voiceChannel = msg.guild.channels.cache.get(goldenData.voiceChannelID);
  var userList = loc_usersInVoice(voiceChannel);
  var userChannelList = loc_usersWithChannel(msg.guild.channels.cache, userList);
  for (let [key, val] of Object.entries(userChannelList)) {
    if (val === true) {
      var channelForMessage = msg.guild.channels.cache.find(c => c.name === key);
      if (channelForMessage != undefined) loc_sendMessage(msg, channelForMessage);
    }
  }
}

module.exports = {
  resetList,
  createChannels,
  logToPersonalChannel
}