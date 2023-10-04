
module.exports = {
    messageReply: async (req, res, next) => {
        try {
            const { msg, } = req.body;

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
            return next(err);
        }
    }
}