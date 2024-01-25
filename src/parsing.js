import * as cheerio from "cheerio";

const data = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body>
        <div id="root">
            <div class="content">
                <ul class="profile">
                    <li class="other">윤수</li>
                    <li class="me">
                        <a href="/profile/me">민수</a>
                    </li>
                    <li class="other">수지</li>
                </ul>
            </div>
        </div>
    </body>
</html>
`;

const $ = cheerio.load(data);
// console.log($.html());
// console.log($("a")); // 태그
// console.log($("#root")); // ID
// console.log($(".other")); // 클래스
// console.log($("#root li.me")); // id가 root인 elem 안 li 태그 중 class = me 인 css selector

// console.log($("ul.profile").children()); // 자식 노드 가져오기

// console.log($("a").prop("href")); // 속성값 추출하기
// console.log($("a").text()); // text 추출하기

const items = $("li")
    .map((i, el) => {
        return $(el).text().trim();
    })
    .get();

console.log(items);
