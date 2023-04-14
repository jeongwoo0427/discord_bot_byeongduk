const dataController = require('../controllers/data_controller');
const selectMenuController = require('../controllers/select_menu_controller');
const buttonController = require('../controllers/button_controller');

const interactionRoute = async (interaction)=> {
    if(interaction.isSelectMenu()) return selectMenuController(interaction);
    if(interaction.isButton()) return buttonController(interaction);
}

module.exports = interactionRoute;