import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readLine from "readline";

dotenv.config();

const genAi = new GoogleGenerativeAI(process.env.API_KEY);

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function run() {
  const model = genAi.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: [], // Start with an empty history
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  async function askAndRespond() {
    rl.question("You: ", async (msg) => {
      if (msg.toLowerCase() === "exit") {
        rl.close();
      } else {
        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini: " + text);
        askAndRespond();
      }
    });
  }
  askAndRespond(); // Start the chat loop
}

run();
