const dataController = require('./data_controller');
const fs = require('fs');
//const discordTTS = require('discord-tts');
const config = require('../config.json');
const request = require('request');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } = require('@discordjs/voice');
const splatSchedule = require('../module/splat3_schedule_module');
const timeModule = require('../module/time_module');
const proRequest = require('../module/pomised_request_module');



initTempDir();

const connections = new Map();


const voiceController = {
    useUserTTS: async (message) => {
        try {
            console.log(connections);

            if (message.member == null) {
                message.reply('해당 기능은 서버에서만 사용할 수 있습니다.');
                return;
            }

            if (!message.member.voice.channel) {
                message.reply('TTS를 사용하기 위해 먼저 음성채널에 있어야 합니다.')
                return false;
            }

            if (message.content.length <= 1) {
                message.reply('최소 1개 이상의 글자를 입력해주세요.');
                return false
            }


            const guildId = message.guildId.toString();
            const channelId = message.member.voice.channel.id.toString();

            let rawMessage = message.content;
            let clearMessage = getClearMessage(rawMessage);
            let voice = getVoice(rawMessage);
            let speed = getSpeed(rawMessage);


            const connectionState = connections[guildId]?.channels[channelId]?.state?.status;

            console.log(`===============================================================================`);
            console.log(`${new Date().toString()}`);
            console.log(`connectionState1=${connectionState}`);
            console.log('guildId=' + guildId + ' channelId=' + channelId);
            console.log(`clearMessage=${clearMessage}`)

            if (clearMessage.includes('exit')) {

                if (connectionState == 'ready') {
                    //console.log('exit');

                    connections[guildId].channels[channelId].destroy();
                    connections[guildId].channels[channelId] = null;
                }
                return
            }


            if (connectionState != `ready`) {



                connections[guildId] = { channels: new Map() };

                console.log(`created new channel map`);

                connections[guildId].channels[channelId] = joinVoiceChannel({
                    guildId: guildId,
                    channelId: channelId,
                    adapterCreator: message.guild.voiceAdapterCreator
                });
                const connectionState2 = connections[guildId]?.channels[channelId]?.state?.status;
                console.log(`${new Date().toString()} : joined voice channel`);
                console.log(`connectionState2=${connectionState2}`);
                // console.log(connection.);
            }



            playVoice(clearMessage, voice, speed, guildId, channelId);


            // const post = request.post('https://kakaoi-newtone-openapi.kakao.com/v1/synthesize', {
            //     headers: {
            //         'Content-Type': 'application/xml',
            //         Authorization: `KakaoAK ${config.kakao_token}`,
            //     },
            //     body: xmlData,
            // }, () => {
            //     let audioPlayer = createAudioPlayer();
            //     const audioResource = createAudioResource(`./temp/tts/${guildId}.mp3`); //사용을 위해서는 assets/audio/temp/tts 폴더가 존재해야 함.
            //     audioPlayer.play(audioResource);
            //     connections[guildId].channels[channelId].subscribe(audioPlayer);
            // });
            // post.pipe(fs.createWriteStream(`./temp/tts/${guildId}.mp3`),)


        } catch (err) {
            await dataController.insertErrorLog(err);
            message.channel.send('음성 모듈 관련 오류가 발생했습니다 ㅜㅜ');
        }
    },
    
    usePrivateTTS : async(message) => {
        try{

            const rawMessage = message.content;
            const guildId = getGuildId(rawMessage);

            if(guildId == null){
                return message.reply('올바른 TTS 커맨드를 입력해주세요. ( ex. [29832912391293]이렇게요. )');
            }
        
            //console.log(guildId);




            
        } catch (err) {
            await dataController.insertErrorLog(err);
            message.channel.send('음성 모듈 관련 오류가 발생했습니다 ㅜㅜ');
        }
    }
}


async function playVoice(clearMessage, voice, speed, guildId, channelId) {
    ////////////////////////메시지 변형부분////////////////////////


    if (clearMessage == '스플' || clearMessage == '스플스케줄' || clearMessage == '스플스케쥴') {
        const schedule = await splatSchedule.getSimpleSchdule();
        speed = 1.0;
        clearMessage = `현재 스플 스케줄을 알려드리겠습니다<break time="500ms"/>. 챌린지는 ${schedule.challenge}<break time="500ms"/>, 오픈은 ${schedule.open}<break time="500ms"/>, 연어는 ${schedule.salmon}이고 무기는 ${schedule.salmonWeapon[0]},${schedule.salmonWeapon[1]},${schedule.salmonWeapon[2]},${schedule.salmonWeapon[3]} 입니다, 오버플로셔,사랑해`
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


    const xmlData =
        `
                <speak>
                <voice name="`+ voice + `">
                <prosody rate="`+ speed + `" volume="loud">
                `
        //+author+'님의 말  <break time="300ms"/>' 
        + clearMessage
        +
        `
                </prosody>
                </voice>
                </speak>
                `;


    await proRequest.download(
        {

            method: "POST"
            , uri: "https://kakaoi-newtone-openapi.kakao.com/v1/synthesize"
            , headers: {
                "User-Agent": "Mozilla/5.0",
                'Content-Type': 'application/xml',
                Authorization: `KakaoAK ${config.kakao_token}`,
            },
            encoding: null,
            body: xmlData,
        },

        `./temp/tts/${guildId}.mp3`);

    let audioPlayer = createAudioPlayer();
    const audioResource = createAudioResource(`./temp/tts/${guildId}.mp3`); //사용을 위해서는 assets/audio/temp/tts 폴더가 존재해야 함.
    audioPlayer.play(audioResource);
    connections[guildId].channels[channelId].subscribe(audioPlayer);
}

function getVoice(message) {

    const cmd1 = message.substr(0, 1);
    const cmd2 = message.substr(1, 1);

    //console.log(cmd1+cmd2);

    if (cmd1 == '!' && cmd2 != '!') return 'MAN_DIALOG_BRIGHT';
    if (cmd1 == '*' && cmd2 != '*') return 'WOMAN_DIALOG_BRIGHT';
    if (cmd1 == '!' && cmd2 == '!') return 'MAN_READ_CALM';
    if (cmd1 == '*' && cmd2 == '*') return 'WOMAN_READ_CALM';



    return 'MAN_DIALOG_BRIGHT';
}

function getClearMessage(message) {
    const cmd1 = message.substr(0, 1);
    const cmd2 = message.substr(1, 1);

    let clearMessage = '';

    if (cmd1 == '!' || cmd1 == '*') clearMessage = message.substring(1);
    if (cmd2 == '!' || cmd2 == '*') clearMessage = message.substring(2);

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
    if(!message.includes('[') || !message.includes(']')) return null;
    let startIndex = message.indexOf("[") + 1;
    let endIndex = message.indexOf("]");
    let guildId = message.substring(startIndex, endIndex);

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