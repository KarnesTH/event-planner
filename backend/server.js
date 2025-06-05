import express from "express";
import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/ev-plan";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("MongoDB connection error: ", err);
});

const app = express();
const PORT = 5000;

app.use(express.json());

/**
 * @description: This is the root route. It returns a JSON object with a message and status.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - A JSON object with a message and status
 */
app.get("/", (req, res) => {
    res.send({
        message: "Server is running",
        status: "success",
        db: mongoose.connection.readyState
    })
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});