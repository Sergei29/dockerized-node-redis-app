const express = require("express");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const client = redis.createClient({
  socket: {
    host: "redis-server", // as specified in the docker-compose.yml line:6
    port: 6379,
  },
});

client.on("connect", () => {
  console.log("Redis Client Connected!");
});
client.on("error", (err) => {
  console.log(
    "Redis Client Error",
    err,
    "\n========================\nMake sure you are running redis on your machine prior starting the express server. Example cli: $ docker run -p 6379:6379 -it redis/redis-stack-server:latest\n========================",
  );
  client.quit();
});

client.connect();

client.set("visits", 0);

app.get("/", async (req, res, next) => {
  try {
    const visits = await client.get("visits");
    await client.set("visits", parseInt(visits, 10) + 1);
    res.status(200).json({ data: visits });
  } catch (error) {
    const msg = error instanceof Error ? error.message : error.toString();
    res.statusMessage = "Redis get key method failure";
    res.status(500).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Express server at http://localhost:${PORT}`);
});
