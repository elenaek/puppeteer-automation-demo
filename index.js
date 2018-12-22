let puppeteer = require("puppeteer");


const browserConfig = {
    headless: true,
    devtools: false,
    ignoreHTTPSErrors: true,
    defaultViewport: {
        width: 1200,
        height: 1080
    }
};

// Search something on google

const searchGoogle = async () => {
    let url = "https://www.google.com";
    let page = await getPage(url, browserConfig);
    await page.type('#gsr', "Hello, my name is Bob.");
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    
}

// Create a PDF from a webpage

const webpageToPdf = async () => {
    let url = "https://www.neogaf.com/";
    let {browser, page} = await getPage(url, browserConfig);
    await page.pdf({
        path: "./pdfs/example.pdf",
        format: "A4"
    });
    browser.close();
}


// Function for generating a browser tab/page
const getPage = async (url = "https://www.google.com", config) => {
    const browser = await puppeteer.launch(config);
    const page = await browser.newPage()
    await page.goto(url)
    return {browser, page}
}


webpageToPdf();