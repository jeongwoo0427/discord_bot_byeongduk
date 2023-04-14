const db = require('../services/db_service');

const messageModel = {
    insertErrorLog : async(err)=>{ //createdTimestamp 는 패스 db시간때로 적용
        const qry = `INSERT INTO errorlog(log,stack) VALUES (?,?)`;
        const rows = await db.executeQuery(qry,[err.toString(),err.stack.toString()]);
        return rows;
    }
};

module.exports = messageModel;