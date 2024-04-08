import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readLine from "readline";

dotenv.config();

const genAi = new GoogleGenerativeAI(process.env.API_KEY);

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let isAwaitingResponse = false; // Flag to track if we are waiting for a response

async function run() {
  const model = genAi.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: [], // Start with an empty history
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  async function askAndRespond() {
    if (!isAwaitingResponse) {
      // Check if we are not waiting for a response
      rl.question("You: ", async (msg) => {
        if (msg.toLowerCase() === "exit") {
          rl.close();
        } else {
          isAwaitingResponse = true; // Set the flag to true
          try {
            const result = await chat.sendMessageStream(msg); // Send the message
            let text = "";
            for await (const chunk of result.stream) {
              const chunkText = chunk.text(); // Get the text from the chunk
              console.log("Gemini: ", chunkText);
              text += chunkText;
            }
            isAwaitingResponse = false; // Set the flag to false
            askAndRespond();
          } catch (e) {
            console.error("Error:", e);
            isAwaitingResponse = false; // Set the flag to false
          }
        }
      });
    } else {
      console.log("Waiting for response...");
    }
  }
  askAndRespond(); // Start the chat loop
}

run();
