# Selenium Web Scraper with ProxyMesh and MongoDB Integration

## **Overview**

This project uses Selenium to scrape trending topics from Twitter (X.com), stores the results in MongoDB, and routes all traffic through ProxyMesh for anonymity. It includes real-time log updates and displays the fetched data on a results page.

---

## **Installation Guide**

### **1. Clone the Repository**

```bash
git clone https://github.com/pranavnathe/web-scraper.git
cd web-scraper
```

### **2. Install Dependencies**

Ensure you have Node.js and npm installed. Run the following command to install all required dependencies:

```bash
npm install
```

### **3. Configure Environment Variables**

Create a .env file in the root directory and add the following:

```bash
PORT=8000
NODE_ENV=development

MONGODB_URL=mongodb://localhost:27017

USERNAME=your_twitter_username
EMAIL=your_twitter_email
PASSWORD=your_twitter_password

PROXYMESH_USERNAME=your_proxymesh_username
PROXYMESH_PASSWORD=your_proxymesh_password
PROXYMESH_URL=http://us-dc.proxymesh.com:31280
```

### **4. Start MongoDB**

Ensure MongoDB is installed and running.

### **5. Install ChromeDriver**

The project uses Selenium WebDriver for Chrome. Install ChromeDriver compatible with your Chrome browser version.

### **6. Run the Application**

Start the Node.js application:

```bash
npm run dev
```

By default, the application runs on http://localhost:8000.

---

## **Usage**

### **1. Run the Script**

Visit the homepage at `http://localhost:8000`. Click the "Run Script" button to:

-   Start the Selenium script.
-   View real-time logs as the script runs.

### **2. View Results**

Once the script completes:

-   It redirects to the results page (`http://localhost:8000/result.html`).
-   Displays the trending topics, IP addresses, and raw JSON data from MongoDB.

---

## **Endpoints**

### **Homepage**

-   **URL**: `/`
-   **Description**: Displays the home page with the "Run Script" button.

### **Stream Logs**

-   **URL**: `/events`
-   **Description**: Streams real-time logs to the frontend using Server-Sent Events (SSE).

### **Run Script**

-   **URL**: `/run-script`
-   **Description**: Starts the Selenium script without real-time logs (fallback route).

### **Fetch Results**

-   **URL**: `/api/results`
-   **Method**: `GET`
-   **Description**: Fetches the last results from memory.
