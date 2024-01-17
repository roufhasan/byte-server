const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const OpenAI = require("openai");
const { MongoClient, ServerApiVersion } = require("mongodb");

// middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gc5eeuu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const chatsCollection = client.db("chatsDB").collection("chats");

    app.get("/previous-chats", async (req, res) => {
      const result = await chatsCollection.find().toArray();
      res.send(result);
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

        res.send(response.choices[0].message);
      } catch (err) {
        res.status(500).send(err);
      }
    });

    app.post("/saveMessages", async (req, res) => {
      const { identifier, messages } = req.body;
      const result = await chatsCollection.insertOne({ identifier, messages });

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Byte Server is running");
});

app.listen(port, () => {
  console.log(`Byte Server is running on port ${port}`);
});
