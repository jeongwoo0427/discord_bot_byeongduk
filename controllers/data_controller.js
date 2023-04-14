const messageModel = require('../mysql_model/message_model');
const voiceStateModel = require('../mysql_model/voice_state_model');
const errorLogModel = require('../mysql_model/errorlog_model');

const dataController = {
    insertMessage : async(message) =>{
        try{
         
            let attachments;
            message.attachments.forEach(element => {
                if(attachments==null) attachments = '';
                attachments += `${element.url} `;
            });
           const rows = await messageModel.insertMessage(
               message.guild.id,
               message.guild.name,
               message.channel.id,
               message.channel.name,
               message.author.id,
               message.author.username,
               message.content,
               attachments,
               message.createdTimestamp);

        }catch(err){
            console.error(err);
            const rows = await errorLogModel.insertErrorLog(err);
        }
    },

    insertErrorLog : async(err) =>{
        try{
            console.error(err);
            const rows = await errorLogModel.insertErrorLog(err);
        }catch(err){
            console.error(err);
        }
    },

    insertVoiceState : async (state) =>{
        try{
            const status = state.channel == null?'OUT':"JOIN";
            const rows = await voiceStateModel.insertState(
                state.guild.id,
                state.guild.name,
                state.channel?.name,
                state.member.user.username,
                status
                );
        }catch(err){
            console.error(err);
            const rows = await errorLogModel.insertErrorLog(err);
        }
    }
};

module.exports = dataController;