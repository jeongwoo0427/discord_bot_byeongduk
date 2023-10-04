
module.exports = {
    messageReply: async (req, res, next) => {
        const { room, msg, sender, isGroupChat, replier, imageDB, packageName } = req.body;
        try {
            

            if (msg.substring(0, 1) == '~') {
                let responseMsg = `${msg} 는 알 수 없는 명령어입니다.`;

                if (msg.includes('하이')) {
                    responseMsg = '안녕하세용';
                }

                return res.send({
                    requestMsg: msg,
                    responseMsg: responseMsg
                })

            }
            
            

            return res.send({ requestMsg: msg, responseMsg:null });

        } catch (err) {
            return res.send({ requestMsg: msg, responseMsg:`명령을 수행하던 도중 서버에서 오류가 발생했어요..ㅜㅜ [메시지 : ${msg}]` });
        }
    }
}