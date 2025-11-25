# Quick Setup Guide

## Setting up your API Key

1. Copy the example file to create your own `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your OpenRouter API key:
   ```
   EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```

3. That's it! The `.env` file is automatically gitignored and won't be committed.

## Getting an API Key

1. Go to https://openrouter.ai
2. Sign up or log in
3. Navigate to the API Keys section
4. Create a new API key
5. Copy it and paste it into your `.env` file

## Running the App

```bash
npm install
npm start
```

Then scan the QR code with your phone or press `i` for iOS / `a` for Android.
