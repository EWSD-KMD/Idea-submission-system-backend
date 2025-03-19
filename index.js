import express from "express";
import errorHandler from "./middlewares/errorHandlers.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("University Ideas System API with RBAC");
});
app.use("/api", routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
