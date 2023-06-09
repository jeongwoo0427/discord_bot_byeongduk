const db = require('../services/db_service');

const messageModel = {
    insertMessage : async(guildId,guildName,channelId,channelName,authorId,authorName,content,isVoice,attachments,createdTimestamp)=>{ //createdTimestamp 는 패스 db시간때로 적용
        const qry = `INSERT INTO message(guildId,guildName,channelId,channelName,authorId,authorName,content,isVoice,attachments) VALUES(?,?,?,?,?,?,?,?,?)`;
        const rows = await db.executeQuery(qry,[guildId,guildName,channelId,channelName,authorId,authorName,content,isVoice,attachments]);
        return rows;
    }
};

module.exports = messageModel;