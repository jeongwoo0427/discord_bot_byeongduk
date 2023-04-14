const sleepModule = require('../module/sleep_module');

const selectMenuController = async (interaction)=> {
    const customId = interaction.customId;

    if(customId == 'sleep_selector') return sleepModule.sleepWho(interaction);
}

module.exports = selectMenuController;