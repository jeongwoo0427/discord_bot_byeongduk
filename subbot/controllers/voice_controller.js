const fs = require('fs');
//const discordTTS = require('discord-tts');
const config = require('../config.json');
const request = require('request');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection, getVoiceConnection } = require('@discordjs/voice');
const splatSchedule = require('../module/splat3_schedule_module');
const timeModule = require('../module/time_module');
const proRequest = require('../module/pomised_request_module');



initTempDir();
startConnectionTimeout();

const connections = new Map();


const nameOfGuildId = {
    '베이즈': '1016607441707880468',
    '겸사': '942969471184805908',
}


const voiceController = {
    useUserTTS: async (message) => {
        try {
            if (message.content.length <= 1) return message.reply('최소 1개 이상의 글자를 입력해주세요.');


            const guildId = message.guildId.toString();
            let rawMessage = message.content;
            let clearMessage = getClearMessage(rawMessage);
            let voice = getVoice(rawMessage);
            let speed = getSpeed(rawMessage);

            if (clearMessage.trim().substring(0,5).includes('play') || clearMessage.trim().substring(0,5).includes('PLAY') || clearMessage.trim().substring(0,5).includes('Play')) {
                return
            }

            if (clearMessage.trim().substring(0,5).includes('exit') || clearMessage.trim().substring(0,5).includes('EXIT') || clearMessage.trim().substring(0,5).includes('Exit')) {
                destoryConnection(guildId);
                return
            }

            if (message.member == null) return message.reply('해당 기능은 서버에서만 사용할 수 있습니다.');

            if (!message.member.voice.channel) return message.reply('TTS를 사용하기 위해 먼저 음성채널에 있어야 합니다.');

            //채널에 접속되었음을 확인
            const channelId = message.member.voice.channel.id.toString();
            const connection = getVoiceConnection(guildId);
            const liveState = connection?.state?.status;





            //접속상태, connections 객체의 channelId가 다르거나, 실제 접속된 커넥션의 channelId가 다를 경우
            if (liveState != `ready` || connections.get(guildId)?.channelId != channelId || connection?.joinConfig?.channelId != channelId) {

                connections.set(guildId,{
                    channelId: null,
                    lastActiveTime: new Date(),
                })

                connection?.destroy();

                joinVoiceChannel({
                    guildId: guildId,
                    channelId: channelId,
                    adapterCreator: message.guild.voiceAdapterCreator
                });

                connections.get(guildId).channelId = channelId;

                console.log(`joined voice channel!`);
            }




            await playVoice({clearMessage:clearMessage, voice:voice, speed:speed, guildId:guildId});

            connections.get(guildId).lastActiveTime = new Date();


            console.log(`connectionState=${liveState}`);
            console.log('guildId=' + guildId + ' channelId=' + channelId);
            console.log(`clearMessage=${clearMessage}`)
            console.log(`===============================================================================`);

        } catch (err) {
            message.channel.send('음성 모듈 관련 오류가 발생했습니다 ㅜㅜ');
            console.log(err);
        }
    },

    usePrivateTTS: async (message) => {
        try {

            let rawMessage = message.content;
            const guildId = getGuildId(rawMessage);
            let clearMessage = rawMessage.replace(`[${guildId}]`, '');
            const authorName = message.author.username;

            //console.log(authorName.username);

            if (guildId == null) {
                return message.reply('올바른 TTS 커맨드를 입력해주세요. ( ex. [29832912391293]이렇게요. )');
            }

            //console.log(guildId);

            let channel = connections.get(guildId);


            if (channel == null) {
                return message.reply('병덕이가 해당 서버에 접속이 없습니다. 음성채널에 입장을 시켜준 후 다시 시도해주세요');
            }


            const channelId = getVoiceConnection(guildId)?.joinConfig?.channelId;

            if (channelId == null) {
                return message.reply('병덕이가 해당 채널에 접속이 없습니다. 음성채널에 입장을 시켜준 후 다시 시도해주세요');
            }


            const connectionState = getVoiceConnection(guildId)?.state?.status;
            if (connectionState != 'ready') {
                return message.reply('병덕이가 해당 서버 또는 채널에서의 접속이 없습니다. 음성채널에 입장을 시켜준 후 다시 시도해주세요.');
            }

            //await playVoice(authorName+'님의 비밀대화입니다','WOMAN_READ_CALM','0.85',guildId); //바로 넘어가버림
            await playVoice({clearMessage: authorName + '님의 비밀대화입니다. ' + clearMessage, voice:'MAN_DIALOG_BRIGHT', speed: '0.85',guild: guildId});


        } catch (err) {
            message.channel.send('음성 모듈 관련 오류가 발생했습니다 ㅜㅜ');
            console.log(err);
        }
    },

    checkAlone: (oldState) => {
        const members = oldState.channel?.members;

        if (members?.size == 1 && members.get('1102861853295644702')) {
            destoryConnection(oldState.guild.id);
            return;
        }

        //병덕 병순 둘만 남을때도 OUT
        if (members?.size == 2 && members.get('1016606382281199697') && members.get('1102861853295644702')) {
            destoryConnection(oldState.guild.id);
            return;
        }
    }
}

