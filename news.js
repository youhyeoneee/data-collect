import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

async function fetchPage(url) {
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error(`Error fetching page: ${url}`, error.message);
        return null;
    }
}

async function getNewsInfo(url) {
    const response = await fetchPage(url);
    if (response) {
        const $ = cheerio.load(response.data);
        const newsList = await Promise.all(
            $(".list_news li.bx")
                .map(async (i, el) => {
                    console.log("============");
                    const target = $(el);

                    // 제목
                    const title = target.find("a.news_tit").prop("title");

                    console.log(title);
                    // 신문사
                    const press = target
                        .find(".news_info")
                        .find(".info.press")
                        .clone() // .clone()를 추가하여 원본 요소를 수정하지 않고 복제본을 사용합니다.
                        .find("i")
                        .remove() // i 태그를 제거합니다.
                        .end() // .clone() 이전 상태로 돌아갑니다.
                        .text()
                        .trim();

                    console.log(press);

                    // 요약 설명
                    const text = target
                        .find(".api_txt_lines.dsc_txt_wrap")
                        .text();
                    console.log(text);

                    // 이미지
                    const imgTag = target.find("a.dsc_thumb").find("img.thumb");
                    let img;
                    if (imgTag) {
                        img = imgTag.prop("data-lazysrc");
                    }

                    // 링크
                    const link = target.find("a.dsc_thumb").prop("href");
                    console.log(link);

                    let result = {
                        title: title,
                        press: press,
                        text: text,
                        img: img,
                        link: link,
                    };

                    return result;
                })
                .get()
        );

        fs.writeFileSync("./data/news.json", JSON.stringify(newsList));
    }
}

const keyword = "이차전지";
const url = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${keyword}`;
getNewsInfo(url);
