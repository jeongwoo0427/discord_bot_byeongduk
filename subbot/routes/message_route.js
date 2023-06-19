const voiceController = require('../controllers/voice_controller');

const messageRoute = async (message) =>{


    if(message.author.bot || !message.guild) return; //봇이거나 길드원이 아닐경우 리턴

    if(message.content.substring(0,1) == `^`)return voiceController.useUserTTS(message);

    


    //일반 명령어
    //message.channel.send('message'); //메시지 전송
};

module.exports = messageRoute;