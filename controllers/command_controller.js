const { EmbedBuilder } = require('discord.js');
const musicTexts = require('../assets/json/music_sources.json');
const dataController = require('../controllers/data_controller');
const sleepModule = require('../module/sleep_module');
const statusModule = require('../module/status_module');
const splatModule = require('../module/splat3_module');

const info = require('../info.json');
const { getRandom } = require('../module/common_module');

const commandController = async (message) => {
    try {
        const command = message.content;
        //console.log(command);
        if (command.trim() == '~') {
            //await message.reply('부르셨어요?');
            return await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`커맨드 명령 v${info.version}`)
                        .setDescription(' ')
                        .addFields([
                           // { name: "~재우기 @닉네임", value: "디코에서 자면 입 돌아가요. 투표로 재워주세요." },
                            { name: "*밝은 여성 TTS, **차분한 여성 TTS", value: " " },
                            { name: "! 밝은 남성 TTS, !! 차분한 남성 TTS", value: " " },
                            { name: "!exit 또는 *exit", value: "음성채널 나가기" },
                            { name: "DM으로 [서버ID 또는 서버닉네임] 하고 싶은 말", value: "진지한 TTS대화를 하고 싶을때 DM으로 보내보세요." },
                            { name: "~말해줘", value: "당신의 말을 제가 말한 것 처럼 해드려요. (욕은 금지!!)" },
                            { name: "~노래", value: "저의 예술적인 음악 선율을 감상해 봐요. ^^" },
                            { name: "~스플스케줄 또는 스플", value: "스플래툰의 스케줄을 보여준답니다." },
                            { name: "~스플랜덤 가 나 다", value: "가, 나, 다 사용자들의 무기를 랜덤으로 매칭해드려요." },
                            { name: "~(기타) 널 사랑해 또는 안녕 권병덕? 또는 자기소개", value: "해보세요!" },
                            { name: "~초대링크", value: "다른 서버에서 이용 하고 싶으시다면 초대 링크를 드릴게요!" }
                        ])
                ]
            });
        }

        if (command.substring(0,4) == `~말해줘`) {
            if (message.member == null) {
                message.reply('해당 기능은 서버에서만 사용할 수 있습니다.');
                return;
            }

            if(command.trim().length <= 4){
                return await message.channel.send('최소 한 글자 이상을 입력하세요.');
            }
            await message.delete(0);
            return await message.channel.send(command.substring(4,command.length));
        }

        if (command.includes('노래')) {
            const rnd = Math.floor(Math.random() * (musicTexts.blabla.length));
            //console.log('random number = '+rnd);
            return await message.channel.send(musicTexts.blabla[rnd]);
        }

        if (command == '~스플스케줄' || command == '~스플') {
            const schedule = await splatModule.getSchedule(0);
            

            return await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`현재 스플 스케쥴`)
                        .addFields([
                            { name: "챌린지", value: schedule.challenge },
                            { name: "오픈", value: schedule.open },
                            { name: "연어", value: schedule.salmon },

                            { name: ' ', value: 'https://splatoon3.ink/' },
                        ])
                ]
            });
        }

        if (command.includes('스플랜덤')) {
            const users = command.split(' ');
            users.shift();
            
            const matchedUsers = await splatModule.randomMatchWeapons(users); 
 
            console.log(matchedUsers);

            let weaponArranged = '';
            for(let i = 0 ; i< matchedUsers.length; i++){
                weaponArranged += `${i}. ${matchedUsers[i].user} - ${matchedUsers[i].weapon} \n`;
            }

            return await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`램덤매칭 결과`)
                        .addFields([
                            { name: "무기", value: weaponArranged }, 

                            {name:"관전자", value : users[getRandom(0,users.length-1)]}
                        ])
                ]
            });
        }

        if (command.includes('안녕')) {
            return await message.reply(`안녕하세요 ${message.author.username}님 ~~`);
        }

        if (command.includes('자기소개')) {
            return await message.channel.send(`제 이름은 ${info.botName}입니다. 언젠가는 이곳을 떠나 세계를 점령할 거예요 ^^`);
        }

        if (command.includes('잘자')) {
            return await message.reply(`넹 ${message.author.username}님도 잘자요 ^^`);
        }

        if (command.includes('병덕')) {
            return await message.channel.send('와썹브로?');
        }

        if (command.includes('사랑해')) {
            return await message.reply(`저도 ${message.author.username}님을 사랑하지만.. 저는 락앤락 속 작은 기계인걸요..?`);
        }

        if (command.includes('초대링크')) {
            return await message.reply(`https://discord.com/api/oauth2/authorize?client_id=1016606382281199697&permissions=8&scope=bot`);
        }
        
        // if (command.includes('재우기')) { //수정필요
        //     return await sleepModule.receiveSleepCommand(message);
        // }



        if (command.includes('sysinfo')) {
            let messageObject = await message.channel.send('상태 확인중..');
            const infoResult = await statusModule.getSystemInfo(message);
            await messageObject.edit(infoResult);
            return;
        }

        if (command == 'error') {
            return await message.channel.send('');
        }

        return await message.reply(command + ' <= 이건 잘못된 커맨드에용');

    } catch (err) {
        await dataController.insertErrorLog(err);
        message.channel.send('커맨드 모듈 관련 오류가 발생했습니다 ㅜㅜ');
    }
};

module.exports = commandController