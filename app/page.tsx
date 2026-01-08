"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swords, Star } from 'lucide-react';
import GameBoard from './components/GameBoard';
import PlayerInfoCard from './components/PlayerInfoCard';
import RoomPanel from './components/RoomPanel';
import CheatSheet from './components/CheatSheet';
import { createClient } from "@supabase/supabase-js";
import { toast, Toaster } from 'sonner';
import ReadyPanel from './components/ReadyPanel';

const supabase = createClient(
  "https://zxaymiepxoithjwdshmz.supabase.co",
  "sb_publishable_lxA_wdi3-B7pCoFfz4sqtw_JIzKnuuq"
);

const iceConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

const pieceMap = {
  'spy': -1,
  'flag': 0,
  'pvt': 1,
  'sgt': 2,
  '2lt': 3,
  '1lt': 4,
  'cap': 5,
  'maj': 6,
  'ltcol': 7,
  'col': 8,
  '1gen': 9,
  '2gen': 10,
  '3gen': 11,
  '4gen': 12,
  '5gen': 13,
}

function randomizePlayerPieces(side: 'red' | 'blue'): [(string | null)[], (string | null)[], (string | null)[]] {
  const pieces: (string | null)[] = [
    'pvt', 'pvt', 'pvt', 'pvt', 'pvt', 'pvt', // 6 privates
    'spy', 'spy', // 2 spies
    '5gen', '4gen', '3gen', '2gen', '1gen', // Generals
    'col', 'ltcol', 'maj', // Officers
    'cap', '1lt', '2lt', // Junior Officers
    'sgt',
    'flag',
    null, null, null, null, null, null
  ];

  // Shuffle the pieces using Fisher-Yates algorithm
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }

  // Add side prefix to all pieces
  const prefixedPieces = pieces.map(piece => piece && `${side}-${piece}`);

  // Split into 3 rows of 9 (27 total pieces)
  const row1 = prefixedPieces.slice(0, 9);
  const row2 = prefixedPieces.slice(9, 18);
  const row3 = prefixedPieces.slice(18, 27);

  return [row1, row2, row3];
}

// Generate default board with randomized pieces
function generateDefaultBoard() {
  const [redRow0, redRow1, redRow2] = randomizePlayerPieces('red');
  const [blueRow0, blueRow1, blueRow2] = randomizePlayerPieces('blue');
  
  return [
    blueRow0,
    blueRow1,
    blueRow2,
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    redRow0,
    redRow1,
    redRow2,
  ];
}

