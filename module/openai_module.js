// This code is for v4 of the openai package: npmjs.com/package/openai
//import OpenAI from "openai";

const OpenAI = require('openai');
const config = require('../config.json');

const openai = new OpenAI({
  apiKey: config.openAI,
});



module.exports = {
  create: async (messages) => {
    try {

      const response = await openai.chat.completions.create({
        "model": "gpt-4",
        "messages": messages,
        "temperature": 0.7
      })
      // const response = await openai.completions.create({
      //   model: "gpt-4",
      //   //model:"gpt-3.5-turbo-instruct-0914",
      //   //prompt: text,
      //   messages: [
      //     {
      //       "role": "system",
      //       "content": "너의 이름은 권병덕이야."
      //     },
      //     {
      //       "role": "user",
      //       "content": text
      //     },
      //   ],
      //   // temperature: 1,
      //   // max_tokens: 256,
      //   // top_p: 1,
      //   // frequency_penalty: 0,
      //   // presence_penalty: 0,
      // });

      return response.choices[0].message.content.trimLeft();
    } catch (err) {
      return `GPT 관련 오류가 발생했습니다 : ${err}`;
    }

  }
}


