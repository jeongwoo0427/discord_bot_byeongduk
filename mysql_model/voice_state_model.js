const db = require('../services/db_service');

const voiceStateModel = {
    insertState : async(guildId,guildName,channelName,userName,state)=>{ //createdTimestamp 는 패스 db시간때로 적용
        const qry = `INSERT INTO voice_state(guildId,guildName,channelName,userName,state) VALUES(?,?,?,?,?)`;
        const rows = await db.executeQuery(qry,[guildId,guildName,channelName,userName,state]);
        return rows;
    }
};

module.exports = voiceStateModel;