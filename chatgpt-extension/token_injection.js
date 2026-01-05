// AUTO-INJECTED TOKEN - 2026-01-05T00:50:42.713Z
console.log('Loading injected ChatGPT token');

// Store token globally
window._CHATGPT_INJECTED_TOKEN = "Bearer sess-egHDRIbQbZA8fyUq14wF5nPfRWA153SJQXavoLqx";

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
