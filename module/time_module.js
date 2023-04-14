
function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();
    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++) zero += '0';
    }
    return zero + n;
}

function getWorldTime(tzOffset) {
    var now = new Date();
    var tz = now.getTime() + (now.getTimezoneOffset() * 60000) + (tzOffset * 3600000);
    now.setTime(tz);
    // var s = leadingZeros(now.getFullYear(), 4) +
    // 	'-' + leadingZeros(now.getMonth() + 1, 2) +
    // 	'-' + leadingZeros(now.getDate(), 2) +
    // 	' ' + leadingZeros(now.getHours(), 2) +
    // 	':' + leadingZeros(now.getMinutes(), 2) +
    // 	':' + leadingZeros(now.getSeconds(), 2);
    return now;
}

module.exports = {
    getWorldTime: getWorldTime,

    getTextTime : () =>{
        const korTime = getWorldTime(9);
        const korHours = korTime.getHours();
        const korMinutes = korTime.getMinutes();
        const laTime = getWorldTime(-7);
        const laHours = laTime.getHours();
        const laMinutes = laTime.getMinutes();
    
        let text = `현재 한국은`;
      
        if(korHours<12){
            text += ` 오전 ${korHours}시 ${korMinutes} 분 이고요,`;
        }else{
            text += ` 오후 ${korHours%12}시 ${korMinutes} 분 이고요,`;
        }
    
        text += ` 미국엘에이는`;
    
        if(laHours<12){
            text += ` 오전 ${laHours}시 ${laMinutes} 분 입니다.`;
        }else{
            text += ` 오후 ${laHours%12}시 ${laMinutes} 분 입니다.`;
        }
    
        return text;
    }
}