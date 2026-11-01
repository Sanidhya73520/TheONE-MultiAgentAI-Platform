import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import router from "./routes/auth.route.js";


dotenv.config();

const port = process.env.PORT || 8001;

const app = express();
app.use(express.json());
app.use("/",router);

app.get("/", (req, res) => {
    res.json({ message: "Auth is running" });
});

app.listen(port , () => {
    console.log(`Auth Started at ${port}`);
    connectDb();
})