import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import iconv from "iconv-lite";

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
    fs.writeFileSync("../data/finance.json", JSON.stringify(dailyPrices));
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

        let results = [];
        const startPage = 1;
        const endPage = 10;
        for (let page = startPage; page <= endPage; page++) {
            const url = baseUrl + dailySrc + `&page=${page}`;
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
const url = baseUrl + mainSrc;
fetchMain(url);
