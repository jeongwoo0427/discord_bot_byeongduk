
module.exports = {
    delay: async function delay(milliseconds) {
        await new Promise((resolve, reject) => setTimeout(() => { resolve(); }, milliseconds));
    },

    rspRandom: function () {
        const num = Math.floor(Math.random() * 2);
        switch (num) {
            case 0:
                return '가위';
            case 1:
                return '바위';
            case 2:
                return '보';
            default:
                return 'UNKNOWN';

        }
    }
}