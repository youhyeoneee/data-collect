import axios from "axios";
import * as cheerio from "cheerio";

const url = "https://quotes.toscrape.com";
const results = [];

axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    const quotes = $("div.quote")
        .map((i, el) => {
            return {
                quote: $(el).children(".text").text(),
                author: $(el).find(".author").text(),
                authorUrl: url + $(el).find("a").prop("href"),
            };
        })
        .get();
    console.log(quotes);
});
