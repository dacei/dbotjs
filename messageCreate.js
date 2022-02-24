const { goldenData } = require('./config.json');
const Discord = require('discord.js');

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
      ch.permissionOverwrites.set([
        {
          id: serverID,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: userID,
          allow: ['VIEW_CHANNEL']
        },
        {
          id: botID,
          allow: ['VIEW_CHANNEL']
        }
      ], 'Deny everyone from reading channel');
    });
}

function loc_changeRole(msg, uID, action) {
  var main_guild = msg.client.guilds.cache.get(goldenData.guildID);
  var user = main_guild.members.cache.get(uID);
  if (action === 0) user.roles.remove(goldenData.roleID, "User was in role but not in voice");
  if (action === 1) user.roles.add(goldenData.roleID, "User was in voice but not in role");
  return uID;
}

async function loc_getUsers(data) {
  var list = [];
  for (const [member] of data.members) {
    if (member === goldenData.botID) continue;
    else list.push(member);
  }
  return list;
}

async function loc_getVoiceList(msg) {
  var main_guild = msg.client.guilds.cache.get(goldenData.guildID);
  var voiceChannel = main_guild.channels.cache.get(goldenData.voiceChannelID);
  return loc_getUsers(voiceChannel);
}

async function loc_getRoleList(msg) {
  var main_guild = msg.client.guilds.cache.get(goldenData.guildID);
  var role = await main_guild.roles.fetch(goldenData.roleID);
  return loc_getUsers(role);
}

async function resetList(msg) {

  var voiceMembers = await loc_getVoiceList(msg);
  var roleMembers = await loc_getRoleList(msg);

  var addList = [];
  var removeList = [];
  if (roleMembers.length != 0) {
    roleMembers.forEach(u => {
      if (!voiceMembers.includes(u)) {
        removeList.push(loc_changeRole(msg, u, 0));
      }
    });
  }
  if (voiceMembers.length != 0) {
    voiceMembers.forEach(u => {
      if (!roleMembers.includes(u)) {
        addList.push(loc_changeRole(msg, u, 1));
      }
    });
  }
  return {
    'addList': addList,
    'removeList': removeList
  };
}

async function createChannels(msg) {
  var userList = await loc_getVoiceList(msg);
  var userChannelList = loc_usersWithChannel(msg.guild.channels.cache, userList);
  for (let [key, val] of Object.entries(userChannelList)) {
    if (val === false) loc_createChannel(msg.guild.channels, key, goldenData.channelGroupID, goldenData.guildID, goldenData.botID);
  }
}

async function logToPersonalChannel(msg) {
  var userList = await loc_getVoiceList(msg);
  var userChannelList = loc_usersWithChannel(msg.guild.channels.cache, userList);
  for (let [key, val] of Object.entries(userChannelList)) {
    if (val === true) {
      var channelForMessage = msg.guild.channels.cache.find(c => c.name === key);
      if (channelForMessage != undefined) loc_sendMessage(msg, channelForMessage);
    }
  }
}

async function resetResult(addList, removeList) {
  var embed = new Discord.MessageEmbed();
  embed.setDescription('Results');
  embed.addField('IDs added to role: ', !addList.length == 0 ? addList.toString() : "None");
  embed.addField('IDs removed from role: ', !removeList.length == 0 ? removeList.toString() : "None");

  return embed;
}

module.exports = {
  resetList,
  createChannels,
  logToPersonalChannel,
  resetResult
}