const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const OpenAI = require("openai");

// middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "assistant", content: prompt }],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.send(response.choices[0].message.content);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/", (req, res) => {
  res.send("Byte Server is running");
});

app.listen(port, () => {
  console.log(`Byte Server is running on port ${port}`);
});
