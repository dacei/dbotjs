const { goldenData } = require('./config.json');

function toggleRole(state, action) {
  const member_id = state.id;
  var member = state.guild.members.cache.get(member_id);
  var memberRole = member.roles.cache.get(goldenData.roleID);

  if (memberRole != undefined && action === 0) {
    member.roles.remove(goldenData.roleID);
    console.log(`[${new Date().toString()}] Removed user ${member.displayName}`);
  }

  if (memberRole === undefined && action === 1) {
    member.roles.add(goldenData.roleID);
    console.log(`[${new Date().toString()}] Added user ${member.displayName}`)
  }
}

module.exports = {
  toggleRole
}