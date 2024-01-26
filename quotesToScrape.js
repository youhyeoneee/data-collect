import axios from "axios";
import * as cheerio from "cheerio";

const baseUrl = "https://quotes.toscrape.com";
const results = [];
let page = "/page/1";
let flag = true;

async function getPageData(url) {
    console.log(url, "=====================");
    axios.get(url).then((response) => {
        const $ = cheerio.load(response.data);
        const quotes = $("div.quote")
            .map((i, el) => {
                const target = $(el);
                const tags = [];
                target.find(".tag").map((i, el) => {
                    tags.push($(el).text());
                });

                return {
                    quote: target.children(".text").text(),
                    author: target.find(".author").text(),
                    authorUrl: baseUrl + target.find("a").prop("href"),
                    tag: tags,
                };
            })
            .get();

        const next = $(".next a").prop("href");
        if (next) {
            getPageData(baseUrl + next); // 재귀 호출
        } else {
            flag = true;
        }
        console.log(quotes);
    });
}

const url = baseUrl + page;
getPageData(url);
