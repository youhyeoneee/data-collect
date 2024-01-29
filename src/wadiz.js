import axios from "axios";
import fs from "fs";

async function fetchPage(url) {
    try {
        const response = await axios.post(url, data, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            },
        });
        return response;
    } catch (error) {
        console.error(`Error fetching page: ${url}`, error.message);
        return null;
    }
}

async function saveData(results) {
    fs.writeFileSync(filePath, JSON.stringify(results));
}

async function fetchMain(url) {
    const response = await fetchPage(url);
    if (response) {
        await saveData(response.data.data["list"]);
    }
}

const baseUrl = "https://service.wadiz.kr/api/search/funding";
const url = baseUrl;
const data = { startNum: 0, order: "recommend", limit: 48 };

const filePath = "../data/wadiz.json";
fetchMain(url);
