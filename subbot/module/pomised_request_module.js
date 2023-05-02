const https = require('https');
const fs = require('fs');
const request = require('request');

module.exports = {
    get: async (uri) => {
        return await new Promise((resolve, reject) => request.get(uri, (err, res, body) => {
            if (err != null) {
                reject(err);
            }
            resolve(body);
        }));
    },
    post: (uri) => { },
    download: async (options, path) => {

        return await new Promise((resolve, reject) => {

            request(options,()=>{resolve();}).pipe(fs.createWriteStream(path));
            
        });
    }
}