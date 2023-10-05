
module.exports ={
    delay : async function delay(milliseconds) {
        await new Promise((resolve,reject)=>setTimeout(()=>{resolve();},milliseconds));
    }
}