import axios from "axios";
import * as cheerio from "cheerio";

const baseUrl = "https://quotes.toscrape.com";
let results = [];
let page = "/page/1";
let flag = true;

async function getAuthorDetail(result) {
    // 여기 await 추가 -> pending
    const response = await axios.get(result.authorUrl);
    if (response.status) {
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
    return result;
}

async function getPageData(url) {
    console.log(url, "=====================");
    const response = await axios.get(url);

    if (response.status == 200) {
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
                    const authorDetail = await getAuthorDetail(result); // 여기 await 추가

                    return result;
                })
                .get()
        );
        const next = $(".next a").prop("href");
        if (next) {
            getPageData(baseUrl + next); // 재귀 호출
        } else {
            flag = true;
        }
        console.log(quotes);
    }
}

const url = baseUrl + page;
getPageData(url);
