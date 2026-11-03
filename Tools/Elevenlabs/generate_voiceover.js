/**
 * ElevenLabs Voiceover Generation Helper
 * Usage:
 *   ELEVENLABS_API_KEY="your_key" node generate_voiceover.js "Hello from motion graphics studio" output.mp3
 */

import { ElevenLabsClient } from "elevenlabs";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.ELEVENLABS_API_KEY;
const text = process.argv[2] || "Welcome to the motion graphics video production pipeline.";
const outputPath = process.argv[3] || "../../Output/voiceover.mp3";

async function generateVoiceover() {
  if (!apiKey) {
    console.error("Error: ELEVENLABS_API_KEY environment variable is required.");
    process.exit(1);
  }

  const client = new ElevenLabsClient({ apiKey });

  console.log(`Generating voiceover: "${text}"`);
  const audioStream = await client.textToSpeech.convert("21m00Tcm4TlvDq8ikWAM", {
    text: text,
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
  });

  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Voiceover saved to ${outputPath} (${buffer.length} bytes)`);
}

generateVoiceover().catch(console.error);