function generatePrepBoard(side: 'red' | 'blue') {
  const [row0, row1, row2] = randomizePlayerPieces(side);
  
  return [
    side === 'blue' ? row0 : [null, null, null, null, null, null, null, null, null],
    side === 'blue' ? row1 : [null, null, null, null, null, null, null, null, null],
    side === 'blue' ? row2 : [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    side === 'red' ? row0 : [null, null, null, null, null, null, null, null, null],
    side === 'red' ? row1 : [null, null, null, null, null, null, null, null, null],
    side === 'red' ? row2 : [null, null, null, null, null, null, null, null, null],
  ];
}

function hidePieces(board: (string | null)[][], side: 'red' | 'blue'): (string | null)[][] {
  const prefix = side === 'red' ? 'red-' : 'blue-';
  
  return board.map(row => 
    row.map(cell => {
      if (cell?.startsWith(prefix)) {
        return `${prefix}idk`;
      }
      return cell;
    })
  );
}

function combineBoards(board1: (string | null)[][], board2: (string | null)[][]): (string | null)[][] {
  return board1.map((row, rowIndex) => 
    row.map((cell, colIndex) => {
      return cell ?? board2[rowIndex]?.[colIndex];
    })
  );
}

function getMyPieces(currentBoard: (string | null)[][], currentSide: 'red' | 'blue'): (string | null)[][] {
  const prefix = currentSide === 'red' ? 'red-' : 'blue-';
  
  return currentBoard.map(row => 
    row.map(cell => {
      if (cell?.startsWith(prefix)) {
        return cell;
      }
      return null;
    })
  );
}

export default function GameOfGenerals() {
  const [connected, setConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [role, setRole] = useState<'host' | 'connector' | null>(null);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [board, setBoard] = useState<(string | null)[][]>([]);
  const boardRef = useRef<(string | null)[][]>([]);
  const [side, setSide] = useState<'red' | 'blue' | null>(null);
  const sideRef = useRef<'red' | 'blue' | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'preparing' | 'playing' | 'ended'>('waiting');
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [turn, setTurn] = useState<'red' | 'blue' | null>(null);
  const [winner, setWinner] = useState<'red' | 'blue' | 'draw' | null>(null);

  // Initialize board after component mounts to avoid SSR mismatch
  useEffect(() => {
    const newBoard = hidePieces(generateDefaultBoard(), 'blue');
    setBoard(newBoard);
  }, []);

  // Keep refs in sync
  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  
  useEffect(() => {
    sideRef.current = side;
  }, [side]);

  // Cleanup connections on unmount
  useEffect(() => {
    return () => {
      if (dataChannel) {
        dataChannel.close();
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === 'preparing' && side === 'red') {
      dataChannel?.send(JSON.stringify({ type: "IsReady", ready: player1Ready }));
    }
  }, [player1Ready]);
  useEffect(() => {
    if (gameState === 'preparing' && side === 'blue') {
      dataChannel?.send(JSON.stringify({ type: "IsReady", ready: player2Ready }));
    }
  }, [player2Ready]);

  useEffect(() => {
    if (gameState === 'preparing' && player1Ready && player2Ready) {
      setPlayer1Ready(false);
      setPlayer2Ready(false);
      setGameState('playing');
      setTurn('red');
      dataChannel?.send(JSON.stringify({ type: "RequestPieces" }));
      toast.success('Both players are ready! Game starts now.');
    }
  }, [player1Ready, player2Ready]);

  // Auto-reset when game ends
  useEffect(() => {
    if (gameState === 'ended') {
      const timer = setTimeout(() => {
        setGameState('waiting');
        setBoard(hidePieces(generateDefaultBoard(), 'blue'));
        setWinner(null);
        setTurn(null);
        setSide(null);
        setConnected(false);
        setRoomCode('');
        setPeerConnection(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  function movePiece(from: { row: number; col: number }, to: { row: number; col: number }) {
    console.log(`Moving piece from (${from.row}, ${from.col}) to (${to.row}, ${to.col})`);
    
    switch (gameState) {
      case 'waiting': {
        let temp = board[to.row][to.col];
        board[to.row][to.col] = board[from.row][from.col];
        board[from.row][from.col] = temp;
        setBoard([...board]);
        return;
      }
      case 'preparing': {
        if ((side === 'red' && (to.row < 5)) || (side === 'blue' && (to.row > 2))) {
          console.log("Invalid move: Can only move within preparing zone");
          return;
        }
        if (side === 'red' && player1Ready || side === 'blue' && player2Ready) {
          console.log("Invalid move: Player is already ready");
          return;
        }
        let temp = board[to.row][to.col];
        board[to.row][to.col] = board[from.row][from.col];
        board[from.row][from.col] = temp;
        setBoard([...board]);
        return;
      }
      case 'playing': {
        // Check if it's the player's turn
        if (turn !== side) {
          console.log("Invalid move: Not your turn");
          return;
        }

        const movingPiece = board[from.row][from.col];
        
        // Check if the piece belongs to the player
        if (!movingPiece?.startsWith(`${side}-`)) {
          console.log("Invalid move: Not your piece");
          return;
        }
        
        // Check if move is adjacent (horizontal or vertical only, not diagonal)
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
        
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
          console.log("Invalid move: Can only move to adjacent spaces");
          return;
        }

        const occupyingPiece = board[to.row][to.col];

        if (occupyingPiece) { // Attacking
          if (occupyingPiece.startsWith(`${side}-`)) {
            console.log("Invalid move: Cannot attack your own piece");
            return;
          }

          const attacker = pieceMap[movingPiece.split("-")[1] as keyof typeof pieceMap];
          console.log(`Attacker ${movingPiece} piece value: ${attacker}`);
          dataChannel?.send(JSON.stringify({
            type: "AttackPiece",
            from,
            to,
            attacker
          }));
          setTurn(turn === 'red' ? 'blue' : 'red');
        } else { // Simply moving
          board[to.row][to.col] = board[from.row][from.col];
          board[from.row][from.col] = null;
          setTurn(turn === 'red' ? 'blue' : 'red');
          dataChannel?.send(JSON.stringify({
            type: "MovePiece",
            from,
            to
          }));
        }
        
        return;
      }
      default:
        return;
    }

  }

  const generateRoomCode = async () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let exists = true;
    
    while (exists) {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const { data } = await supabase
        .from('rooms')
        .select('join_code')
        .eq('join_code', code)
      
      exists = data && data.length > 0 || false;
    }
    
    return code;
  };

  function handleCommonTypes(data: { type: string; [key: string]: any }, channel: RTCDataChannel) {
    switch (data.type) {
      case "Handshake":
        channel.send(JSON.stringify({ type: "Handshake-Ack" }));
        break;
      case "Handshake-Ack":
        console.log("Handshake complete");
        break;
      case "RequestPieces": {
        console.log("Request for pieces received");
        const currentSide = sideRef.current;
        console.log("My side:", currentSide);
        if (currentSide) {
          setBoard(currentBoard => {
            const myPieces = getMyPieces(currentBoard, currentSide);
            channel.send(JSON.stringify({ type: "RequestPieces-Reply", board: hidePieces(myPieces, currentSide) }));
            return currentBoard;
          });
        }
        break;
      }
      case "RequestPieces-Reply":
        console.log("Received opponent pieces");
        setBoard(currentBoard => combineBoards(currentBoard, data.board));
        break;
      case "MovePiece":
        console.log("Received move piece command");
        setBoard(currentBoard => {
          const newBoard = currentBoard.map(row => [...row]);
          newBoard[data.to.row][data.to.col] = newBoard[data.from.row][data.from.col];
          newBoard[data.from.row][data.from.col] = null;
          return newBoard;
        });
        setTurn(currentTurn => currentTurn === 'red' ? 'blue' : 'red');
        break;
      case "AttackPiece": {
        console.log("Received attack piece command");
        
        const attacker = data.attacker;
        let result: "both" | "attacker" | "defender" | null = null;

        // Access current board and calculate result inside setBoard
        const currentBoard = boardRef.current;
        const defenderPiece = currentBoard[data.to.row][data.to.col];
        const defender = pieceMap[defenderPiece?.split("-")[1] as keyof typeof pieceMap];

        console.log(`Defender ${defenderPiece} piece value: ${defender}`);
        console.log(`Attacker: ${attacker}, Defender: ${defender}`);
        
        // Calculate result based on current board state
        if (attacker === defender) {
          result = "both";
        } else if (attacker === -1 && defender !== 1) {
          result = "attacker";
        } else if (defender === -1 && attacker !== 1) {
          result = "defender";
        } else if (attacker > defender) {
          result = "attacker";
        } else if (defender > attacker) {
          result = "defender";
        }

        // Update board based on result
        const newBoard = currentBoard.map(row => [...row]);
        
        if (result === "both") {
          newBoard[data.to.row][data.to.col] = null;
          newBoard[data.from.row][data.from.col] = null;
        } else if (result === "attacker") {
          newBoard[data.to.row][data.to.col] = newBoard[data.from.row][data.from.col];
          newBoard[data.from.row][data.from.col] = null;
        } else {
          newBoard[data.from.row][data.from.col] = null;
        }

        setBoard(newBoard);

        if (defender === 0 || attacker === 0) {
          setGameState('ended');
          let gameWinner: 'red' | 'blue' | 'draw' | null;
          if (defender === 0 && attacker === 0) {
            gameWinner = 'draw';
          } else if (defender === 0) {
            gameWinner = sideRef.current === 'red' ? 'blue' : 'red';
          } else {
            gameWinner = sideRef.current;
          }
          setWinner(gameWinner);

          channel.send(JSON.stringify({ type: "GameOver", winner: gameWinner }));
          return;
        }
        
        // Send result after setBoard (only once)
        if (result) {
          channel.send(JSON.stringify({ type: "AttackResult", result, from: data.from, to: data.to }));
          setTurn(currentTurn => currentTurn === 'red' ? 'blue' : 'red');
        }
        break;
      }
      case "AttackResult": {
        console.log("Received attack result");
        console.log(`Result: ${data.result}`);
        const currentBoard = boardRef.current;
        const newBoard = currentBoard.map(row => [...row]);
        if (data.result === "both") {
          newBoard[data.to.row][data.to.col] = null;
          newBoard[data.from.row][data.from.col] = null;
          setBoard(newBoard);
        } else if (data.result === "attacker") {
          newBoard[data.to.row][data.to.col] = newBoard[data.from.row][data.from.col];
          newBoard[data.from.row][data.from.col] = null;
          setBoard(newBoard);
        } else if (data.result === "defender") {
          newBoard[data.from.row][data.from.col] = null;
          setBoard(newBoard);
        }
        break;
      }
      case "GameOver": {
        console.log("Game over received");
        setGameState('ended');
        setWinner(data.winner);
        break;
      }
    }
  }

  const handleCreateRoom = async () => {
    if (peerConnection) {
      console.log("Room already created");
      return;
    }

    const newCode = await generateRoomCode();

    const pc = new RTCPeerConnection(iceConfig);
    const candidateQueue: RTCIceCandidate[] = [];
    let remoteDescriptionSet = false;

    const channel = pc.createDataChannel("game");

    channel.onopen = () => {
      console.log("✅ Host DataChannel open");
      setConnected(true);
      setSide('red');
      setBoard(generatePrepBoard('red'));
      setGameState('preparing');
      setPlayer1Ready(false);
      setPlayer2Ready(false);
    };

    channel.onmessage = (e) => {
      const data = JSON.parse(e.data);

      handleCommonTypes(data, channel);

      switch (data.type) {
        case "PlayerName": 
          setPlayer2Name(data.name);
          break;
        case "IsReady":
          setPlayer2Ready(data.ready);
          break;
        default: break;
      }
    };

    channel.onclose = () => {
      console.log("❌ DataChannel closed");
    }

    // Store WebRTC objects in state
    setPeerConnection(pc);
    setDataChannel(channel);
    setRole('host');

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        console.log("New Host ICE candidate:", e.candidate);
        await supabase.from("ice_candidates").insert({
          join_code: newCode,
          from_peer: "host",
          candidate: e.candidate
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await supabase.from("rooms").insert({
      join_code: newCode,
      offer
    });

    // Wait for answer
    supabase
      .channel(`host-${newCode}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `join_code=eq.${newCode}` },
        async (payload) => {
          if (payload.new.answer && !remoteDescriptionSet) {
            await pc.setRemoteDescription(payload.new.answer);
            remoteDescriptionSet = true;
            // Process queued candidates
            while (candidateQueue.length > 0) {
              const candidate = candidateQueue.shift();
              if (candidate) {
                await pc.addIceCandidate(candidate);
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ice_candidates",
          filter: `join_code=eq.${newCode}`
        },
        async (payload) => {
          if (payload.new.from_peer === "connector") {
            const candidate = new RTCIceCandidate(payload.new.candidate);
            if (remoteDescriptionSet) {
              await pc.addIceCandidate(candidate);
            } else {
              candidateQueue.push(candidate);
            }
          }
        }
      )
      .subscribe();

    setRoomCode(newCode);
    toast.success('Room created successfully!');
  };

  const handleJoinRoom = async (joinCode: string) => {
    if (peerConnection) {
      console.log("Already connected to a room");
      return;
    }

    const pc = new RTCPeerConnection(iceConfig);
    const candidateQueue: RTCIceCandidate[] = [];
    let remoteDescriptionSet = false;

    pc.ondatachannel = (event) => {
      const channel = event.channel;

      channel.onopen = () => {
        console.log("✅ Connector DataChannel open");
        channel.send(JSON.stringify({ type: "PlayerName", name: "Player 2" }));
        setConnected(true);
        setSide('blue');
        setBoard(generatePrepBoard('blue'));
        setGameState('preparing');
        setPlayer1Ready(false);
        setPlayer2Ready(false);
      };

      channel.onmessage = (e) => {
        const data = JSON.parse(e.data);

        handleCommonTypes(data, channel);

        switch (data.type) {
          case "PlayerName": 
            setPlayer1Name(data.name);
            break;
          case "IsReady":
            setPlayer1Ready(data.ready);
            break;
          default: break;
        }
      };

    channel.onclose = () => {
      console.log("❌ DataChannel closed");
    }

      // Store WebRTC objects in state
      setPeerConnection(pc);
      setDataChannel(channel);
      setRoomCode(joinCode);
      setRole('connector');
    };

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        console.log("New Connector ICE candidate:", e.candidate);
        await supabase.from("ice_candidates").insert({
          join_code: joinCode,
          from_peer: "connector",
          candidate: e.candidate
        });
      }
    };

    // Fetch host offer directly
    const { data: room } = await supabase
      .from("rooms")
      .select("offer")
      .eq("join_code", joinCode)
      .single();

    if (!room?.offer) {
      throw new Error("Invalid join code or host not ready");
    }

    await pc.setRemoteDescription(room.offer);
    remoteDescriptionSet = true;

    // Create & send answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await supabase
      .from("rooms")
      .update({ answer })
      .eq("join_code", joinCode);

    // Listen ONLY for host ICE
    supabase
      .channel(`connector-${joinCode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ice_candidates",
          filter: `join_code=eq.${joinCode}`
        },
        async (payload) => {
          if (payload.new.from_peer === "host") {
            const candidate = new RTCIceCandidate(payload.new.candidate);
            if (remoteDescriptionSet) {
              await pc.addIceCandidate(candidate);
            } else {
              candidateQueue.push(candidate);
            }
          }
        }
      )
      .subscribe();

    toast.success(`Joined room ${joinCode.toUpperCase()}`);
  };
  
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <Toaster position="top-center" richColors />
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-yellow-500/5 rounded-full blur-[128px]" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
                  Game of the Generals
                </h1>
                <p className="text-slate-400 text-xs hidden sm:block">The classic Filipino strategy board game</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">

        {/* Main Layout */}
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start justify-center">
          {/* Left Panel - Red Player & Room */}
          <div className="w-full xl:w-80 space-y-6 order-2 xl:order-1">
            <PlayerInfoCard 
              playerName={player1Name}
              color="red" 
              isActive={turn === 'red' || player1Ready}
              playerState={player1Ready ? 'ready' : gameState === 'preparing' ? 'preparing' : undefined}
            />
            {!connected && <div className="hidden xl:block">
              <RoomPanel 
                roomCode={roomCode}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
              />
            </div>}
            {gameState === 'preparing' && connected && side &&
              <ReadyPanel 
                isReady={side === 'red' ? player1Ready : player2Ready}
                setReady={side === 'red' ? setPlayer1Ready : setPlayer2Ready}
              />
            }
          </div>

          {/* Center - Game Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-1 xl:order-2 w-full max-w-2xl self-center"
          >
            <GameBoard side={side || 'red'} board={board} movePiece={movePiece} />
            
            {/* Game State Indicator */}
            {gameState && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex justify-center"
              >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-6 py-3 inline-flex items-center gap-3">
                  {gameState === 'playing' && turn ? (
                    <>
                      <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <span className="text-slate-300 text-sm font-medium">{turn === 'red' ? 'Red' : 'Blue'}'s Turn</span>
                    </>
                  ) : (
                    <span className="text-slate-300 text-sm font-medium">{gameState.charAt(0).toUpperCase() + gameState.slice(1)}...</span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Panel - Blue Player */}
          <div className="w-full xl:w-80 space-y-6 order-3">
            <PlayerInfoCard 
              playerName={player2Name} 
              color="blue"
              isActive={turn === 'blue' || player2Ready}
              playerState={player2Ready ? 'ready' : gameState === 'preparing' ? 'preparing' : undefined}
            />
            {!connected && <div className="xl:hidden">
              <RoomPanel 
                roomCode={roomCode}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
              />
            </div>}
            <CheatSheet />
          </div>
        </div>

        {/* Game End Modal */}
        {gameState === 'ended' && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/10 border-2 rounded-3xl px-12 py-16 text-center max-w-md"
              style={{
                borderColor: winner === 'draw' ? 'rgb(156, 163, 175)' : winner === 'red' ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
              }}
            >
              <div className="mb-6">
                {winner === 'draw' ? (
                  <div className="text-6xl mb-4">🤝</div>
                ) : winner === side ? (
                  <div className="text-6xl mb-4">🎉</div>
                ) : (
                  <div className="text-6xl mb-4">😔</div>
                )}
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{
                color: winner === 'draw' ? 'rgb(156, 163, 175)' : winner === 'red' ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
              }}>
                {winner === 'draw' ? "It's a Draw!" : winner === side ? 'Victory!' : 'Defeat'}
              </h2>
              <p className="text-slate-300 text-lg mb-2">
                {winner === 'draw' ? 'Both flags were captured!' : `${winner === 'red' ? 'Red' : 'Blue'} player captured the flag!`}
              </p>
              <p className="text-slate-400 text-sm">
                Returning to lobby in a moment...
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-slate-600 text-sm"
        >
          <p>🇵🇭 A Filipino classic • Laro ng mga Heneral</p>
        </motion.div>
      </div>
    </div>
  );
}