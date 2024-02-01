import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import iconv from "iconv-lite";
import path from "path";
import { dataPath } from "../config.js";

async function fetchPage(url) {
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
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

async function decodeHTML(response) {
    let contentType = response.headers["content-type"];
    let charset = contentType.includes("charset=")
        ? contentType.split("charset=")[1]
        : "UTF-8";

    let responseData = await response.data;

    return iconv.decode(responseData, charset);
}

async function saveData(dailyPrices) {
    fs.writeFileSync(filePath, JSON.stringify(dailyPrices));
}

// 랜덤한 밀리초(ms) 값 생성 함수
function randomDelay() {
    const minDelay = 1000;
    const maxDelay = 3000;
    return Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
}

// 비동기적으로 지연을 주는 함수
function delay(ms) {
    console.log(ms + "ms delay..");
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 네이버페이 증권 시세 페이지 -> 일일 시세
async function fetchMain(url) {
    const response = await fetchPage(url);
    if (response) {
        let data = await decodeHTML(response);

        const $ = await cheerio.load(data);
        const title = "일별 시세";
        const name = "day";
        const dailySrc = $(`iframe[title='${title}'][name=${name}]`).prop(
            "src"
        );

        if (!endPage) {
            endPage = await fetchDailyPrice(baseUrl + dailySrc);
        }

        console.log(`${startPage} 부터 ${endPage} 까지 수집합니다..`);

        let results = [];
        for (let page = startPage; page <= endPage; page++) {
            const url = baseUrl + dailySrc + `&page=${page}`;
            await delay(await randomDelay());
            results = results.concat(await fetchDailyPrice(url));
        }
        await saveData(results);
    }
}

async function fetchDailyPrice(url) {
    const response = await fetchPage(url);
    if (response) {
        console.log(url);
        let data = await decodeHTML(response);
        const $ = await cheerio.load(data);
        let dailyPrices = [];

        // 마지막 페이지 설정
        if (!endPage) {
            const summary = "페이지 네비게이션 리스트";
            const lastUrl = $(`table[summary='${summary}'] td.pgRR a`).prop(
                "href"
            );

            // URLSearchParams를 사용하여 페이지 번호 추출
            const params = new URLSearchParams(lastUrl);
            return params.get("page");
        }

        const tableRows = $("table.type2 tr").map((i, el) => {
            const row = $(el).find("td");

            if (row.length == 7) {
                const date = $(row[0]).text().trim();
                const closingPrice = $(row[1]).text().trim();
                const priceDifference = $(row[2]).text().trim();
                const openingPrice = $(row[3]).text().trim();
                const highPrice = $(row[4]).text().trim();
                const lowPrice = $(row[5]).text().trim();
                const tradingVolume = $(row[6]).text().trim();

                dailyPrices.push({
                    date: date,
                    closingPrice: closingPrice,
                    priceDifference: priceDifference,
                    openingPrice: openingPrice,
                    highPrice: highPrice,
                    lowPrice: lowPrice,
                    tradingVolume: tradingVolume,
                });
            }
        });

        return dailyPrices;
    }
}

const code = "005930";
const baseUrl = "https://finance.naver.com";
const mainSrc = `/item/sise.naver?code=${code}`;
const filePath = path.join(dataPath, "finance.json");

const url = baseUrl + mainSrc;
const startPage = 1;
let endPage = 10; // 정하거나 없으면 기본적으로 맨 뒤 페이지까지 수집

fetchMain(url);
