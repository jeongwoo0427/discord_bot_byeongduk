const voiceController = require('../controllers/voice_controller');

const voiceStateRoute = async (oldState,newState)=> {
    // console.log(newState.member.user.username);

    voiceController.checkAlone(oldState);
}

module.exports = voiceStateRoute;