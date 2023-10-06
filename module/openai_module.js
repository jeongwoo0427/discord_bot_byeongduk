// This code is for v4 of the openai package: npmjs.com/package/openai
//import OpenAI from "openai";

const OpenAI = require('openai');
const config = require('../config.json');

const openai = new OpenAI({
  apiKey: config.openAI,
});



module.exports = {
  create: async (text) => {

    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: text,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response;

  }
}


