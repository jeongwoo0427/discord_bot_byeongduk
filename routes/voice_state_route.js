const dataController = require('../controllers/data_controller');

const voiceStateRoute = async (oldState,newState)=> {
    // console.log(newState.member.user.username);

    // console.log(newState.member.user.username);

    dataController.insertVoiceState(newState);
    
}

module.exports = voiceStateRoute;