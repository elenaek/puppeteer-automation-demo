const puppeteer = require("puppeteer");

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
    let page = await getPage(url, browserConfig);
    await page.type('#gsr', searchString);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    
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
    let {browser, page} = await getPage(url, browserConfig, mobileDevice);
    return 
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
emulateMobileDevice();
