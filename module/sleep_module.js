const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle,ButtonInteraction } = require('discord.js');


let votes = new Map();

const sleepModule = {
    receiveSleepCommand: async (message) => {
        if(!message.content.includes('@')) return message.reply('사용자를 재우려면 @닉네임 을 입력해주세요');

        const target = message.mentions.users.first();

        if(!target) return message.reply('해당 사용자는 현재 서버에 없습니다.');


        const memberTarget = message.guild.members.cache.get(target.id);


        
        if (!message.member.voice.channel) return message.reply('재우기 투표를 위해 먼저 음성채팅방에 있어야 합니다.');

        if(!memberTarget.voice.channel) return message.reply('해당 사용자는 음성채팅방에 존재하지 않습니다.');
    
        const voiceMemberCount = memberTarget.voice.channel.members.size;


        const pollEmbed = new EmbedBuilder().setDescription(`해당 사용자를 재웁니다. (과반수 동의시 종료)`).addFields([
            { name: "전체", value: voiceMemberCount.toString(), inline: true },
            { name: "예", value: "0", inline: true },
            { name: "아니요", value: "0", inline: true },
        ]).setColor([104, 204, 156]);


        const replyObject = await message.channel.send('투표 생성중...');

        await new Promise((r) => setTimeout(r, 1000));

        const pollButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel("예").setCustomId(`sleep-yes-${replyObject.id}`).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel("아니요").setCustomId(`sleep-no-${replyObject.id}`).setStyle(ButtonStyle.Success)
        );

        // console.log(memberTarget.nickname??memberTarget.user.username);
        // console.log(memberTarget);

        await replyObject.edit(`이 가여운 ${memberTarget.nickname??memberTarget.user.username} 님의 망령을 꿈나라로 보내줍시다.`);
        await replyObject.edit({ embeds: [pollEmbed], fetchReply: true, components: [pollButtons] });


        
        votes[replyObject.id] = {
            'targetUserId' : target.id,
            'voiceMemberCount':2,
            'votedMembers':new Set()
        }
        
    },

    clickedButton: async (interaction) => {
        if (!interaction.isButton) return;

        //console.log('set의 개수='+votes.length);

        const splittedArray = interaction.customId.split('-');
        const vote = votes[interaction.message.id];
        
        if(vote==null)
        return interaction.reply({content: "해당 투표는 만료되었습니다.",ephemeral:true});

        if(vote['votedMembers'].has(interaction.user.id))
        return interaction.reply({content: "이미 투표에 참여했습니다.",ephemeral:true});

        vote['votedMembers'].add(interaction.user.id);

        const pollEmbed = interaction.message.embeds[0];
        if(!pollEmbed) return interaction.reply({
            content:"찾을 수 없는 투표입니다. 베이즈에게 문의주세요.",
            ephemeral : true
        })




        const totalField = pollEmbed.fields[0];
        const totalCount = parseInt(totalField.value);
        const yesField = pollEmbed.fields[1];
        const noField =pollEmbed.fields[2];

        const VoteCountedReply = '투표를 완료했습니다.';

        switch(splittedArray[1]){
            case "yes" : {
                const newYesCount = parseInt(yesField.value)+1;
                yesField.value = newYesCount;
                
                await interaction.reply({content: VoteCountedReply, ephemeral: true});
                await interaction.message.edit({embeds:[pollEmbed]});

                if(newYesCount>=(totalCount-newYesCount)){
                    const memberTarget = interaction.guild.members.cache.get(vote['targetUserId']);
                    await memberTarget.voice.disconnect();
                    await interaction.message.edit({components:[]}); //예,아니요 버튼 제거 
                }
            }
            break;
            case "no" : {
                const newNoCount = parseInt(noField.value)+1;
                noField.value = newNoCount;

                await interaction.reply({content: VoteCountedReply, ephemeral: true});
                await interaction.message.edit({embeds:[pollEmbed]});

                if(newNoCount>=(totalCount-newNoCount)){
                    await interaction.message.edit({components:[]});
                }
            }
            break;
        }


    },

    sleepWho: async (interaction) => {

        if (!interaction.isSelectMenu()) return;


        interaction.reply('재우기를 시도중입니다.');


        const memberTarget = interaction.guild.members.cache.get('346688211956793344');
        await memberTarget.voice.disconnect();


        // const target = message.mentions.users.first();

        // if (target) {
        //     const memberTarget = message.guild.members.cache.get(target.id);
        //     await memberTarget.voice.disconnect();
        //     message.channel.send("User has been kicked");
        // } else {
        //     message.channel.send(`You coudn't kick that member!`);
        // }

    }
}


module.exports = sleepModule;