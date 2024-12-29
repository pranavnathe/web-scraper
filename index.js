import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/index.js";
import {
    runSeleniumScript,
    getLastResults,
} from "./controllers/selenium.controller.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Serve static files
app.use(express.static("pages"));

// CORS Configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "DELETE", "PATCH"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "device-remember-token",
            "Access-Control-Allow-Origin",
            "Origin",
            "Accept",
        ],
    })
);

// Import routes
import healthcheckRouter from "./routes/health.routes.js";

// Routes
app.use("/api/healthcheck", healthcheckRouter);

// Serve the homepage
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "pages" });
});

// SSE Endpoint to stream logs
app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Helper to send logs
    const sendLog = (message) => {
        res.write(`data: ${JSON.stringify({ message })}\n\n`);
    };

    runSeleniumScript(sendLog)
        .then(() => {
            sendLog(
                "Script execution completed. Redirecting to results page..."
            );
            res.end(); // Close the stream
        })
        .catch((error) => {
            sendLog(`Error: ${error.message}`);
            res.end();
        });
});

// Route to run the Selenium script (fallback without SSE)
app.get("/run-script", async (req, res) => {
    try {
        const results = await runSeleniumScript();
        if (results.success) {
            res.redirect("/result.html");
        } else {
            res.status(500).send(
                "Failed to fetch trending topics. Please try again."
            );
        }
    } catch (error) {
        console.error("Error running script:", error);
        res.status(500).send("Script execution failed. Please try again.");
    }
});

// API to fetch the last results
app.get("/api/results", (req, res) => {
    const results = getLastResults();
    if (process.env.NODE_ENV === "development") {
        console.log("Last Results Retrieved in /api/results:", results);
    }
    if (results && results.timestamp) {
        res.json(results);
    } else {
        console.log("No valid results found.");
        res.status(404).send({ message: "No results found." });
    }
});

// Start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
            );
        });
    })
    .catch((error) => {
        console.log(`MonogDB Connection Error`, error);
    });
