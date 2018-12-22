#!/usr/bin/env node

const puppeteer = require("puppeteer");
const cli = require("commander");
const { prompt } = require("inquirer");

//puppeteer/DeviceDescriptors is a module that has configs that align with multiple different phones
const mobileDevices = require("puppeteer/DeviceDescriptors");



const browserConfig = {
    headless: false,
    devtools: false,
    ignoreHTTPSErrors: true,
    defaultViewport: {
        width: 1200,
        height: 1080
    }
};

// Search something on google
const searchGoogle = async (searchString = "Hello, my name is Bob.") => {
    let url = "https://www.google.com";
    let searchBarSelector = "#gsr";
    let {page} = await getPage(url, browserConfig);
    await page.waitForSelector(searchBarSelector)
    .then(async () => {
        await page.type(searchBarSelector, searchString);
        await page.keyboard.press("Enter");
    });
}

// Create a PDF from a webpage
// Requires headless mode
const webpageToPdf = async (url = "https://www.neogaf.com/") => {
    headlessConfig = browserConfig.headless = true;
    let {browser, page} = await getPage(url, headlessConfig);
    await page.pdf({
        path: "./pdfs/example.pdf",
        format: "A4"
    });
    browser.close();
}

// Extract Title and URL of a webpage
const extractWebpageInfo = async (url = "https://www.reddit.com") => {
    let {browser, page} = await getPage(url, browserConfig);
    let title = await page.title();
    let extractedUrl = await page.url();
    console.log(`The title of "${url}" is "${title}" and its URL is "${extractedUrl}"`);
    browser.close();
}

// Emulating mobile 
// Defaults to iPhone X as the mobile device to emulate
const emulateMobileDevice = async (url = "https://youtube.com", mobileDevice = mobileDevices["iPhone X"]) => {
    return await getPage(url, browserConfig, mobileDevice);
}


// Function for generating a browser tab/page
const getPage = async (url = "https://www.google.com", browserConfig, mobileDevice) => {
    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();
    if(mobileDevice){
        try{
            await page.emulate(mobileDevice);
        }
        catch(err){
            await console.log(`Error: ${err} \r\nInvalid mobile device. Reverting to regular browser configuration.`);
        }
    }
    await page.goto(url);
    return {browser, page}
}

//searchGoogle();
//webpageToPdf();
//extractWebpageInfo();
//emulateMobileDevice();
searchQuery = [
    {
        type: "input",
        name: "queryString",
        message: "Enter a string to search on Google."
    }
];

cli
    .version("0.0.1")
    .command("search")
    .description("Searches google with supplied querystring")
    .option("-q, --query", "Query string to search Google with" )
    .action(() => {
        prompt(searchQuery).then(answers => searchGoogle(answers.queryString));
    });
cli.parse(process.argv);