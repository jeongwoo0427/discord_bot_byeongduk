// This code is for v4 of the openai package: npmjs.com/package/openai
//import OpenAI from "openai";

const OpenAI = require('openai');
const config = require('../config.json');

const openai = new OpenAI({
  apiKey: config.openAI,
});



module.exports = {
  create: async (text) => {
    try{
      const response = await openai.completions.create({
        model: "text-davinci-003",
        //model:"gpt-3.5-turbo-instruct-0914",
        prompt: text,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
  
      return response.choices[0].text.trimLeft();
    }catch(err){
      return  `GPT 관련 오류가 발생했습니다 : ${err.message}`;
    }

  }
}


