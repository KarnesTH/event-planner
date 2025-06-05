import express from "express";
import connectDB from "./core/db.js";
import eventRoutes from "./routes/events.js";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));

const startServer = async () => {
    try {
        await connectDB();
        console.log("MongoDB verbunden");
        
        app.listen(PORT, () => {
            console.log(`Server läuft auf http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Fehler beim Starten des Servers:", err);
        process.exit(1);
    }
};

app.use('/api/events', eventRoutes);

/**
 * @description: This is the root route. It returns a JSON object with a message and status.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - A JSON object with a message and status
 */
app.get("/", (req, res) => {
    res.send({
        message: "Server läuft",
        status: "success"
    });
});

startServer();