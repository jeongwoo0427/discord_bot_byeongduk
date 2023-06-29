const dataController = require('../controllers/data_controller');
const voiceController = require('../controllers/voice_controller');

const voiceStateRoute = async (oldState,newState)=> {
    // console.log(newState.member.user.username);

    // console.log(oldState.channel?.members.size);
    //  console.log(newState.channel?.members.size);

    dataController.insertVoiceState(newState);

    voiceController.checkAlone(oldState);
}

module.exports = voiceStateRoute;