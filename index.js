const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const { messageHandler, voiceStateHandler } = require('./handlers.js');

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.DIRECT_MESSAGES
  ],
  partials: ['CHANNEL']
});

client.once('ready', () => {
  console.log(`[${new Date().toString()}] Ready`);
});

client.on('messageCreate', msg => {
  messageHandler(msg);
});

client.on('voiceStateUpdate', (old_state, new_state) => {
  voiceStateHandler(old_state, new_state);
});

client.login(token);

process.on('unhandledRejection', r => {
  console.warn(`\n[Rejection - ${new Date().toLocaleString()}]\n${r}\n[/Rejection]`);
})