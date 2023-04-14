// Require the necessary discord.js classes
const client = require('./module/client_module');

client.on('messageCreate', require('./routes/message_route'));

client.on('voiceStateUpdate',require('./routes/voice_state_route'));

client.on('interactionCreate',require('./routes/interaction_route'));

client.on("debug", (message)=>{console.log(`[Debug]${new Date()} : ${message}`);})
      .on("warn",  (message)=>{console.log(`[Warn]${new Date()} : ${message}`);});

process.on('uncaughtException', (err)=>{ //최후의 에러 처리
    console.error(`[Exception]${new Date()} : ${err}`);
});

process.on('unhandledRejection', err => {
    console.error(`[Rejection]${new Date()} : ${err}`);
});

//디스코드 초대권한 설정
//https://discord.com/api/oauth2/authorize?client_id=1016606382281199697&permissions=57751558&scope=bot
