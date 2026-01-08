# 🎖️ Game of the Generals Online

A real-time multiplayer implementation of the classic Filipino strategy board game **Game of the Generals** (Salpakan), built with modern web technologies and true peer-to-peer connectivity.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-orange?style=flat-square)

## ✨ Features

- **🔗 Pure Peer-to-Peer Gameplay** - Direct WebRTC connections between players, no game server required
- **🎮 Real-time Multiplayer** - Instant piece movement and combat resolution
- **🎨 Modern UI** - Beautiful glassmorphic design with Framer Motion animations
- **📱 Responsive Design** - Play on desktop, tablet, or mobile devices
- **🔐 Room-based Matchmaking** - Create or join games with simple 4-character codes
- **🎲 Randomized Setup** - Automatic piece arrangement for the preparation phase
- **⚔️ Classic Rules** - Authentic Game of the Generals gameplay with spy mechanics

## 🚀 Technology Stack

### Core Technologies
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions

### Peer-to-Peer Architecture
- **WebRTC** - Direct browser-to-browser communication using RTCPeerConnection and RTCDataChannel
- **Supabase** - Used exclusively for WebRTC signaling (SDP exchange and ICE candidate relay)
- **STUN Server** - Google's public STUN server for NAT traversal

### How WebRTC Works in This Project

This game uses **WebRTC Data Channels** to establish direct peer-to-peer connections between players:

1. **Signaling Phase** (via Supabase)
   - Host creates a room and generates an SDP offer
   - Offer is stored in Supabase for the joining player to retrieve
   - Joining player creates an SDP answer and sends it back
   - Both peers exchange ICE candidates through Supabase

2. **Connection Phase**
   - RTCPeerConnection establishes direct connection between browsers
   - RTCDataChannel opens for game state communication
   - Once connected, **all game data flows directly between players**

3. **Gameplay Phase**
   - No server involvement - pure P2P communication
   - Game state, moves, and combat results sent via data channel
   - Sub-100ms latency for most connections

**Why P2P?**
- Zero server costs for gameplay
- Lower latency (direct connection)
- Better privacy (no game data stored on servers)
- Scalable without backend infrastructure

### ⚠️ Security & Limitations

**Important Note**: Since this is a pure peer-to-peer implementation without a server-side "judge," the security model is **primitive and educational in nature**.

In traditional Game of the Generals, a neutral arbiter or referee determines combat outcomes without revealing piece identities to either player. In this implementation:

- **Piece information is sent directly between players** during combat
- Players with technical knowledge could inspect network traffic or modify client code to see opponent pieces
- There is **no server validation** of moves or combat results
- Cheating is possible for anyone who reverse engineers the WebRTC data channel messages

**This is a proof-of-concept project** demonstrating WebRTC capabilities, not a production-ready competitive game. For serious competitive play, this would require:
- Server-side game state management
- Authoritative server to validate all moves and resolve combat
- Encrypted piece data until revealed
- Anti-cheat mechanisms

The current implementation prioritizes **learning WebRTC** and **code simplicity** over competitive security. Play with friends you trust! 🤝

## 🎯 Game Rules

Game of the Generals is a two-player strategy game where:
- Each player has 21 pieces with hidden ranks
- The goal is to capture your opponent's flag
- When pieces collide, the higher rank wins
- **Special Rule**: The Spy (lowest rank) can eliminate any piece except the Private (rank 1)
- Private eliminates the Spy, but loses to all other pieces

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/game-of-the-generals-online.git
cd game-of-the-generals-online
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Playing the Game

1. **Host a Game**: Click "Create Room" to generate a room code
2. **Join a Game**: Enter a room code and click "Join Room"
3. **Prepare**: Arrange your pieces in your deployment zone (or use random setup)
4. **Ready Up**: Both players mark themselves as ready
5. **Play**: Take turns moving pieces and capturing the opponent's flag!

## 📁 Project Structure

```
app/
├── page.tsx              # Main game component with WebRTC logic
├── globals.css           # Global styles
├── layout.tsx           # Root layout
└── components/
    ├── GameBoard.tsx     # Interactive game board
    ├── PlayerInfoCard.tsx # Player status display
    ├── RoomPanel.tsx     # Room creation/joining
    ├── ReadyPanel.tsx    # Ready state control
    └── CheatSheet.tsx    # Piece rank reference
```

## 🎮 Technical Highlights

### WebRTC Implementation
- Custom RTCPeerConnection setup with ICE candidate queuing
- Bidirectional RTCDataChannel for game state synchronization
- Graceful handling of connection states and failures
- Automatic reconnection attempts

### State Management
- React hooks (useState, useEffect, useRef)
- useRef for closure-proof state access in WebRTC callbacks
- Optimized re-renders with functional state updates
- Board state synchronization between peers

### Game Logic
- Turn-based validation
- Movement rules (adjacency checking)
- Combat resolution with special piece mechanics
- Win condition detection (flag capture)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to:
- Open an issue for bugs or feature requests
- Fork the project for your own experiments
- Share your thoughts on the implementation

## 📝 License

This project is open source and available under the MIT License.

## 🇵🇭 About Game of the Generals

Game of the Generals (also called Salpakan) is a classic Filipino board game invented by Sofronio H. Pasola Jr. in 1970. This online implementation aims to preserve and share this cultural game with a global audience through modern web technology.

---

Built with ❤️ using WebRTC and Next.js
