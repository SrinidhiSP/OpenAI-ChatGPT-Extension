// capture_token.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

function startChromeWithDebug(port) {
    const platform = os.platform();
    return new Promise((resolve) => {
        let command;
        
        if (platform === 'darwin') {
            command = `open -na "Google Chrome" --args --remote-debugging-port=${port} --user-data-dir="/tmp/playground-chrome"`;
        } else {
            command = `start chrome.exe --remote-debugging-port=${port} --user-data-dir="C:\\temp\\playground-chrome"`;
        }
        
        console.log(`Starting Chrome`);
        exec(command);
        setTimeout(resolve, 3000);
    });
}

(async () => {
    
    const port = 9225;
    await startChromeWithDebug(port);
    
    console.log(' Next Steps:');
    console.log('1. Go to: https://platform.openai.com/playground');
    console.log('2. Log in');
    console.log('3. Click "Chat" mode');
    console.log('4. Type a message and click "Submit"');
    console.log('5. Token will be captured\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
        const browser = await puppeteer.connect({
            browserURL: `http://localhost:${port}`,
            defaultViewport: null
        });
        
        console.log('Successfully Connected!');
        
        const pages = await browser.pages();
        let playgroundPage = pages.find(p => p.url().includes('playground'));
        
        if (!playgroundPage) {
            playgroundPage = await browser.newPage();
            await playgroundPage.goto('https://platform.openai.com/playground');
        }
        
        console.log(`URL: ${playgroundPage.url()}`);
        
        let requestCount = 0;
        
        playgroundPage.on('response', async (response) => {
            const url = response.url();
            
            // Listen for ANY OpenAI API calls (not just chat/completions)
            if (url.includes('api.openai.com')) {
                requestCount++;
                
                try {
                    const request = response.request();
                    const headers = request.headers();
                    const authHeader = headers['authorization'] || headers['Authorization'];
                    
                    if (authHeader) {
                        console.log(`\n Request #${requestCount}:`);
                        console.log(`   URL: ${url}`);
                        console.log(`   Method: ${request.method()}`);
                        console.log(`   Auth: ${authHeader.substring(0, 70)}...`);
                        
                        // Save captured auth headers for analysis
                        if (!fs.existsSync('all_auth_headers.json')) {
                            fs.writeFileSync('all_auth_headers.json', '[]');
                        }
                        
                        const allHeaders = JSON.parse(fs.readFileSync('all_auth_headers.json', 'utf8'));
                        allHeaders.push({
                            url: url,
                            method: request.method(),
                            authHeader: authHeader.substring(0, 100) + '...',
                            fullLength: authHeader.length,
                            timestamp: new Date().toISOString()
                        });
                        
                        fs.writeFileSync('all_auth_headers.json', JSON.stringify(allHeaders, null, 2));
                        
                        // Test if this token works with standard API
                        if (authHeader.startsWith('Bearer ')) {
                            const isValid = await testWithStandardAPI(authHeader);
                            
                            if (isValid) {
                                console.log(' Works with standard OpenAI API!');
                                fs.writeFileSync('valid_api_token.txt', authHeader);
                                console.log(' Saved to valid_api_token.txt');
                            } else {
                                console.log(' Does NOT work with standard API');
                                
                                // Check if it's a playground specific token
                                if (url.includes('playground')) {
                                    fs.writeFileSync('playground_token.txt', authHeader);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.log(' Error processing request:', error.message);

                }
            }
        });
        
        
        // Set up periodic logging
        setInterval(() => {
            console.log(`Checked ${requestCount} requests so far...`);
        }, 30000);
        
        // Wait 5 minutes
        await new Promise(resolve => setTimeout(resolve, 300000));
        
        console.log(`\nSummary: Checked ${requestCount} API requests`);
        console.log('Check all_auth_headers.json for captured tokens');
        
    } catch (error) {
        console.log('Error:', error.message);
    }
})();

async function testWithStandardAPI(token) {
    return new Promise((resolve) => {
        const https = require('https');
        
        const options = {
            hostname: 'api.openai.com',
            path: '/v1/models',
            method: 'GET',
            headers: {
                'Authorization': token,
                'User-Agent': 'Test/1.0'
            },
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            resolve(res.statusCode === 200);
        });
        
        req.on('timeout', () => resolve(false));
        req.on('error', () => resolve(false));
        req.end();
    });
}
