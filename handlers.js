const { prefix, ownerId, goldenData } = require('./config.json');
const { toggleRole } = require('./voiceState.js');
const { resetList, createChannels, logToPersonalChannel, resetResult } = require('./messageCreate.js');

async function messageHandler(msg) {
  if (msg.author.bot) return;
  var log = false;
  var cmd = false;
  if (msg.channel.type === 'DM' || msg.channel.id === goldenData.msgChannelID) {
    if (msg.content === (`${prefix}r`) && ownerId.indexOf(msg.author.id) >= 0) {
      cmd = true;
      const res = await resetList(msg);
      var embed = await resetResult(res.addList, res.removeList);
      msg.channel.send({embeds: [embed]});
    }
  }
  if (!cmd && msg.channel.id === goldenData.msgChannelID) {
    log = true;
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