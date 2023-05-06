const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://harsh:harsh@cluster0.mach0uu.mongodb.net/";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const collection = client.db("QuadB_Db").collection("tickers");
    await fetch("https://api.wazirx.com/api/v2/tickers")
      .then((res) => res.json())
      .then((data) => {
        const top10 = Object.values(data)
          .sort((a, b) => b.last - a.last)
          .slice(0, 10)
          .map((item) => ({
            name: item.name,
            last: item.last,
            buy: item.buy,
            sell: item.sell,
            volume: item.volume,
            base_unit: item.base_unit,
          }));

        collection.updateOne(
          { _id: "top10" },
          { $set: { tickers: top10 } },
          { upsert: true },
          (err) => {
            if (err) {
              console.error("Error updating top10 tickers", err);
            } else {
              console.log("Top10 tickers updated");
            }
          }
        );
      })
      .catch((err) => {
        console.error("Error fetching tickers", err);
      });

    app.get("/", async (req, res) => {
      const tickers = await collection.find().toArray();
      res.json(tickers);
    });
  } finally {
  }
}
run();

app.listen(port, () => {
  console.log(`Local server running on ${port}`);
});
