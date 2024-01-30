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

async function fetchFile(url) {
    try {
        const response = await axios.get(url, {
            responseType: "stream",
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

async function getNewsDetail(result) {
    const response = await fetchPage(result.link);

    if (response) {
        let data = await decodeHTML(response);
        const $ = await cheerio.load(data);
        result.newsDetail = $.html();
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
                    let imgUrl, imgPath;
                    if (imgTag) {
                        imgUrl = imgTag.prop("data-lazysrc");
                        imgPath = await getNewsImage(imgUrl, i);
                    }

                    // 링크
                    const link = target.find("a.dsc_thumb").prop("href");
                    console.log(link);

                    let result = {
                        id: i,
                        title: title,
                        press: press,
                        text: text,
                        imgUrl: imgUrl,
                        imgPath: imgPath,
                        link: link,
                    };

                    await getNewsDetail(result);

                    return result;
                })
                .get()
        );

        fs.writeFileSync("../data/news.json", JSON.stringify(newsList));
    }
}

async function getNewsImage(url, id) {
    const response = await fetchFile(url);
    let name = `../data/news/${id}.jpeg`;
    let file = fs.createWriteStream(name);

    if (response) {
        response.data.pipe(file);
    }

    return name;
}

const keyword = "이차전지";
const url = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${keyword}`;
getNewsInfo(url);
