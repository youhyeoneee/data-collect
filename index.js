import axios from "axios";

const url = "https://www.naver.com/";

// axios.get(url).then((response) => {
//     console.log(response.data);
// });

async function fetchPage() {
    let array = [];

    try {
        const response = await axios.get(url);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

fetchPage();
