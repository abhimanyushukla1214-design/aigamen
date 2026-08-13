const fs = require('fs');

const code = `import { ComprehensiveGameSpec } from '../types/nexusSpec.js';

export function generateGameHTML(spec: ComprehensiveGameSpec): string {
  const isTopDown = spec.cinematography.cameraPerspective === '2D_TOP_DOWN';
  const gravity = isTopDown ? 0 : (spec.physics.gravity || 9.8);
  const bgColor = spec.cinematography.colorPalette?.[0] || '#111827';
  const playerColor = spec.cinematography.colorPalette?.[1] || '#06b6d4';
  const enemyColor = spec.cinematography.colorPalette?.[2] || '#ef4444';
  const platformColor = spec.cinematography.colorPalette?.[3] || '#374151';
  
  // Serialize the spec to JSON for the client runtime
  const specJson = JSON.stringify(spec);

  return \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${spec.title}</title>
    <style>
        :root {
            --bg-color: \${bgColor};
            --player-color: \${playerColor};
            --enemy-color: \${enemyColor};
            --platform-color: \${platformColor};
        }
        body, html { 
            margin: 0; padding: 0; width: 100%; height: 100%; 
            overflow: hidden; background-color: var(--bg-color); 
            font-family: 'Courier New', Courier, monospace; 
            color: white; 
            user-select: none;
        }
        canvas { 
            display: block; width: 100%; height: 100%; 
            position: absolute; top: 0; left: 0; z-index: 1;
        }
        
        /* HUD UI */
        #ui-layer { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            pointer-events: none; padding: 20px; box-sizing: border-box; 
            z-index: 10; display: flex; flex-direction: column; justify-content: space-between;
        }
        .hud-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .hud-title { margin: 0; font-size: 18px; color: var(--player-color); text-shadow: 0 0 10px var(--player-color); font-weight: bold; text-transform: uppercase; letter-spacing: 2px;}
        .hud-objective { font-size: 14px; opacity: 0.9; max-width: 400px; text-align: center; background: rgba(0,0,0,0.5); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); }
        .hud-status { font-size: 16px; font-weight: bold; color: white; text-align: right;}
        
        .hud-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .controls-hint { font-size: 12px; opacity: 0.6; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 8px; }
        .debug-info { font-size: 10px; color: #0f0; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 4px; display: none; white-space: pre-wrap; max-width: 300px; pointer-events: auto;}
        
        /* Cinematic Intro & Overlays */
        #overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 50; display: flex; flex-direction: column;
            align-items: center; justify-content: center; text-align: center;
            transition: opacity 1s ease;
        }
        .nexus-branding { font-size: 12px; letter-spacing: 4px; color: #4ade80; margin-bottom: 20px; opacity: 0.8;}
        .game-title { font-size: 48px; font-weight: 900; color: var(--player-color); text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0; text-shadow: 0 0 20px var(--player-color);}
        .game-tagline { font-size: 18px; color: #94a3b8; font-style: italic; margin-bottom: 40px; max-width: 600px;}
        .start-prompt { font-size: 14px; color: #fff; animation: pulse 2s infinite; padding: 10px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); cursor: pointer; pointer-events: auto;}
        .start-prompt:hover { background: rgba(255,255,255,0.1); }
        
        @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; text-shadow: 0 0 10px white; }
            100% { opacity: 0.5; }
        }
        
        /* End Screen */
        #end-screen {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            z-index: 40; display: none; flex-direction: column;
            align-items: center; justify-content: center; text-align: center;
        }
        #end-title { font-size: 48px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; }
        .win-text { color: #4ade80; text-shadow: 0 0 20px #4ade80; }
        .lose-text { color: #ef4444; text-shadow: 0 0 20px #ef4444; }
        
        button.action-btn {
            background: var(--player-color); color: #000; border: none;
            padding: 12px 24px; font-size: 16px; font-weight: bold; font-family: monospace;
            cursor: pointer; border-radius: 4px; pointer-events: auto;
            text-transform: uppercase; letter-spacing: 1px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button.action-btn:hover { transform: scale(1.05); box-shadow: 0 0 15px var(--player-color); }
    </style>
</head>
<body>
    <div id="overlay">
        <div class="nexus-branding">NEXUS GENERATED UNIVERSE</div>
        <h1 class="game-title">\${spec.title}</h1>
        <p class="game-tagline">"\${spec.gameplay.winCondition}"</p>
        <div class="start-prompt" onclick="startGame()">PRESS SPACE OR CLICK TO START</div>
    </div>
    
    <div id="end-screen">
        <h1 id="end-title">GAME OVER</h1>
        <p id="end-subtitle" style="margin-bottom: 30px; font-size: 18px; color: #ccc;"></p>
        <button class="action-btn" onclick="restartGame()">Play Again</button>
    </div>

    <div id="ui-layer">
        <div class="hud-top">
            <div class="hud-title">\${spec.title}</div>
            <div class="hud-objective">\${spec.gameplay.winCondition}</div>
            <div class="hud-status" id="hud-status">Score: 0</div>
        </div>
        <div class="hud-bottom">
            <div class="controls-hint">
                <strong>MOVE:</strong> WASD / Arrows<br>
                \${!isTopDown ? '<strong>JUMP:</strong> Space<br>' : ''}
                <strong>DEBUG:</strong> Press \` (Backtick)
            </div>
            <div id="debug-panel" class="debug-info"></div>
        </div>
    </div>
    
    <canvas id="gameCanvas"></canvas>

    <script>
        // Game Spec injected from NEXUS Engine
        const spec = \${specJson};
        
        // DOM Elements
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const overlay = document.getElementById('overlay');
        const endScreen = document.getElementById('end-screen');
        const endTitle = document.getElementById('end-title');
        const endSubtitle = document.getElementById('end-subtitle');
        const hudStatus = document.getElementById('hud-status');
        const debugPanel = document.getElementById('debug-panel');

        // Engine Configuration
        const config = {
            isTopDown: \${isTopDown},
            gravity: \${gravity} * 0.15,
            jumpForce: (\${spec.physics.jumpForce} || 10) * 1.2,
            moveSpeed: (\${spec.physics.movementSpeed} || 5) * 1.5,
            friction: \${spec.physics.friction} || 0.8,
            colors: {
                bg: '\${bgColor}',
                player: '\${playerColor}',
                enemy: '\${enemyColor}',
                platform: '\${platformColor}',
                collectible: '#fef08a'
            }
        };

        // Resize Canvas
        let width, height;
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // Game State
        let gameState = 'INTRO'; // INTRO, PLAYING, GAME_OVER, WIN
        let isDebug = false;
        let score = 0;
        let lastTime = 0;
        let reqId = null;

        // Audio System (Procedural Web Audio API)
        const AudioSys = {
            ctx: null,
            init: function() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
            },
            playTone: function(freq, type, duration, vol) {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                // Envelope
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            },
            jump: () => AudioSys.playTone(400, 'sine', 0.3, 0.5),
            collect: () => {
                AudioSys.playTone(800, 'square', 0.1, 0.3);
                setTimeout(() => AudioSys.playTone(1200, 'square', 0.2, 0.3), 100);
            },
            hit: () => AudioSys.playTone(100, 'sawtooth', 0.4, 0.8),
            win: () => {
                AudioSys.playTone(400, 'sine', 0.2, 0.5);
                setTimeout(() => AudioSys.playTone(500, 'sine', 0.2, 0.5), 200);
                setTimeout(() => AudioSys.playTone(600, 'sine', 0.4, 0.5), 400);
            }
        };

        // Input Handling
        const keys = { w: false, a: false, s: false, d: false, ' ': false };
        window.addEventListener('keydown', e => { 
            // Debug toggle
            if (e.key === '\`' || e.key === '~') {
                isDebug = !isDebug;
                debugPanel.style.display = isDebug ? 'block' : 'none';
                return;
            }
            
            // Start game from intro
            if (gameState === 'INTRO' && (e.key === ' ' || e.key === 'Enter')) {
                startGame();
                return;
            }
            
            const key = e.key.toLowerCase();
            if(keys.hasOwnProperty(key)) keys[key] = true; 
            if(e.key === 'ArrowUp') keys.w = true;
            if(e.key === 'ArrowDown') keys.s = true;
            if(e.key === 'ArrowLeft') keys.a = true;
            if(e.key === 'ArrowRight') keys.d = true;
        });
        window.addEventListener('keyup', e => { 
            const key = e.key.toLowerCase();
            if(keys.hasOwnProperty(key)) keys[key] = false; 
            if(e.key === 'ArrowUp') keys.w = false;
            if(e.key === 'ArrowDown') keys.s = false;
            if(e.key === 'ArrowLeft') keys.a = false;
            if(e.key === 'ArrowRight') keys.d = false;
        });

        // Camera System
        const camera = { x: 0, y: 0 };

        // Entities
        let player = {};
        let platforms = [];
        let enemies = [];
        let collectibles = [];
        let portal = null;
        let particles = [];
        
        // Level Generation
        function initLevel() {
            score = 0;
            hudStatus.innerText = \`Score: \${score}\`;
            particles = [];
            
            // Player
            player = {
                x: 100, y: height/2, width: 40, height: 40,
                vx: 0, vy: 0, isGrounded: false, hp: 100
            };

            platforms = [];
            enemies = [];
            collectibles = [];
            
            const worldWidth = 3000;
            const worldHeight = 1500;
            
            if (config.isTopDown) {
                // Top Down World boundaries
                platforms.push({ x: -50, y: -50, width: worldWidth+100, height: 50 }); // Top
                platforms.push({ x: -50, y: worldHeight, width: worldWidth+100, height: 50 }); // Bottom
                platforms.push({ x: -50, y: -50, width: 50, height: worldHeight+100 }); // Left
                platforms.push({ x: worldWidth, y: -50, width: 50, height: worldHeight+100 }); // Right
                
                // Top Down Obstacles
                for(let i=0; i<30; i++) {
                    platforms.push({
                        x: 200 + Math.random() * (worldWidth - 400),
                        y: 200 + Math.random() * (worldHeight - 400),
                        width: 80 + Math.random() * 120,
                        height: 80 + Math.random() * 120
                    });
                }
                
                // Top Down Enemies
                for(let i=0; i<15; i++) {
                    enemies.push({
                        x: 300 + Math.random() * (worldWidth - 500),
                        y: 300 + Math.random() * (worldHeight - 500),
                        width: 35, height: 35,
                        vx: (Math.random() > 0.5 ? 1 : -1) * 3,
                        vy: (Math.random() > 0.5 ? 1 : -1) * 3
                    });
                }
            } else {
                // Platformer World boundaries
                platforms.push({ x: -50, y: height - 40, width: worldWidth+100, height: 100 }); // Floor
                platforms.push({ x: -50, y: -1000, width: 50, height: height+1000 }); // Left Wall
                platforms.push({ x: worldWidth, y: -1000, width: 50, height: height+1000 }); // Right Wall
                
                // Jump Platforms
                let currX = 200;
                let currY = height - 100;
                while (currX < worldWidth - 300) {
                    currY = Math.max(height - 600, Math.min(height - 100, currY + (Math.random() * 200 - 100)));
                    platforms.push({
                        x: currX,
                        y: currY,
                        width: 120 + Math.random() * 150,
                        height: 25
                    });
                    currX += 150 + Math.random() * 250;
                }
                
                // Platformer Enemies
                for (let p of platforms) {
                    if (p.x > 300 && Math.random() > 0.4 && p.width > 150) {
                        enemies.push({
                            x: p.x + 20,
                            y: p.y - 40,
                            width: 35, height: 35,
                            vx: (Math.random() > 0.5 ? 1 : -1) * 2,
                            vy: 0,
                            boundX1: p.x,
                            boundX2: p.x + p.width
                        });
                    }
                }
            }
            
            // Collectibles
            for(let i=0; i<10; i++) {
                collectibles.push({
                    x: Math.random() * worldWidth,
                    y: config.isTopDown ? Math.random() * worldHeight : (height - 300 - Math.random() * 400),
                    width: 20, height: 20,
                    collected: false
                });
            }
            
            // Portal (Goal)
            portal = {
                x: worldWidth - 200,
                y: config.isTopDown ? worldHeight - 200 : height - 140,
                width: 80, height: 100
            };
        }

        function checkCollision(a, b) {
            return a.x < b.x + b.width &&
                   a.x + a.width > b.x &&
                   a.y < b.y + b.height &&
                   a.y + a.height > b.y;
        }

        // Particle System
        function emitParticles(x, y, color, count, speedScale = 1) {
            for(let i=0; i<count; i++) {
                particles.push({
                    x, y, 
                    vx: (Math.random() - 0.5) * 8 * speedScale,
                    vy: (Math.random() - 0.5) * 8 * speedScale,
                    life: 1.0, color,
                    size: 3 + Math.random() * 4
                });
            }
        }

        function updatePhysics(dt) {
            if (gameState !== 'PLAYING') return;

            // Debug Data
            let dTxt = \`FPS: \${Math.round(1000/dt)}\nPlayer: \${Math.round(player.x)}, \${Math.round(player.y)}\nVel: \${player.vx.toFixed(1)}, \${player.vy.toFixed(1)}\nGrounded: \${player.isGrounded}\nState: \${gameState}\`;
            
            // Player horizontal movement
            if (keys.a) player.vx -= 1;
            if (keys.d) player.vx += 1;
            
            // Top down vertical movement
            if (config.isTopDown) {
                if (keys.w) player.vy -= 1;
                if (keys.s) player.vy += 1;
            } else {
                // Platformer jump
                if ((keys.w || keys[' ']) && player.isGrounded) {
                    player.vy = -config.jumpForce;
                    player.isGrounded = false;
                    AudioSys.jump();
                    emitParticles(player.x + player.width/2, player.y + player.height, '#ffffff', 15);
                }
                // Apply gravity
                player.vy += config.gravity;
            }

            // Apply friction & speed limits
            player.vx *= config.friction;
            if (Math.abs(player.vx) > config.moveSpeed) player.vx = Math.sign(player.vx) * config.moveSpeed;
            if (config.isTopDown) {
                player.vy *= config.friction;
                if (Math.abs(player.vy) > config.moveSpeed) player.vy = Math.sign(player.vy) * config.moveSpeed;
            }

            // Move X
            player.x += player.vx;
            
            // Horizontal Collisions
            for (let p of platforms) {
                if (checkCollision(player, p)) {
                    if (player.vx > 0) player.x = p.x - player.width;
                    else if (player.vx < 0) player.x = p.x + p.width;
                    player.vx = 0;
                }
            }

            // Move Y
            player.y += player.vy;
            player.isGrounded = false;

            // Vertical Collisions
            for (let p of platforms) {
                if (checkCollision(player, p)) {
                    if (player.vy > 0) {
                        player.y = p.y - player.height;
                        player.isGrounded = true;
                    } else if (player.vy < 0) {
                        player.y = p.y + p.height;
                    }
                    player.vy = 0;
                }
            }
            
            // Out of bounds / Death pit
            if (!config.isTopDown && player.y > height + 200) {
                gameOver(false, "Fell into the void.");
                return;
            }

            // Update Enemies
            for (let e of enemies) {
                if (!config.isTopDown) e.vy += config.gravity;
                e.x += e.vx;
                e.y += e.vy;

                let eGrounded = false;
                for (let p of platforms) {
                    if (checkCollision(e, p)) {
                        if (!config.isTopDown && e.vy > 0 && e.y + e.height - e.vy <= p.y) {
                            e.y = p.y - e.height;
                            e.vy = 0;
                            eGrounded = true;
                        } else if (config.isTopDown || e.vy === 0) {
                            // simple bounce
                            if (checkCollision(e, p)) {
                                if (e.vx > 0) { e.x = p.x - e.width; e.vx *= -1; }
                                else if (e.vx < 0) { e.x = p.x + p.width; e.vx *= -1; }
                                
                                if (config.isTopDown) {
                                    if (e.vy > 0) { e.y = p.y - e.height; e.vy *= -1; }
                                    else if (e.vy < 0) { e.y = p.y + p.height; e.vy *= -1; }
                                }
                            }
                        }
                    }
                }
                
                // Platform edge turning
                if (!config.isTopDown && e.boundX1 !== undefined) {
                    if (e.x <= e.boundX1) { e.x = e.boundX1; e.vx *= -1; }
                    if (e.x + e.width >= e.boundX2) { e.x = e.boundX2 - e.width; e.vx *= -1; }
                }
                
                // Player vs Enemy
                if (checkCollision(player, e)) {
                    // Stomp mechanic for platformer
                    if (!config.isTopDown && player.vy > 0 && player.y + player.height < e.y + e.height/2) {
                        // Kill enemy
                        e.dead = true;
                        player.vy = -config.jumpForce * 0.8;
                        emitParticles(e.x + e.width/2, e.y + e.height/2, config.colors.enemy, 30, 2);
                        AudioSys.hit();
                        score += 50;
                        hudStatus.innerText = \`Score: \${score}\`;
                    } else {
                        // Player takes damage
                        emitParticles(player.x + player.width/2, player.y + player.height/2, config.colors.player, 50, 3);
                        AudioSys.hit();
                        gameOver(false, "Destroyed by a hostile entity.");
                        return;
                    }
                }
            }
            
            enemies = enemies.filter(e => !e.dead);
            
            // Collectibles
            for (let c of collectibles) {
                if (!c.collected && checkCollision(player, c)) {
                    c.collected = true;
                    emitParticles(c.x + c.width/2, c.y + c.height/2, config.colors.collectible, 20);
                    AudioSys.collect();
                    score += 10;
                    hudStatus.innerText = \`Score: \${score}\`;
                }
            }

            // Portal / Win
            if (checkCollision(player, portal)) {
                emitParticles(player.x + player.width/2, player.y + player.height/2, '#4ade80', 100, 4);
                gameOver(true, "Goal Reached!");
                return;
            }

            // Motion trail
            if(Math.abs(player.vx) > 3 || Math.abs(player.vy) > 3) {
                if(Math.random() > 0.5) emitParticles(player.x + player.width/2, player.y + player.height/2, config.colors.player, 1, 0.2);
            }
            
            // Camera follow (Lerp)
            const targetCamX = player.x + player.width/2 - width/2;
            const targetCamY = player.y + player.height/2 - height/2;
            camera.x += (targetCamX - camera.x) * 0.1;
            camera.y += (targetCamY - camera.y) * 0.1;

            if (isDebug) debugPanel.innerText = dTxt;
        }

        function draw() {
            // Background Layer (fixed)
            ctx.fillStyle = config.colors.bg;
            ctx.fillRect(0, 0, width, height);
            
            // Add grid/stars to background
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for(let i=0; i<100; i++) {
                // Parallax pseudo-stars
                const px = ((i * 137) - camera.x * 0.2) % width;
                const py = ((i * 311) - camera.y * 0.2) % height;
                const rpx = px < 0 ? px + width : px;
                const rpy = py < 0 ? py + height : py;
                ctx.fillRect(rpx, rpy, 2, 2);
            }

            ctx.save();
            // Apply Camera Transform
            ctx.translate(-camera.x, -camera.y);

            // Draw Portal (Goal)
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(74, 222, 128, 0.2)'; // Outer glow
            ctx.beginPath();
            ctx.arc(portal.x + portal.width/2, portal.y + portal.height/2, 60 + Math.sin(Date.now()/200)*10, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
            ctx.globalCompositeOperation = 'source-over';

            // Draw Platforms
            ctx.fillStyle = config.colors.platform;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 10;
            for (let p of platforms) {
                ctx.fillRect(p.x, p.y, p.width, p.height);
                // Add a top highlight
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(p.x, p.y, p.width, 4);
                ctx.fillStyle = config.colors.platform;
            }
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Draw Collectibles
            for (let c of collectibles) {
                if (!c.collected) {
                    ctx.save();
                    ctx.translate(c.x + c.width/2, c.y + c.height/2);
                    ctx.rotate(Date.now() / 500);
                    ctx.fillStyle = config.colors.collectible;
                    ctx.shadowColor = config.colors.collectible;
                    ctx.shadowBlur = 15;
                    ctx.fillRect(-c.width/2, -c.height/2, c.width, c.height);
                    ctx.restore();
                }
            }

            // Draw Enemies
            for (let e of enemies) {
                ctx.fillStyle = config.colors.enemy;
                ctx.shadowColor = config.colors.enemy;
                ctx.shadowBlur = 15;
                ctx.fillRect(e.x, e.y, e.width, e.height);
                
                // Eye / core
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
                ctx.fillRect(e.x + e.width/2 - 4, e.y + 4, 8, 8);
            }
            ctx.shadowBlur = 0;

            // Draw Player
            if (gameState === 'PLAYING') {
                ctx.fillStyle = config.colors.player;
                ctx.shadowColor = config.colors.player;
                ctx.shadowBlur = 20;
                ctx.fillRect(player.x, player.y, player.width, player.height);
                // Inner core
                ctx.fillStyle = '#fff';
                ctx.fillRect(player.x + 4, player.y + 4, player.width - 8, player.height - 8);
                ctx.shadowBlur = 0;
            }

            // Update & Draw Particles
            ctx.globalCompositeOperation = 'screen';
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
            
            // Draw Debug Bounds
            if (isDebug) {
                ctx.strokeStyle = '#0f0';
                ctx.lineWidth = 1;
                // Player
                ctx.strokeRect(player.x, player.y, player.width, player.height);
                // Platforms
                for (let p of platforms) ctx.strokeRect(p.x, p.y, p.width, p.height);
                // Enemies
                for (let e of enemies) ctx.strokeRect(e.x, e.y, e.width, e.height);
                // Portal
                ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
            }

            ctx.restore();
            
            // Add Vignette Effect
            const grad = ctx.createRadialGradient(width/2, height/2, height/2, width/2, height/2, height);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        function gameLoop(timestamp) {
            const dt = timestamp - lastTime;
            lastTime = timestamp;
            
            updatePhysics(dt);
            draw();
            
            reqId = requestAnimationFrame(gameLoop);
        }

        // State Management
        window.startGame = function() {
            AudioSys.init();
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                gameState = 'PLAYING';
            }, 1000);
        };
        
        window.gameOver = function(win, message) {
            gameState = 'GAME_OVER';
            endScreen.style.display = 'flex';
            if (win) {
                AudioSys.win();
                endTitle.innerText = "MISSION SUCCESS";
                endTitle.className = "win-text";
            } else {
                endTitle.innerText = "CRITICAL FAILURE";
                endTitle.className = "lose-text";
            }
            endSubtitle.innerText = message;
        };
        
        window.restartGame = function() {
            endScreen.style.display = 'none';
            initLevel();
            gameState = 'PLAYING';
            camera.x = player.x + player.width/2 - width/2;
            camera.y = player.y + player.height/2 - height/2;
        };

        // Initialize
        initLevel();
        camera.x = player.x + player.width/2 - width/2;
        camera.y = player.y + player.height/2 - height/2;
        lastTime = performance.now();
        reqId = requestAnimationFrame(gameLoop);
        
    </script>
</body>
</html>\`;
}
`;

fs.writeFileSync('src/engine/template.ts', code);
