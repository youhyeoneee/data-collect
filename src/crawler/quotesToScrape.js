import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const baseUrl = "https://quotes.toscrape.com";
let page = "/page/1";

async function fetchPage(url) {
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error(`Error fetching page: ${url}`, error.message);
        return null;
    }
}

async function getAuthorDetail(result) {
    const response = await fetchPage(result.authorUrl);
    if (response) {
        const $ = cheerio.load(response.data);
        const bornDate = $(".author-born-date").text();
        const bornLocation = $(".author-born-location").text();
        const desc = $(".author-description").text().trim();
        result.authorDetail = {
            bornDate: bornDate,
            bornLocation: bornLocation,
            description: desc,
        };
    }
}

async function getPageData(url) {
    const response = await fetchPage(url);
    if (response) {
        console.log(url, "=====================");
        const $ = cheerio.load(response.data);
        // 여기 await, Promise.all 추가
        const quotes = await Promise.all(
            $("div.quote")
                .map(async (i, el) => {
                    const target = $(el);

                    const tags = [];
                    target.find(".tag").map((i, el) => {
                        tags.push($(el).text());
                    });

                    const quote = target.children(".text").text();
                    const author = target.find(".author").text();
                    const authorUrl = baseUrl + target.find("a").prop("href");

                    let result = {
                        quote: quote,
                        author: author,
                        authorUrl: authorUrl,
                        tags: tags,
                    };

                    await getAuthorDetail(result); // 여기 await 추가

                    return result;
                })
                .get()
        );
        const next = $(".next a").prop("href");
        if (next) {
            getPageData(baseUrl + next); // 재귀 호출
        }

        fs.writeFileSync("../data/quote.json", JSON.stringify(quotes));
    }
}

const url = baseUrl + page;
getPageData(url);
