const { prefix, ownerId, goldenData } = require('./config.json');
const { toggleRole } = require('./voiceState.js');
const { resetList, createChannels, logToPersonalChannel } = require('./messageCreate.js');

async function messageHandler(msg) {
  if (msg.author.bot || msg.channel.id != goldenData.msgChannelID) return;
  var log = true;
  if (msg.content === (`${prefix}r`) && ownerId.indexOf(msg.author.id) >= 0) {
    log = false;
    resetList(msg);
  }
  if (log && msg.channel.id === goldenData.msgChannelID) {
    createChannels(msg);
  }
  if (log) {
    logToPersonalChannel(msg);
  }
}

function voiceStateHandler(old_state, new_state) {
  if (
    old_state.channelId === new_state.channelId && 
    new_state.channelId === goldenData.voiceChannelID
  ) return; // someone muted or smth in important ch

  if (old_state.channelId === goldenData.voiceChannelID) toggleRole(old_state, 0);
  if (new_state.channelId === goldenData.voiceChannelID) {
    toggleRole(new_state, 1);

    var logChannel = new_state.guild.channels.cache.get(goldenData.msgChannelID);
    logChannel.send(`User joined: ${new_state.member.displayName}`);
  }
}

module.exports = {
  messageHandler,
  voiceStateHandler
};