import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import router from "./routes/billing.routes.js";

dotenv.config();

const port = process.env.PORT || 8004;

const app = express();
app.use(express.json());
app.use("/",router);

app.get("/", (req, res) => {
  res.json({ message: "Billing is running" });
});

app.listen(port, () => {
  console.log(`Billing Started at ${port}`);
  connectDb();
});
