const request = require('./pomised_request_module');

function _convertSchedule(dataJson, langJson, sequence) {

    //return json.data.bankaraSchedules.nodes[0].bankaraMatchSettings;

    return {
        startTime: dataJson.data.bankaraSchedules.nodes[sequence].startTime,
        endTime: dataJson.data.bankaraSchedules.nodes[sequence].endTime,
        challengeRank: {
            vsStages: [
                {
                    name: langJson.stages[dataJson.data.bankaraSchedules.nodes[sequence].bankaraMatchSettings[0].vsStages[0].id].name
                }, {
                    name: langJson.stages[dataJson.data.bankaraSchedules.nodes[sequence].bankaraMatchSettings[0].vsStages[1].id].name
                }],
            vsRule: {
                name : langJson.rules[dataJson.data.bankaraSchedules.nodes[sequence].bankaraMatchSettings[0].vsRule.id].name
            }
        },
        openRank: {
            vsStages: [
                {
                    name: langJson.stages[dataJson.data.bankaraSchedules.nodes[sequence].bankaraMatchSettings[1].vsStages[0].id].name
                }, {
                    name: langJson.stages[dataJson.data.bankaraSchedules.nodes[sequence].bankaraMatchSettings[1].vsStages[1].id].name
                }],
            vsRule: {
                name : langJson.rules[dataJson.data.bankaraSchedules.nodes[sequence].bankaraMatchSettings[1].vsRule.id].name
            }
        },
        salmon: {
            coopStage: {name : langJson.stages[dataJson.data.coopGroupingSchedule.regularSchedules.nodes[sequence].setting.coopStage.id].name},
            weapons:[
                {
                    name : langJson.weapons[dataJson.data.coopGroupingSchedule.regularSchedules.nodes[sequence].setting.weapons[0].__splatoon3ink_id].name
                },
                {
                    name : langJson.weapons[dataJson.data.coopGroupingSchedule.regularSchedules.nodes[sequence].setting.weapons[1].__splatoon3ink_id].name
                },
                {
                    name : langJson.weapons[dataJson.data.coopGroupingSchedule.regularSchedules.nodes[sequence].setting.weapons[2].__splatoon3ink_id].name
                },
                {
                    name : langJson.weapons[dataJson.data.coopGroupingSchedule.regularSchedules.nodes[sequence].setting.weapons[3].__splatoon3ink_id].name
                }
            ] ,
        }
    }
}

function getRandom(min, max)
{
	return Math.floor(Math.random() * (max - min + 1) + min);
} 

module.exports = {
    getSchedule: async (sequence) => {
        const scheduleJson = JSON.parse(await request.get('https://splatoon3.ink/data/schedules.json'));
        const korInfoJson = JSON.parse(await request.get('https://splatoon3.ink/data/locale/ko-KR.json'));

        const schdule = _convertSchedule(scheduleJson, korInfoJson, sequence);

        return {
            challenge : `${schdule.challengeRank.vsRule.name} (${schdule.challengeRank.vsStages[0].name}, ${schdule.challengeRank.vsStages[1].name})`,
            open : `${schdule.openRank.vsRule.name} (${schdule.openRank.vsStages[0].name}, ${schdule.openRank.vsStages[1].name})`,
            salmon : `${schdule.salmon.coopStage.name} 
                - ${schdule.salmon.weapons[0].name}, 
                - ${schdule.salmon.weapons[1].name}, 
                - ${schdule.salmon.weapons[2].name}, 
                - ${schdule.salmon.weapons[3].name} `
        }
    },
    getSimpleSchdule : async () => {
        const scheduleJson = JSON.parse(await request.get('https://splatoon3.ink/data/schedules.json'));
        const korInfoJson = JSON.parse(await request.get('https://splatoon3.ink/data/locale/ko-KR.json'));

        const schdule = _convertSchedule(scheduleJson, korInfoJson, 0);

        return {
            challenge : schdule.challengeRank.vsRule.name.replace(' ',''),
            open : schdule.openRank.vsRule.name.replace(' ',''),
            salmon : schdule.salmon.coopStage.name.replace(' ',''),
            salmonWeapon : [
                schdule.salmon.weapons[0].name.replace(' ',''),
                schdule.salmon.weapons[1].name.replace(' ',''),
                schdule.salmon.weapons[2].name.replace(' ',''),
                schdule.salmon.weapons[3].name.replace(' ','')
            ]
        }
    },

    randomMatchWeapons : async (users) => {
        const localeJson = JSON.parse(await request.get('https://splatoon3.ink/data/locale/ko-KR.json'));
        const weaponsJsonArray = Object.values(localeJson.weapons);

        const weapons = [];
        for(let i =0; i<weaponsJsonArray.length; i++){
            weapons.push(weaponsJsonArray[i].name);
        }

        const matchedUsers = []; 

        for(let i = 0; i<users.length; i++){
            matchedUsers.push({
                user : users[i],
                weapon : weapons[getRandom(0,weapons.length-1)]
            })
        }

        return matchedUsers;
    },

    getRandomMap : async() =>{
        const localeJson = JSON.parse(await request.get('https://splatoon3.ink/data/locale/ko-KR.json'));
        const weaponsJsonArray = Object.values(localeJson.weapons);
    },
}