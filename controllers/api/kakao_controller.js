const statusModule = require('../../module/status_module');
const shceduleModule = require('../../module/splat3_schedule_module');
const commoneModule = require('../../module/common_module');
const info = require('../../info.json');


const botKey = 'bdfortablet1';

module.exports = {
    messageReply: async (req, res, next) => {
        const { key,room, msg, sender, isGroupChat, replier, imageDB, packageName } = req.body;
        console.log(req.body);
        try {

            if(key != botKey){
                return res.send({ requestMsg: msg, responseMsg:null });
            }

            if(msg.substring(0, 1) == '!'){
                return res.send({
                    requestMsg: msg,
                    responseMsg: '그 커맨드는 디코에서만 써야죠!!'
                });
            }


            if (msg.substring(0, 1) == '~') {
                let responseMsg = `${msg} 는 알 수 없는 명령어입니다.`;


                if (msg.trim() == '~' || msg.includes('사용법')||msg.includes('명령어')) {
                    responseMsg = `권병덕봇 v${info.version}

                    커맨드리스트 

                        ~하이,~안녕하세요, ~하이하이 : 인사를 해줄겁니다.

                        ~점메추 : 쓸데없지만 국룰메뉴를 추천해드려요.

                        ~스플스케쥴, ~스플 : 스플래툰의 스케쥴을 알려드립니다.

                        ~쎄이 헬로 : 헬로
                        
                        끝.`;

                        
                }

                else if (msg.includes('~쎄이')) {
                    responseMsg = `${msg.substring(3,msg.length).trimLeft()}`;
                }

                else if (msg.includes('사랑해')) {
                    responseMsg = `저도 ${sender}님을 사랑해요. 찡긋`;
                }


                else if (msg.includes('하이')) {
                    responseMsg = '안녕하세용';
                }

                else if (msg.includes('안녕')) {
                    responseMsg = '오예오예! 안녕하세요!';
                }


                else if (msg.includes('점메추')) {
                    responseMsg = '돈까스 마라탕 햄버거 중 골라요';
                }

                else if (msg.includes('스플') || msg.includes('연어')) {
                    const schedule = await shceduleModule.getSimpleSchdule();
        
                    responseMsg = `현재 스플 스케줄을 알려드리겠습니다. 

                    챌린지 : ${schedule.challenge}
                    오픈 :  ${schedule.open}
                    연어 : ${schedule.salmon}
                    연어무기
                        - ${schedule.salmonWeapon[0]},
                        - ${schedule.salmonWeapon[1]},
                        - ${schedule.salmonWeapon[2]},
                        - ${schedule.salmonWeapon[3]})

                    (APIFrom : https://splatoon3.ink/)`;
                }

                return res.send({
                    requestMsg: msg,
                    responseMsg: responseMsg
                });

            }
            


            return res.send({ requestMsg: msg, responseMsg:null });

        } catch (err) {
            console.error(err);
            return res.send({ requestMsg: msg, responseMsg:`명령을 수행하던 도중 서버에서 오류가 발생했어요..ㅜㅜ [메시지 : ${msg}]` });
        }
    }
}



//클라이언트측 코드
// const scriptName = "권병덕";
// /**
//  * (string) room
//  * (string) sender
//  * (boolean) isGroupChat
//  * (void) replier.reply(message)
//  * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
//  * (string) imageDB.getProfileBase64()
//  * (string) packageName
//  */
// function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
//     const key = 'bdfortablet1';
//     const host = 'http://182.222.81.5:1133';
//     sendData(key,host, room, msg, sender, isGroupChat, replier, imageDB, packageName);

// }

// function sendData(key,host, room, msg, sender, isGroupChat, replier, imageDB, packageName) {
//   setTimeout(()=>{
//     try{
//         const data = {
//          "key":'key,
//           "room":room,
//          "msg": msg,
//          "sender":sender,
//          "isGroupChat":isGroupChat,
//          "replier":replier,
//          "imageDB":imageDB,
//          "packageName":packageName
  
  
//   };
//     const response = org.jsoup.Jsoup.connect(host+"/api/kakao/messageReply")
//     .header("Content-Type", "application/json")
//     .requestBody(JSON.stringify(data))
//     .ignoreContentType(true)
//     .ignoreHttpErrors(true)
//     .timeout(8000)
//     .post();
    
    
//     const result = JSON.parse(response.text());
    
//     if(result.responseMsg == null){
//       return;
//     }
    
    
    
//     replier.reply(result.responseMsg);
    
//   }  catch (err) {
//     replier.reply(room,"[메시지 : "+msg+" ] 오류가 발생했오요 ㅜㅜ");
//     replier.reply(room, err);
//   }
    
//   },1);
// }


// //아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
// function onCreate(savedInstanceState, activity) {
//   var textView = new android.widget.TextView(activity);
//   textView.setText("Hello, World!");
//   textView.setTextColor(android.graphics.Color.DKGRAY);
//   activity.setContentView(textView);
// }
// function onStart(activity) {
// }
// function onResume(activity) {
// }
// function onPause(activity) {
// }
// function onStop(activity) {
// }
