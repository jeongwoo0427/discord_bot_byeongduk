const dataController = require('./data_controller');
const fs = require('fs');
const path = require('node:path');
//const discordTTS = require('discord-tts');
const config = require('../config.json');
const request = require('request');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection, getVoiceConnection,AudioPlayerStatus } = require('@discordjs/voice');
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


            if (clearMessage.trim().substring(0, 5).includes('play') || clearMessage.trim().substring(0, 5).includes('PLAY') || clearMessage.trim().substring(0, 5).includes('Play')) {
                return
            }

            if (clearMessage.trim().substring(0, 5).includes('exit') || clearMessage.trim().substring(0, 5).includes('EXIT') || clearMessage.trim().substring(0, 5).includes('Exit')) {
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

                connections.set(guildId, {
                    channelId: null,
                    lastActiveTime: new Date(),
                    audioPlayer: null,
                    audioResourceStack : []
                });

                connection?.destroy();

                joinVoiceChannel({
                    guildId: guildId,
                    channelId: channelId,
                    adapterCreator: message.guild.voiceAdapterCreator
                });

                connections.get(guildId).channelId = channelId;

                console.log(`joined voice channel!`);
            }




            await playVoice({ clearMessage: clearMessage, voice: voice, speed: speed, guildId: guildId });


            connections.get(guildId).lastActiveTime = new Date();


            // console.log(`connectionState=${liveState}`);
            // console.log('guildId=' + guildId + ' channelId=' + channelId);
            // console.log(`clearMessage=${clearMessage}`)
            // console.log(`===============================================================================`);

        } catch (err) {
            await dataController.insertErrorLog(err);
            message.channel.send('음성 모듈 관련 오류가 발생했습니다 ㅜㅜ');
            //console.log(err);
        }
    },
    checkAlone: (oldState) => {
        const members = oldState.channel?.members;

        if (members?.size == 1 && members.get('1016606382281199697')) {
            destoryConnection(oldState.guild.id);
        }

        //병덕 병순 둘만 남을때도 OUT
        if (members?.size == 2 && members.get('1016606382281199697') && members.get('1102861853295644702')) {
            destoryConnection(oldState.guild.id);
            return;
        }
    }
}

function startConnectionTimeout() {
    setInterval(() => {

        const keys = [...connections.keys()];
        //console.log(keys);

        for (let i = 0; i < keys.length; i++) {
            if (new Date() - connections.get(keys[i]).lastActiveTime > 60 * 60000) //해당 시간 동안 아무런 반응이 없을 경우
            {
                destoryConnection(keys[i]);
            }
        }

    }, 60 * 1000);
}



function destoryConnection(guildId) {

    connections.delete(guildId);
    getVoiceConnection(guildId)?.destroy();

    console.log(`${new Date().toString()}` + `Voice Destroy`);
}

