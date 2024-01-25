import axios from "axios";
import * as cheerio from "cheerio";

const url = "https://quotes.toscrape.com";
const results = [];

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
                authorUrl: url + target.find("a").prop("href"),
                tag: tags,
            };
        })
        .get();
    console.log(quotes);
});
