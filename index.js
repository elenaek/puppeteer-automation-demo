#!/usr/bin/env node

const puppeteer = require("puppeteer");
const path = require("path");
const cli = require("commander");
const { prompt } = require("inquirer");
const { spawn } = require("child_process");
const url = require("url");

//puppeteer/DeviceDescriptors is a module that has configs that align with multiple different phones
const mobileDevices = require("puppeteer/DeviceDescriptors");


//Default config for chromium
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
    let targetUrl = "https://www.google.com";
    let searchBarSelector = "#gsr";
    let {page} = await getPage(targetUrl, browserConfig);
    await page.waitForSelector(searchBarSelector)
    .then(async () => {
        await page.type(searchBarSelector, searchString);
        await page.keyboard.press("Enter");
    });
}

// Create a PDF from a webpage
// Requires headless mode
const webpageToPdf = async (targetUrl = "https://reddit.com/", pdfPath = "./webpage_capture", openDir = false, headless = true) => {
    headlessConfig = browserConfig.headless = !headless;
    let parsedUrl = await parseUrl(targetUrl);
    let {browser, page} = await getPage(parsedUrl, headlessConfig);
    let isAbsolutePath = path.isAbsolute(pdfPath);
    path.extname(pdfPath) === ".pdf"? pdfPath : pdfPath += ".pdf";
    try{
        await page.pdf({
            path: pdfPath,
            format: "A4"
        });
        console.log(`PDF capture succeeded! PDF stored at: ${pdfPath}`);
        if(process.platform === "win32" && openDir === true){
            isAbsolutePath === true ? spawn("explorer.exe", [pdfPath]) : spawn("explorer.exe", [`${process.cwd()}\\${pdfPath}`]);
        }  
    }

    catch(err){
        console.log(`There was an error capturing PDF. Error: ${err}`);
    }

    browser.close();
}

// Extract Title and URL of a webpage
const extractWebpageInfo = async (targetUrl = "https://www.reddit.com", headless = true) => {
    let headlessConfig = browserConfig.headless = !headless;
    let parsedUrl = await parseUrl(targetUrl);
    let {browser, page} = await getPage(parsedUrl, browserConfig);
    let title = await page.title();
    let extractedUrl = await page.url();
    console.log(`The title of "${targetUrl}" is "${title}" and its URL is "${extractedUrl}"`);
    browser.close();
}

// Emulating mobile 
// Defaults to iPhone X as the mobile device to emulate
const emulateMobileDevice = async (targetUrl = "https://youtube.com", mobileDevice = mobileDevices["iPhone X"]) => {
    let parsedUrl = await parseUrl(targetUrl);
    return await getPage(parsedUrl, browserConfig, mobileDevices[mobileDevice]);
}

const parseUrl = async (parsedUrl) => {
    parsedUrl = url.parse(parsedUrl);
    if(parsedUrl.protocol != "http" && parsedUrl.protocol != "https"){
        parsedUrl.protocol = "https";
        parsedUrl = url.format(parsedUrl);
    }
    return parsedUrl;
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
    return {browser, page};
}


/*-----------------------INQUIRER INQUERIES-----------------------*/

searchQuery = [
    {
        type: "input",
        name: "queryString",
        message: "Enter a string to search on Google."
    }
];

pdfQuery = [
    {
        type: "input",
        name: "url",
        message: "Please enter the URL of the target web page. (ex. https://youtube.com)",
        default: "youtube.com",
        filter: (input) => {
            return input.toString();
        }
    },
    {
        type: "input",
        name: "filename",
        message: "Please enter a name or path for the pdf. (ex. mypdf or C:\\mypdf)",
        default: "mypdf.pdf",
        filter: (input => {
            return input.toString();
        })
    },
    {
        type: "confirm",
        name: "openDir",
        message: "Open directory of PDF after capture is complete?",
        default: false
    }
];


extractInfoQuery = [
    {
        type: "input",
        name: "url",
        message: "Please enter the URL of a page to extract info from",
        default: "youtube.com"
    },
    {
        type: "confirm",
        name: "headless",
        message: "Show the browser?",
        default: true
    }
];

phoneEmulationQuery = [
    {
        type: "input",
        name: "url",
        message: "Please enter the URL of a page to to view",
        default: "youtube.com"
    },
    {
        type: 'rawlist',
        name: 'phoneToEmulate',
        message: "Choose a phone to emulate",
        choices: mobileDevices.map(phone => phone.name),
        pageSize: 10
    }
];

/*-----------------------INQUIRER INQUERIES END----------------------*/



/*-----------------------COMMANDER COMMAND CONFIGS-----------------------*/

cli
    .version("0.0.1")
    .description("Interactive shell for the puppeteer demo");

cli
    .command("search")
    .alias("s")
    .description("Searches google with supplied querystring")
    .action(() => {
        prompt(searchQuery).then(answers => searchGoogle(answers.queryString));
    });

cli
    .command("capture")
    .alias("c")
    .description("Saves a web page specified by a URL as a pdf given a name")
    .action(() => {
        prompt(pdfQuery).then(answers => webpageToPdf(answers.url, answers.filename, answers.openDir));
    });
cli
    .command("extract")
    .alias("ex")
    .description("Gets URL and title of a web page given a URL")
    .action(() => {
        prompt(extractInfoQuery).then(answers => extractWebpageInfo(answers.url, answers.headless));
    });
cli
    .command("emulate")
    .alias("emu")
    .description("Open a webpage emulating a chosen phone")
    .action(() => {
        prompt(phoneEmulationQuery).then(answers => emulateMobileDevice(answers.url, answers.phoneToEmulate));
    })

cli.parse(process.argv);

/*-----------------------COMMANDER COMMAND CONFIGS END-----------------------*/