function startConnectionTimeout(){
    setInterval(() => {

        const keys = [ ...connections.keys()];
        //console.log(keys);

        for(let i = 0; i < keys.length; i++){
            if(new Date() - connections.get(keys[i]).lastActiveTime >60*60000) //해당 시간 동안 아무런 반응이 없을 경우
            {
                destoryConnection(keys[i]);
            }
        }

    }, 60*1000);
}


function destoryConnection(guildId) {

    connections.get(guildId);
    getVoiceConnection(guildId)?.destroy();

    console.log(`${new Date().toString()}` + `Voice Destroy`);
}


async function playVoice({clearMessage, voice, speed, guildId,maxMessageLength=30}) {
    ////////////////////////메시지 변형부분////////////////////////

    let sampleResource = null;
    const samplePath = path.join(__dirname,'../','../','assets','audio','tts_sample');

    if (clearMessage == '스플' || clearMessage == '스플스케줄' || clearMessage == '스플스케쥴') {
        const schedule = await splatSchedule.getSimpleSchdule();
        speed = 1.0;
        clearMessage = `현재 스플 스케줄을 알려드리겠습니다. 챌린지는 ${schedule.challenge}, 오픈은 ${schedule.open}, 연어는 ${schedule.salmon}이고 무기는 ${schedule.salmonWeapon[0]},${schedule.salmonWeapon[1]},${schedule.salmonWeapon[2]},${schedule.salmonWeapon[3]} 입니다, 오버플로셔,사랑해`
        maxMessageLength=200; 
    }

    if (clearMessage == '시간') {
        const text = timeModule.getTextTime();
        speed = 1.0;
        //message.channel.send(text);
        clearMessage = text;
    }

    if (clearMessage == '오예오예'){
        sampleResource = path.join(samplePath,'오예오예.mp3');
    }

    if (clearMessage == '우와'){
        sampleResource = path.join(samplePath,'우와.mp3');
    }

    //특정 인원 바보기능
    //    if(author == '733572758499229766'){ //산들
    //        clearMessage=`나는 바보다`;
    //    }
    ////////////////////////메시지 변형부분 끝////////////////////////



    const jsonData = {
        "input":{
          "text":clearMessage.substring(0,maxMessageLength)
        },
        "voice":{
          "languageCode":"ko-KR",
          "name": voice,
          //"ssmlGender": "FEMALE"
        },
        "audioConfig":{
          "audioEncoding":"MP3"
        }
      };
        
    await proRequest.download(
        {
            uri:"https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyB2lQzazspX8ShWXXGPCt_Y6Pw4Mvs1WhE",
            method: "POST"
            , headers: {
                "User-Agent": "Mozilla/5.0",
                'Content-Type': 'application/json'
            },
            encoding: null,
            json : jsonData,
            //body: jsonData,
        },`./temp/sub_tts/${guildId}.mp3`);

    let audioPlayer = createAudioPlayer();
    const audioResource = createAudioResource(sampleResource==null?`./temp/sub_tts/${guildId}.mp3`:sampleResource); //사용을 위해서는 assets/audio/temp/tts 폴더가 존재해야 함.
    audioPlayer.play(audioResource);
    getVoiceConnection(guildId).subscribe(audioPlayer);
}

function getVoice(message) {

    // const cmd1 = message.substr(0, 1);
    // const cmd2 = message.substr(1, 1);

    // //console.log(cmd1+cmd2);

    // if (cmd1 == '!' && cmd2 != '!') return 'MAN_DIALOG_BRIGHT';
    // if (cmd1 == '*' && cmd2 != '*') return 'WOMAN_DIALOG_BRIGHT';
    // if (cmd1 == '!' && cmd2 == '!') return 'MAN_READ_CALM';
    // if (cmd1 == '*' && cmd2 == '*') return 'WOMAN_READ_CALM';



    return 'ko-KR-Standard-A';
}

function getClearMessage(message) {
    const cmd1 = message.substr(0, 1);
    const cmd2 = message.substr(1, 1);

    let clearMessage = '';

    if (cmd1 == '^' || cmd1 == '^') clearMessage = message.substring(1);
    if (cmd2 == '^' || cmd2 == '^') clearMessage = message.substring(2);

    return clearMessage;
}

function getSpeed(message) {
    if (!message.includes('(') || !message.includes(')')) return '0.85';

    let startIndex = message.indexOf("(") + 1;
    let endIndex = message.indexOf(")");
    let speed = message.substring(startIndex, endIndex);
    return speed;
}

function getGuildId(message) {
    if (!message.includes('[') || !message.includes(']')) return null;
    let startIndex = message.indexOf("[") + 1;
    let endIndex = message.indexOf("]");
    let guildId = message.substring(startIndex, endIndex);

    if (nameOfGuildId[guildId] != null) { //대체텍스트가 존재할경우 변환
        return nameOfGuildId[guildId];
    }

    return guildId;
}


function initTempDir() {
    if (fs.existsSync('./temp')) {
        fs.rmdirSync('./temp', { recursive: true, force: true });
    }

    fs.mkdirSync('./temp');
    fs.mkdirSync('./temp/sub_tts');
}

module.exports = voiceController;
