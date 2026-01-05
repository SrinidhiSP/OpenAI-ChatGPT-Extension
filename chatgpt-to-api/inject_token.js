// inject_token.js 
const fs = require('fs');
const path = require('path');

// Get current directory
const currentDir = __dirname;

// Look for token file
const tokenFile = path.join(currentDir, 'valid_api_token.txt');

if (!fs.existsSync(tokenFile)) {
  console.log('valid_api_token.txt not found in:', currentDir);
  console.log('Available files:');
  fs.readdirSync(currentDir).forEach(f => console.log('  -', f));
  process.exit(1);
}

// Read token
const token = fs.readFileSync(tokenFile, 'utf8').trim();
console.log('Token found:', token.substring(0, 50) + '...\n');

const extensionDir = path.join(currentDir, '../chatgpt-extension');
const injectionFile = path.join(extensionDir, 'token_injection.js');

const injectionCode = `// AUTO-INJECTED TOKEN - ${new Date().toISOString()}
console.log('Loading injected ChatGPT token');

// Store token globally
window._CHATGPT_INJECTED_TOKEN = "${token}";

// Wait for ChatGPTExtension class to be available
function waitForExtensionClass() {
    if (typeof ChatGPTExtension !== 'undefined') {
        const originalGetToken = ChatGPTExtension.prototype.getToken;
        
        ChatGPTExtension.prototype.getToken = async function() {
            console.log('Using injected token');
            return window._CHATGPT_INJECTED_TOKEN;
        };
        
        console.log('Token injection complete');
    } else {
        console.log('Waiting for ChatGPTExtension to load');
        setTimeout(waitForExtensionClass, 100);
    }
}

// Start waiting when DOM is ready
document.addEventListener('DOMContentLoaded', waitForExtensionClass);

// Also start immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    // DOM still loading, will be handled by event listener above
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    // DOM already loaded, start waiting immediately
    console.log('DOM already loaded, starting wait...');
    waitForExtensionClass();
}
`;

// Save to extension folder
fs.writeFileSync(injectionFile, injectionCode);

console.log('Created :', injectionFile);
console.log('\n NEXT STEPS:');
console.log('1. Load extension in Chrome');
console.log('2. Check console for injection messages\n');
