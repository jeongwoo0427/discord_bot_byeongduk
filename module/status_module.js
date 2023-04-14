const request = require('./pomised_request_module');
const info = require('../info.json');
const speedCheckModule = require('../module/speed_check_module');

async function getMyIp() {
    try{
        const result = await request.get('https://api.myip.com/');
        jsonResult = JSON.parse(result);
        return jsonResult;
    }catch(err){
        return null;
    }

}

async function delay(milliseconds) {
    await new Promise((resolve,reject)=>setTimeout(()=>{resolve();},milliseconds));
}

module.exports = {
    getSystemInfo : async (message) => {

        let statusText = `-System Information-`;
        await delay(500);
        console.log('check download')
        const donwloadSpeed = await speedCheckModule.getNetworkDownloadSpeed();
        console.log('check upload')
        const uploadSpeed = await speedCheckModule.getNetworkUploadSpeed();
        const ipinfo = await getMyIp();

        statusText += `\nVersion : ${info.version}`;
        //console.log('check iip')
        statusText += `\nHosting-IP : ${ipinfo?.ip.substring(0,7)}*******`;
        statusText += `\nCountry : ${ipinfo?.country}`;
        statusText += `\nCC : ${ipinfo?.cc}`;
        statusText += `\nNetwork-Download : ${donwloadSpeed}`;
        statusText += `\nNetwork-Upload: ${uploadSpeed}`;
        statusText += `\nCurrent-Guild-Name : ${message.guild.name}`;
        statusText += `\nCurrent-Guild-ID: ${message.guild.id}`;
        statusText += `\nBot-Name : ${info.botName}`;
        statusText += `\nBot-Sex : ${info.sex}`;
        statusText += `\nAuthor : ${info.author}`;
        

        return statusText;
    }
}