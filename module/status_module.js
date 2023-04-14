const request = require('./pomised_request_module');
const info = require('../info.json');
const speedCheckModule = require('../module/speed_check_module');

async function getMyIp() {
    const result = await request.get('https://api.ipify.org?format=json');
    jsonResult = JSON.parse(result);
    return jsonResult.ip;
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
        statusText += `\nVersion : ${info.version}`;
        //console.log('check iip')
        //statusText += `\nHosting-IP : ${await getMyIp()}`;
        statusText += `\nNetwork-Download : ${donwloadSpeed}`;
        statusText += `\nNetwork-Upload: ${uploadSpeed}`;
        statusText += `\nCurrent-Guild-Name : ${message.guild.name}`;
        statusText += `\nCurrent-Guild-ID: ${message.guild.id}`;
        statusText += `\nBot-Name : ${info.botName}`;
        statusText += `\nAuthor : ${info.author}`;
        

        return statusText;
    }
}