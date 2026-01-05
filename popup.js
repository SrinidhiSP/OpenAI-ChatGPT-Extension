class ChatGPTExtension {
  constructor() {
    this.token = null;
    this.conversation = [];
  }

  async init() {
  console.log('Initializing ChatGPTExtension...');
  
  // Check for injected token
  if (window._CHATGPT_INJECTED_TOKEN) {
    console.log('Using injected token');
    this.token = window._CHATGPT_INJECTED_TOKEN;
    this.setupConnectedUI();
    return;
  }
  
  // No token found
  console.log('No token found');
  this.showSetupMessage();
}

  setupConnectedUI() {
    // Update status
    const statusEl = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    
    statusEl.classList.remove('status-disconnected');
    statusEl.classList.add('status-connected');
    statusEl.classList.add('connected');
    statusText.textContent = 'Connected to ChatGPT API';
    
    // Show chat interface
    document.getElementById('messages').innerHTML = `
      <div class="message assistant-message">
        Hello! I'm ChatGPT. How can I help you today?
      </div>
    `;
    
    // Enable input
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('send');
    
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.placeholder = "Type your message...";
    
    // Setup send functionality
    sendBtn.addEventListener('click', () => this.sendMessage());
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  showSetupMessage() {
    const statusText = document.getElementById('status-text');
    statusText.textContent = 'Setup required';
    
    document.getElementById('messages').innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h3>Setup Required</h3>
        <p>Token not found.</p>
        <p>Run this in terminal:</p>
        <pre style="background: #222; padding: 10px; margin: 10px; border-radius: 5px;">
cd /path/to/your/code
node inject_token.js</pre>
        <p>Then reload this extension.</p>
      </div>
    `;
  }

  async sendMessage() {
    const inputEl = document.getElementById('input');
    const message = inputEl.value.trim();
    
    if (!message || !this.token) return;
    
    const messagesEl = document.getElementById('messages');
    messagesEl.innerHTML += `
      <div class="message user-message">
        ${this.escapeHtml(message)}
      </div>
    `;
    
    inputEl.value = '';
    inputEl.disabled = true;
    document.getElementById('send').disabled = true;
    
    document.getElementById('typing').classList.add('show');
    
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message }
          ],
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const reply = data.choices[0].message.content;
      
      // Add assistant message
      messagesEl.innerHTML += `
        <div class="message assistant-message">
          ${this.escapeHtml(reply)}
        </div>
      `;
      
    } catch (error) {
      console.error('Error:', error);
      messagesEl.innerHTML += `
        <div class="message assistant-message" style="background: rgba(239, 68, 68, 0.1);">
        Error: ${this.escapeHtml(error.message)}
        </div>
      `;
    } finally {
      // Reset UI
      inputEl.disabled = false;
      document.getElementById('send').disabled = false;
      document.getElementById('typing').classList.remove('show');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const extension = new ChatGPTExtension();
  extension.init();
});