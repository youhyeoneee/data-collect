import axios from "axios";
import * as cheerio from "cheerio";

const keyword = "이차전지";
const url = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${keyword}`;

axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    console.log($.html());
    // const quotes = $("div.quote")
    //     .map((i, el) => {
    //         return {
    //             quote: $(el).children(".text").text(),
    //             author: $(el).find(".author").text(),
    //             authorUrl: url + $(el).find("a").prop("href"),
    //         };
    //     })
    //     .get();
    // console.log(quotes);
});
