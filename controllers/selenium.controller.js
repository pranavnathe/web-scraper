import { Builder, By, until } from "selenium-webdriver";
import axios from "axios";
import dotenv from "dotenv";
import { ScriptResult } from "../models/scriptResult.model.js";
import { Capabilities } from "selenium-webdriver";

dotenv.config();

let lastResults = {}; // Store last results in memory

async function getCurrentIP() {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        return response.data.ip;
    } catch (error) {
        console.error("Failed to fetch IP address:", error.message);
        return "Unknown IP";
    }
}

export async function runSeleniumScript(sendLog = console.log) {
    sendLog("Running Selenium script...");

    // Configure proxy for Selenium
    const proxyAddress = process.env.PROXYMESH_URL;
    const proxyCredentials = `${process.env.PROXYMESH_USERNAME}:${process.env.PROXYMESH_PASSWORD}`;
    const proxySettings = `http://${proxyCredentials}@${proxyAddress}`;

    const capabilities = Capabilities.chrome(); // Use chrome capabilities
    capabilities.setProxy({
        proxyType: "manual",
        httpProxy: proxySettings,
        sslProxy: proxySettings,
    });
    capabilities.setAcceptInsecureCerts(true);

    const driver = await new Builder()
        .forBrowser("chrome")
        .withCapabilities(capabilities)
        .build();

    try {
        const userIpAddress = await getCurrentIP();
        sendLog(`Your IP address is: ${userIpAddress}`);
        sendLog(`Proxy IP: ${proxyAddress}`);

        // Start navigating with proxy
        sendLog("Navigating to X.com...");
        await driver.get("https://x.com");

        sendLog("Clicking on the 'Sign in' button...");
        const signInButton = await driver.wait(
            until.elementLocated(By.xpath("//a[@data-testid='loginButton']")),
            10000
        );
        await signInButton.click();

        sendLog("Entering username...");
        const usernameField = await driver.wait(
            until.elementLocated(By.xpath("//input[@name='text']")),
            10000
        );
        await usernameField.sendKeys(process.env.USERNAME);

        sendLog("Clicking 'Next' button...");
        const nextButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Next')]")),
            10000
        );
        await nextButton.click();

        sendLog("Entering password...");
        const passwordField = await driver.wait(
            until.elementLocated(By.xpath("//input[@name='password']")),
            10000
        );
        await passwordField.sendKeys(process.env.PASSWORD);

        sendLog("Clicking 'Log in' button...");
        const loginButton = await driver.wait(
            until.elementLocated(
                By.xpath("//button[@data-testid='LoginForm_Login_Button']")
            ),
            10000
        );
        await loginButton.click();

        sendLog("Waiting for homepage to load...");
        await driver.wait(
            until.elementLocated(
                By.xpath("//section[@aria-labelledby='accessible-list-0']")
            ),
            20000
        );
        sendLog("Homepage loaded successfully.");

        sendLog("Fetching trending topics...");
        const trendingTopics = [];

        try {
            const trendElements = await driver.wait(
                until.elementsLocated(By.xpath("//div[@data-testid='trend']")),
                10000
            );

            for (let i = 0; i < Math.min(4, trendElements.length); i++) {
                const topicElement = await trendElements[i].findElement(
                    By.xpath(".//div[contains(@class, 'r-b88u0q')]")
                );
                const topicText = await topicElement.getText();
                if (topicText) trendingTopics.push(topicText.trim());
            }

            if (trendingTopics.length === 0) {
                sendLog("No trending topics found.");
            } else {
                sendLog(`Trending Topics: ${JSON.stringify(trendingTopics)}`);
            }

            // Store data in MongoDB
            const scriptResult = new ScriptResult({
                trends: trendingTopics,
                ipAddress: proxyAddress,
                userIpAddress,
            });

            const savedResult = await scriptResult.save();
            sendLog("Results saved to MongoDB.");

            lastResults = {
                _id: savedResult._id,
                timestamp: savedResult.createdAt,
                trends: savedResult.trends,
                ipAddress: savedResult.ipAddress,
                userIpAddress: savedResult.userIpAddress,
            };
            if (process.env.NODE_ENV === "development") {
                console.log("Last Results Updated:", lastResults);
            }
        } catch (error) {
            sendLog(`Error fetching trending topics: ${error.message}`);
        }
    } catch (error) {
        sendLog(`Error during Selenium script execution: ${error.message}`);
        throw error;
    } finally {
        await driver.quit();
    }
}

export function getLastResults() {
    return lastResults;
}
