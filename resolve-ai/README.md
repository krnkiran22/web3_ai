# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# ResolveAI - Web3 Dispute Resolution Chat Interface

A sophisticated chat interface built with React + Vite + Tailwind CSS for Web3 dispute resolution on the Sepolia testnet, powered by Groq's AI.

## Features

- 🤖 **AI-Powered Chat**: Integrated with Groq's Llama3-70B model for intelligent dispute resolution assistance
- ⛓️ **Blockchain Integration**: Automatic transaction analysis on Sepolia testnet using ethers.js
- 🎨 **Modern UI**: Responsive design with custom RGB(85, 255, 225) accent colors and gradients
- 🔍 **Transaction Analysis**: Automatic detection and analysis of transaction hashes
- 📱 **Responsive**: Mobile-friendly interface with Tailwind CSS
- ⚡ **Real-time**: Live network status and block updates
- 🚀 **Hackathon Ready**: Single-page application ready for deployment

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom accent colors
- **Blockchain**: ethers.js for Sepolia testnet interaction
- **AI**: Groq API with Llama3-70B model
- **HTTP Client**: Axios for API requests

## Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd resolve-ai
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   - Copy `.env.example` to `.env`
   - Add your Groq API key:
     ```env
     REACT_APP_GROQ_API_KEY=your_groq_api_key_here
     ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

### Basic Chat

1. Open the application in your browser
2. Type your Web3-related questions in the chat input
3. Get AI-powered responses for dispute resolution

### Transaction Analysis

1. Include a transaction hash in your message (e.g., "Analyze this transaction: 0x123...")
2. The system automatically fetches blockchain data from Sepolia
3. AI provides contextualized analysis with transaction details

### Example Queries

- "Analyze this failed NFT trade: 0x123..."
- "Why did my DeFi transaction fail?"
- "Check if this smart contract is legitimate"
- "Investigate suspicious wallet activity"
- "Help me understand this gas fee issue"

## Project Structure

```
src/
├── components/
│   └── ChatInterface.tsx     # Main chat component
├── pages/
│   └── ChatPage.tsx         # Chat page layout
├── utils/
│   ├── aiAgent.ts           # Groq AI integration
│   └── blockchain.ts        # Ethereum/Sepolia integration
└── App.tsx                  # Main application
```

## Key Components

### ChatInterface

- Real-time messaging interface
- Automatic transaction hash detection
- Loading states and animations
- Message history management

### AI Agent

- Groq API integration
- Conversation context management
- Web3-specialized prompts
- Error handling

### Blockchain Service

- Sepolia testnet connection
- Transaction data fetching
- Network status monitoring
- Balance and block queries

## API Integration

The AI agent is configured to use Groq's API:

```typescript
const agent = new Agent({
  model: "llama3-70b-8192",
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  baseUrl: "https://api.groq.com/openai/v1",
  preamble:
    "You are a helpful AI assistant specializing in Web3 dispute resolution...",
});
```

## Styling

- Custom Tailwind configuration with ResolveAI brand colors
- RGB(85, 255, 225) accent color throughout the interface
- Gradient backgrounds and modern card designs
- Responsive grid layout for desktop and mobile

## Deployment

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Environment Variables

- `REACT_APP_GROQ_API_KEY`: Your Groq API key (required)
- `REACT_APP_SEPOLIA_RPC`: Custom Sepolia RPC endpoint (optional)

## License

MIT License - see LICENSE file for details

## Hackathon Notes

This project is designed for rapid deployment in hackathon environments:

- Single-page application with all features in one place
- Environment variables for easy configuration
- Modern tech stack for impressive demos
- Comprehensive error handling for stable presentations
- Mobile-responsive for diverse demo scenarios

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
