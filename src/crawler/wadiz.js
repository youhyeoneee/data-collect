import axios from "axios";
import fs from "fs";
import { dataPath } from "../config.js";

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

async function fetchFile(url) {
    try {
        const response = await axios.get(url, {
            responseType: "stream",
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
        let result = response.data.data["list"];

        await Promise.all(
            result.map(async (e, i) => {
                e.photoPath = await getImage(e.photoUrl, e.campaignId);
                console.log(e.photoPath);
            })
        );

        console.log(result[0]);
        await saveData(result);
    }
}

async function getImage(url, id) {
    const response = await fetchFile(url);
    let name = `../data/wadiz/${id}.jpeg`;
    let file = fs.createWriteStream(name);

    if (response) {
        response.data.pipe(file);
    }

    return name;
}

const baseUrl = "https://service.wadiz.kr/api/search/funding";
const url = baseUrl;
const data = { startNum: 0, order: "recommend", limit: 48 };

const filePath = path.join(dataPath, "wadiz.json");
fetchMain(url);
