import axios from "axios";
import * as cheerio from "cheerio";

const baseUrl = "https://quotes.toscrape.com/";
const results = [];
const maxPage = 2;

for (let page = 1; page <= maxPage; page++) {
    const url = baseUrl + `page/${page}`;
    axios.get(url).then((response) => {
        const $ = cheerio.load(response.data);
        // console.log($.html());
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
                    authorUrl: url + target.find("a").prop("href"),
                    tag: tags,
                };
            })
            .get();
        console.log(`${page} 페이지 ----------`);
        console.log(quotes);
    });
}
