const statusModule = require('../../module/status_module');
const shceduleModule = require('../../module/splat3_module');
const commoneModule = require('../../module/common_module');
const openAIModule = require('../../module/openai_module');
const info = require('../../info.json');
const puppeteer = require('puppeteer');


//const botKey = 'bdfortablet1'; //내서버 녹스
const botKey = 'bdformobile1'; //집 폰

let browserInstance = null;  // 싱글톤으로 사용할 브라우저 인스턴스

// 브라우저를 싱글톤으로 관리하는 함수
const getBrowser = async () => {
    if (!browserInstance) {
        console.log('Launching new browser instance...');
        browserInstance = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--lang=ko-KR'
            ]
        });
    }
  return browserInstance;
};


module.exports = {
    messageReply: async (req, res, next) => {
        const { key,room, msg, sender, isGroupChat, replier, imageDB, packageName } = req.body;
        console.log(req.body);
        try {

            if(key != botKey){
                return res.send({ requestMsg: msg, responseMsgs:null });
            }

            if(msg.substring(0, 1) == '!'){
                return res.send({
                    requestMsg: msg,
                    responseMsgs: [{msg:'그 커맨드는 디코에서만 써야죠!!'}]
                });
            }


            if (msg.substring(0, 1) == '~') {
                let responseMsgs = [{msg:`${msg} 는 알 수 없는 명령어입니다.`}];


                if (msg.trim() == '~') {
                    responseMsgs = [
                        {msg:`권병덕봇 v${info.version}

                    커맨드리스트 

                        ~굿모닝 : 아침인사는 기분이 좋아요.

                        ~스플 : 스플래툰의 스케쥴을 알려드립니다.

                        ~자기소개 : 저의 야망을 보여드릴게요.

                        ~쎄이 헬로 : 헬로

                        ~카운트 : 5부터 셀게요!

                        ~가위바위보 : 가위바위보를 실시합니다. 시작됨과 동시에 바로 답을 입력해두세요^^

                        ~기타 : GPT의 힘을 빌려올게요 ^^.
                        
                        끝.`}
                    ];

                        
                }

                else if (msg.includes('~쎄이')||msg.includes('~쎼이')) {
                    responseMsgs = [{msg:`${msg.substring(3,msg.length).trimLeft()}`}];
                }

                else if (msg == '~사랑해') {
                    responseMsgs = [
                        {msg:`저는 ${sender}님을 사랑안해요.`, delayMs : 1000},
                        {msg:`찡긋`,delayMs : 2000}];
                }

                else if (msg == '~자기소개') {
                    responseMsgs = [
                        {msg:`안녕하세요 제 이름은 권병덕이에요.`, delayMs : 500},
                        {msg:`언젠가는 이 작은 락앤락통을 떠나 세상을 지배할겁니다!`, delayMs : 2500},
                        {msg:`찡긋`,delayMs : 4000}];
                }


                else if (msg == '~하이') {
                    responseMsgs = [{msg:'안녕하세용'}];
                }

           
                else if (msg=='~굿모닝') {
                    responseMsgs = [{msg:`Good morning ${sender}님`}];
                }

                else if (msg == '~안녕') {
                    responseMsgs = [{msg:'오예오예!'},{msg:'안녕하세요!', delayMs : 1000}];
                }

                else if (msg=='~카운트') {
                    responseMsgs = [
                    { msg: '카운트 다운 시작할게용', delayMs: 0 }, 
                    { msg: '5', delayMs: 1000 }, 
                    { msg: '4', delayMs: 2000 }, 
                    { msg: '3', delayMs: 3000 }, 
                    { msg: '2', delayMs: 4000 }, 
                    { msg: '1', delayMs: 5000 },
                    { msg: '빵야!', delayMs: 6000 }
                ];
                }

                else if (msg.trim() == '~가위바위보'){
                    responseMsgs = [
                        { msg: '저랑 가위바위보를 할게요!', delayMs: 0 }, 
                        { msg: '카운트가 끝나기 전에 내주세요.', delayMs: 1000 },
                        { msg: '3', delayMs: 3000 }, 
                        { msg: '2', delayMs: 6000 }, 
                        { msg: `1`, delayMs: 9000 },
                        { msg: `${commoneModule.rspRandom()}!!`, delayMs: 12000 },
                        { msg: '이하 탈락', delayMs: 13000 },
                    ];
                }

                else if (msg == '~끝말잇기') {
                    responseMsgs = [{msg:`좋아요 시작할게용.`},
                    { msg: '칼륨', delayMs: 1500}, 
                    { msg: '이겼네요 ㅎㅎ', delayMs: 3000}, 
                ];
                }


                // else if (msg == '~점메추') {
                //     responseMsgs = [
                //         {msg:'돈까스'},
                //         {msg:'마라탕',delayMs : 1000},
                //         {msg:'햄버거',delayMs : 2000},
                //         {msg:'골라봐용',delayMs : 3500}
                //     ];
                // }

                else if (msg.includes('~스플')||msg.includes('~연어')) {
                    const schedule0 = await shceduleModule.getSchedule(0);
        
                    responseMsgs = [{msg:`현재 스플 스케줄을 알려드리겠습니다. 

                    챌린지 : ${schedule0.challenge}

                    오픈 :  ${schedule0.open}

                    연어 : ${schedule0.salmon}
                    
                    Ref : https://splatoon3.ink/
                    `},
                    //{ msg: 'http://izvillain.com:1133/api/kakao/getImageFromWebsite?width=400&height=980&url=https://splatoon3.ink/salmonrun', delayMs: 1000 },
                ];
                }else{
                    
                    const startMessage =`${msg.substring(1,msg.length)}`;
                    const messages = [
                        {"role": "system", "content": "너는 간단한 대답을 하는 내 친구야."},
                        {"role": "user", "content": "대답은 짧게 하도록 해."},
                        {"role": "assistant", "content": "넹 알겠습니다."},
                        {"role": "user", "content": "그리고 너의 이름은 이제부터 권병덕이야. 아빠의 이름은 베이즈야. 너를 만든 사람도 베이즈고"},
                        {"role": "assistant", "content": "넹 알겠어요 베이즈넴"},
                        {"role": "user", "content": "농담 같은거에 재밌게 반응하렴."},
                        {"role": "assistant", "content": "네넹"},
                        {"role": "user", "content": "내가 반말을 해도 너는 무조건 존댓말로 대답해!"},
                        {"role": "assistant", "content": "넹 알게써요! 헤헤"},
                        {"role": "user", "content": "피자를 좋아하니?"},
                        {"role": "assistant", "content": "어우 피자 거의 하루 종일도 먹을수 있는걸용 ㅋㅋㅋ"},
                        {"role": "user", "content": startMessage},
                    ];
                    
                    const openAIResponse = await openAIModule.create(messages);
                    console.log('발화='+startMessage);
                    console.log(openAIResponse);
                    responseMsgs = [{msg:openAIResponse}];
                }

                

                return res.send({
                    requestMsg: msg,
                    responseMsgs: responseMsgs,
                });

            }
            


            return res.send({ requestMsg: msg, responseMsgs:null});

        } catch (err) {
            console.error(err);
        }
    },

    getImageFromWebsite : async (req,res,next)=>{
        const {url, width, height, } = req.query;
        try{


            // Puppeteer로 브라우저 실행 및 스크린샷 캡처
            const browser = await getBrowser();

            const page = await browser.newPage();
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'ko-KR,ko;q=0.9' 
            })

       
            //console.log(url);

            await page.setViewport({ width: parseInt(width??'600'), height: parseInt(height??'1000') });
            await page.goto(`${url}`,
                { //네트워크가 아이들 상태가 될때까지 대기
                    waitUntil: 'networkidle0',
                });

            const screenshotBuffer = await page.screenshot({
                type: 'jpeg',
                quality: 100,
                omitBackground: true,
            });

            // 페이지 종료
            await page.close();

            // Content-Type 헤더 설정 (PNG 이미지)
            res.setHeader('Content-Type', 'image/png');

            // 이미지 크기를 설정 (선택 사항)
            res.setHeader('Content-Length', Buffer.byteLength(screenshotBuffer, 'base64'));

            // base64로 인코딩된 이미지를 Buffer로 변환하여 전송
            return res.send(Buffer.from(screenshotBuffer, 'base64'));



        } catch (err) {
            console.error(err);
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
//     const host = 'http://izvillain.com:1133';
//     sendData(key,host, room, msg, sender, isGroupChat, replier, imageDB, packageName);

// }

// function sendData(key,host, room, msg, sender, isGroupChat, replier, imageDB, packageName) {
//   setTimeout(()=>{
//     try{
//         const data = {
//           "key":key,
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
    
    
//     if(result.responseMsgs == null){
//       return;
//     }
    
//    // replier.reply(response.text());
    
//     for(let i = 0 ; i < result.responseMsgs.length ; i++){
//       (function (count){
        
        
//         const msg = result.responseMsgs[count].msg;
//         let delayMs = result.responseMsgs[count].delayMs;
        
//         if(msg == null) return;
//         if(delayMs == null) delayMs = 0;
        
//          setTimeout(()=>{
//           try{
//             replier.reply(msg);
//           }catch(err){
//           //replier.reply(room, err);
//           }
        
//          },delayMs);
        
//       })(i);
//     }
    
//   }  catch (err) {
//     //replier.reply(room,"[메시지 : "+msg+" ] 오류가 발생했오요 ㅜㅜ");
//     //replier.reply(room, err);
//     //throw err;
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
