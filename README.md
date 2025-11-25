# FairShare Mobile

A React Native mobile app for splitting bills using AI-powered receipt scanning.

## Features

- 📸 **Camera & Photo Library Integration** - Take photos or select from your library
- 🤖 **AI Receipt Processing** - Automatically parse receipt items using OpenRouter AI
- 👥 **Participant Management** - Add, edit, and remove people splitting the bill
- ⚖️ **Flexible Splitting** - Weight-based splitting system for complex scenarios
- 💰 **Tax & Tip Calculation** - Automatic proportional distribution
- 💳 **Venmo Integration** - Quick payment requests via Venmo deep links
- 🌙 **Dark Mode** - Automatic system theme support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your OpenRouter API key:**
   - Sign up at https://openrouter.ai and generate an API key
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your API key:
     ```
     EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
     ```
   - **Important:** The `.env` file is gitignored and will NOT be committed

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - **iOS**: Press `i` or scan the QR code with the Camera app
   - **Android**: Press `a` or scan the QR code with the Expo Go app
   - **Web**: Press `w`

## Usage

### 1. Input Screen
- Upload a receipt photo (camera or library)
- Describe how to split the bill (e.g., "Alice and Bob shared the apps. Alice had the burger. Add a 20% tip.")
- Or use the example data to try it out

### 2. Editor Screen
- **Participants Tab**: Manage who's splitting the bill
- **Line Items**: Assign shares to each person for each item
  - Tap an item to expand and adjust weights
  - Use + and - buttons to change shares
  - Higher weights = larger share of that item
- **Tax & Tip**: Configure as fixed amount or percentage

### 3. Results Screen
- View breakdown by person
- See base amount, tax share, and tip share
- Request payment via Venmo
- Expand to see itemized breakdown

## Project Structure

```
mobile-app/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Main app entry
├── components/            # Reusable UI components
│   ├── ItemModal.tsx
│   ├── LineItemsList.tsx
│   ├── ModifierSection.tsx
│   ├── ParticipantsList.tsx
│   └── ResultsPanel.tsx
├── hooks/                 # Custom React hooks
│   └── useBillSplitter.ts
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API calls to OpenRouter
│   ├── bill-utils.ts     # Bill calculation logic
│   ├── constants.ts      # App constants
│   ├── image-utils.ts    # Image compression
│   └── validation.ts     # Input validation
├── screens/              # Main app screens
│   ├── EditorScreen.tsx
│   ├── InputScreen.tsx
│   └── ProcessingScreen.tsx
└── types.ts              # TypeScript type definitions
```

## Key Technologies

- **Expo** - React Native development platform
- **Expo Router** - File-based navigation
- **Expo Image Picker** - Camera and photo library access
- **Expo Image Manipulator** - Image compression
- **OpenRouter API** - AI receipt processing (Gemini 2.5 Flash)
- **TypeScript** - Type safety

## Development Tips

- The app automatically detects system dark mode
- Image compression reduces upload sizes for faster API calls
- Weight-based splitting allows for complex scenarios (e.g., "Alice had 2/3, Bob had 1/3")
- All calculations happen locally - only receipt processing requires API calls

## Environment Variables

The app uses a `.env` file for the OpenRouter API key:

- `EXPO_PUBLIC_OPENROUTER_API_KEY` - Your OpenRouter API key (required)

**Note:** The `.env` file is gitignored to prevent accidentally committing your API key. Use `.env.example` as a template.

## Building for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

See [Expo documentation](https://docs.expo.dev/build/setup/) for detailed build instructions.

## License

Private - Part of the FairShare bill splitting application.
