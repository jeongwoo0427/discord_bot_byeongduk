const commandController = require('../controllers/command_controller');
const voiceController = require('../controllers/voice_controller');
const dataController = require('../controllers/data_controller');

const messageRoute = async (message) =>{
    //console.log(message); 
    await dataController.insertMessage(message);

    if(message.author.id == '1060811944254251008')return voiceController.useBotTTS(message); //겸사서버 특수기능 : 좀보이드의 ID 일 경우 TTS로 이동


    if(message.author.bot || !message.guild) return; //봇이거나 길드원이 아닐경우 리턴

    if(message.content == '겸사로봇')return message.reply('~ 는 커맨드 관련 기능, * 은 TTS관련 기능을 사용합니다.');;

    if(message.content.substring(0,1) == '~')return commandController(message);

    if(message.content.substring(0,1) == `*`||message.content.substring(0,1) == `!`)return voiceController.useUserTTS(message);

    


    //일반 명령어
    //message.channel.send('message'); //메시지 전송
};

module.exports = messageRoute;