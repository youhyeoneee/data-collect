# data-collect

node.js를 이용한 데이터 수집

## 목차

-   [실행 방법](#실행-방법)
-   [1. Quotes to Scrape](#1.-Quotes-to-Scrape)
-   [2. 네이버 뉴스 리스트](#2.-네이버-뉴스-리스트)
-   [3. 네이버 주가 데이터 - 일별 시세](#3.-네이버-주가-데이터----일별-시세)
-   [4. 네이버 주식 공시 리스트](#4.-네이버-주식-공시-리스트)
-   [5. 와디즈 크라우드 펀딩](#5.-와디즈-크라우드-펀딩)

## 실행 방법

```shell
cd src # src 폴더로 이동
node @@@.js # 원하는 데이터 수집 파일 실행
```

## 1. [Quotes to Scrape](https://quotes.toscrape.com/)

### 소스 코드

src/crawler/quotesToScrape.js

### 기능

맨 뒤 페이지까지 수집

### 데이터

-   data/quote.json
    -   인용문(quote)
    -   작가(author)
    -   작가 페이지(authorUrl)
    -   태그들(tags)
    -   작가 상세 정보(authorDetail)
        -   탄생일(bornDate)
        -   탄생 지역(bornLocation)
        -   설명(description)

## 2. 네이버 뉴스 리스트

### 소스 코드

src/crawler/news.js

### 기능

`키워드(keyword)` 로 검색된 1페이지부터 `endPage` 페이지까지 수집

```js
const keyword = "이차전지";
const endPage = 5;
```

### 데이터

-   data/news.json
    -   아이디(id)
    -   제목(title)
    -   신문사(press)
    -   요약 설명(text)
    -   이미지 다운 경로(imgUrl)
    -   이미지 저장 경로(imgPath)
    -   링크(link)
    -   상세 페이지 html(newsDetail)
-   data/news/${id}.jpeg
    -   뉴스 id = 이미지 파일명

## 3. 네이버 주가 데이터 - 일별 시세

### 소스 코드

src/crawler/finance.js

### 기능

`코드(code)`에 해당하는 일별 시세 데이터 1페이지부터 `endPage(default = 맨 뒤)`페이지까지 수집

```js
const code = "005930"; // 삼성전자;
let endPage = 10; // 정하거나 없으면 기본적으로 맨 뒤 페이지까지 수집
```

### 데이터

-   data/finance.json
    -   날짜(date)
    -   종가(closingPrice)
    -   전일비(priceDifference)
    -   시가(openingPrice)
    -   고가(highPrice)
    -   저가(lowPrice)
    -   거래량(tradingVolume)

## 4. 네이버 주식 공시 리스트

### 소스 코드

src/crawler/financeNews.js

### 기능

`코드(code)`에 해당하는 공시 데이터 1페이지부터 `endPage(default = 맨 뒤)`페이지까지 수집

```js
const code = "005930"; // 삼성전자
let endPage = 10; // 정하거나 없으면 기본적으로 맨 뒤 페이지까지 수집
```

### 데이터

-   data/finance-news.json
    -   제목(title)
    -   링크(link)
    -   정보제공(provider)
    -   날짜(date)

## 5. 와디즈 크라우드 펀딩

### 소스 코드

src/crawler/wadiz.js

### 기능

api 이용하여 추천순으로 정렬된 펀딩 리스트 수집

```js
const data = { startNum: 0, order: "recommend", limit: 48 };
```

### 데이터

-   data/wadiz.json
-   data/wadiz/${campaignId}.jpeg
