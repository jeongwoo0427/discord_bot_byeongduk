const sleepModule = require('../module/sleep_module');

const buttonController = async (interaction)=> {
    const customId = interaction.customId;

    if(customId.includes('sleep')) return sleepModule.clickedButton(interaction);
}

module.exports = buttonController;