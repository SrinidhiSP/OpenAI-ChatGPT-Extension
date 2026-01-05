# OpenAI-ChatGPT-Extension
Chrome Extension for ChatGPT

A Chrome extension that turns the ChatGPT web interface into a stateless, OpenAI v1 compliant API. This solution works by capturing web tokens and injecting them into a browser extension.

## Prerequisites
- Node.js 16+ (for token capture)
- Google Chrome
- OpenAI account with API access

## Steps
- Clone the repo
- Run capture_token.js in CHATGPT-TO-API directory
- Log into ChatGPT Paltform
- Start chat - can be anything (just to capture the tokens)
- Return to terminal and run inject_token.js (Pre-generated output from inject_token.js will be added to CHATGPT-EXTENSION)
- inject_token.js will update or create token_injection.js in CHATGPT-EXTENSION
- Load the CHATGPT-EXTENSION Package into chrome extension.