async function playVoice({ clearMessage, voice, speed, guildId, maxMessageLength = 80 }) {
    ////////////////////////메시지 변형부분////////////////////////

    if (clearMessage == '스플' || clearMessage == '스플스케줄' || clearMessage == '스플스케쥴') {
        const schedule = await splatSchedule.getSimpleSchdule();
        speed = 1.0;
        clearMessage = `현재 스플 스케줄을 알려드리겠습니다. 챌린지는 ${schedule.challenge}, 오픈은 ${schedule.open}, 연어는 ${schedule.salmon}이고 무기는 ${schedule.salmonWeapon[0]},${schedule.salmonWeapon[1]},${schedule.salmonWeapon[2]},${schedule.salmonWeapon[3]} 입니다. 즐거운 스플래툰 되세요.`
        maxMessageLength = 200;
    }

    if (clearMessage == '시간') {
        const text = timeModule.getTextTime();
        speed = 1.0;
        //message.channel.send(text);
        clearMessage = text;
    }

    //특정 인원 바보기능
    //    if(author == '733572758499229766'){ //산들
    //        clearMessage=`나는 바보다`;
    //    }
    ////////////////////////메시지 변형부분 끝////////////////////////


    const jsonData = {
        "audioConfig": {
            "audioEncoding": "MP3",
            "pitch": 0.0,
        },
        "input": {
            "text": clearMessage.substring(0, maxMessageLength)
        },
        "voice": voice

    };

    const file = `./temp/tts/${guildId}_${Date.now()}.mp3`;

    await proRequest.download(
        {
            uri: "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyB2lQzazspX8ShWXXGPCt_Y6Pw4Mvs1WhE",
            method: "POST"
            , headers: {
                "User-Agent": "Mozilla/5.0",
                'Content-Type': 'application/json'
            },
            encoding: null,
            json: jsonData, 
        },

        file);

    const connection = connections.get(guildId);
    connection.audioResourceStack.push(file);

    if(connection.audioPlayer == null){
        let audioPlayer = createAudioPlayer();
        getVoiceConnection(guildId).subscribe(audioPlayer);

        connection.audioPlayer = audioPlayer;
        connection.audioPlayer.on('stateChange',(oldState,newState)=>{
            if(oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle){
                console.log('이전 오디오 플레이 완료!');
                const nextFile = connection.audioResourceStack[0];
                if(nextFile != null){ 
                    const audioResource = createAudioResource(nextFile); //사용을 위해서는 assets/audio/temp/tts 폴더가 존재해야 함.
                    connection.audioPlayer.play(audioResource);
                    connection.audioResourceStack.shift();
                }
            }
        });
    }

    if(connection.audioPlayer._state.status == AudioPlayerStatus.Idle){
        const nextFile = connection.audioResourceStack[0];
        if(nextFile != null){
            const audioResource = createAudioResource(nextFile); //사용을 위해서는 assets/audio/temp/tts 폴더가 존재해야 함.
            connection.audioPlayer.play(audioResource);
            connection.audioResourceStack.shift();
        }
    }

    //console.log(getVoiceConnection(guildId)?.joinConfig);

}

function getVoice(message) {

    const cmd1 = message.substr(0, 1);
    const cmd2 = message.substr(1, 1);

    //console.log(cmd1+cmd2);

    if (cmd1 == '!' && cmd2 == '!') return {
        "languageCode": "ko-KR",
        "name": "ko-KR-Standard-D",
    };

    if (cmd1 == '*' && cmd2 == '*') return {
        "languageCode": "ko-KR",
        "name": "ko-KR-Standard-B",
    };


    if (cmd1 == '!' && cmd2 == 'e') return {
        "languageCode": "en-US",
        "name": "en-US-Neural2-J",
    };

    if (cmd1 == '!' && cmd2 == 'j') return {
        "languageCode": "ja-JP",
        "name": "ja-JP-Neural2-C",
    };

    if (cmd1 == '!' && cmd2 == 's') return {
        "languageCode": "es-ES",
        "name": "es-ES-Neural2-F"
      };

    if (cmd1 == '*' && cmd2 == 'j') return {
        "languageCode": "ja-JP",
        "name": "ja-JP-Wavenet-A"
    };




    if (cmd1 == '!') return {
        "languageCode": "ko-KR",
        "name": "ko-KR-Standard-C",
    };

    if (cmd1 == '*') return {
        "languageCode": "ko-KR",
        "name": "ko-KR-Standard-A",
    };


    return {
        "languageCode": "ko-KR",
        "name": "ko-KR-Standard-D",
    };
}

function getClearMessage(message) {
    const cmd1 = message.substr(0, 1);
    const cmd2 = message.substr(1, 1);

    let clearMessage = '';

    if (cmd1 == '!' || cmd1 == '*') {
        if (cmd2 == '!' || cmd2 == '*' || cmd2 == 'e' || cmd2 == 'j' || cmd2 == 's') clearMessage = message.substring(2)
        else clearMessage = message.substring(1);
    }


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
    fs.mkdirSync('./temp/tts');
}

module.exports = voiceController;