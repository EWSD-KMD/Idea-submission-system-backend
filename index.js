const express = require("express");
const { PrismaClient } = require("@prisma/client");
const routes = require("./routes");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("University Ideas System API with RBAC");
});
app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
