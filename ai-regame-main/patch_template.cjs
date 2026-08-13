const fs = require('fs');

const code = `import { PlayableGameDefinition } from '../types/gameBuilder.js';

export function generateGameHTML(def: PlayableGameDefinition): string {
    const isTopDown = def.physics.gravity === 0;
    const gravity = def.physics.gravity;
    const bgColor = def.theme.background;
    const playerColor = def.theme.player;
    const enemyColor = def.theme.enemy;
    const platformColor = def.theme.platform;

    return \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>\${def.title}</title>
    <style>
        :root {
            --bg-color: \${bgColor};
            --player-color: \${playerColor};
            --enemy-color: \${enemyColor};
            --platform-color: \${platformColor};
        }
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: var(--bg-color); font-family: "Courier New", Courier, monospace; color: white; user-select: none; }
        canvas { display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
        
        #ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; padding: 20px; box-sizing: border-box; z-index: 10; display: flex; flex-direction: column; justify-content: space-between; }
        .hud-top { display: flex; justify-content: space-between; align-items: flex-start; transition: opacity 0.5s; opacity: 0; }
        .hud-title { margin: 0; font-size: 18px; color: var(--player-color); text-shadow: 0 0 10px var(--player-color); font-weight: bold; text-transform: uppercase; letter-spacing: 2px;}
        .hud-objective { font-size: 14px; opacity: 0.9; max-width: 400px; text-align: center; background: rgba(0,0,0,0.5); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); }
        .hud-status { font-size: 16px; font-weight: bold; color: white; text-align: right; }
        
        #start-screen, #pause-screen, #end-screen { display: flex; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 50; flex-direction: column; align-items: center; justify-content: center; pointer-events: auto; transition: opacity 0.5s; }
        #pause-screen, #end-screen { display: none; }
        
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .card h1 { margin-top: 0; color: var(--player-color); text-shadow: 0 0 15px var(--player-color); text-transform: uppercase; letter-spacing: 3px; font-size: 28px; }
        .card p { color: #aaa; line-height: 1.6; margin-bottom: 30px; font-size: 14px; }
        .controls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; margin-bottom: 30px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; }
        .controls-grid div { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; }
        .controls-grid span.key { color: white; font-weight: bold; }
        
        .action-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 12px 28px; font-size: 14px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; border-radius: 6px; transition: all 0.2s; margin: 5px; }
        .action-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .primary-btn { background: var(--player-color); color: #000; border: none; font-weight: bold; }
        .primary-btn:hover { background: white; color: black; box-shadow: 0 0 20px var(--player-color); }
        
        h1.win-text { color: #4ade80; text-shadow: 0 0 20px #4ade80; }
        h1.lose-text { color: #ef4444; text-shadow: 0 0 20px #ef4444; }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    
    <div id="ui-layer">
        <div class="hud-top" id="hud-top">
            <button class="action-btn" style="padding: 4px 12px; font-size: 12px; margin: 0; border-color: rgba(255,255,255,0.1); pointer-events: auto;" onclick="togglePause()">MENU</button>
            <div class="hud-title">\${def.title}</div>
            <div class="hud-objective">\${def.winCondition}</div>
            <div class="hud-status" id="hud-status">Score: 0</div>
        </div>
    </div>

    <div id="start-screen">
        <div class="card">
            <h1>\${def.title}</h1>
            <p>\${def.winCondition}</p>
            <div class="controls-grid">
                <div><span>Move</span><span class="key">WASD / ARROWS</span></div>
                <div><span>Action</span><span class="key">SPACE</span></div>
                <div><span>Pause</span><span class="key">ESC</span></div>
            </div>
            <button class="action-btn primary-btn" onclick="startGame()">Start Game</button>
        </div>
    </div>

    <div id="pause-screen">
        <div class="card">
            <h1 style="color: white; text-shadow: 0 0 10px rgba(255,255,255,0.5);">PAUSED</h1>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                <button class="action-btn" onclick="resumeGame()">Resume</button>
                <button class="action-btn" onclick="restartGame()">Restart</button>
                <button class="action-btn" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444;" onclick="window.emitEvent('EXIT_GAME', null)">Home</button>
            </div>
        </div>
    </div>

    <div id="end-screen">
        <div class="card">
            <h1 id="end-title">GAME OVER</h1>
            <p id="end-subtitle" style="font-size: 16px; margin-bottom: 20px;"></p>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 30px; color: white;" id="end-score">Score: 0</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button class="action-btn primary-btn" onclick="restartGame()">Play Again</button>
                <button class="action-btn" style="background: rgba(8, 145, 178, 0.2); border-color: rgba(8, 145, 178, 0.4); color: #22d3ee;" onclick="window.emitEvent('VIEW_UNIVERSE', null)">View Universe State</button>
                <button class="action-btn" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444;" onclick="window.emitEvent('EXIT_GAME', null)">Home</button>
            </div>
        </div>
    </div>

    <script>
        const config = {
            isTopDown: \${isTopDown},
            gravity: \${gravity},
            jumpForce: \${def.physics.jumpForce},
            moveSpeed: \${def.physics.movementSpeed},
            friction: \${def.physics.friction},
            world: \${JSON.stringify(def.world)},
            player: \${JSON.stringify(def.player)},
            entities: \${JSON.stringify(def.entities)},
            colors: {
                bg: "\${bgColor}",
                player: "\${playerColor}",
                enemy: "\${enemyColor}",
                platform: "\${platformColor}",
                collectible: "#f59e0b"
            }
        };

        // Communication
        window.emitEvent = function(type, payload) {
            window.parent.postMessage({ type: 'NEXUS_EVENT', eventType: type, payload: payload }, '*');
        };

        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const startScreen = document.getElementById("start-screen");
        const pauseScreen = document.getElementById("pause-screen");
        const endScreen = document.getElementById("end-screen");
        const endTitle = document.getElementById("end-title");
        const endSubtitle = document.getElementById("end-subtitle");
        const endScore = document.getElementById("end-score");
        const hudStatus = document.getElementById("hud-status");
        const hudTop = document.getElementById("hud-top");

        let gameState = 'START_SCREEN';
        let score = 0;
        let reqId;

        // Responsive rendering
        let width, height;
        function resize() {
            const pr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * pr;
            canvas.height = height * pr;
            ctx.scale(pr, pr);
        }
        window.addEventListener("resize", resize);
        resize();

        // Input Manager
        const Input = {
            keys: {},
            prevKeys: {},
            jumpBuffer: 0,
            init() {
                window.addEventListener('keydown', e => this.keys[e.code] = true);
                window.addEventListener('keyup', e => this.keys[e.code] = false);
                window.addEventListener('blur', () => this.keys = {});
            },
            update(dt) {
                if (this.wasJumpPressed()) this.jumpBuffer = 0.15;
                if (this.jumpBuffer > 0) this.jumpBuffer -= dt;
                this.prevKeys = { ...this.keys };
            },
            isDown(code) { return !!this.keys[code]; },
            wasPressed(code) { return !!this.keys[code] && !this.prevKeys[code]; },
            isLeft() { return this.isDown('ArrowLeft') || this.isDown('KeyA'); },
            isRight() { return this.isDown('ArrowRight') || this.isDown('KeyD'); },
            isUp() { return this.isDown('ArrowUp') || this.isDown('KeyW'); },
            isDownDir() { return this.isDown('ArrowDown') || this.isDown('KeyS'); },
            wasJumpPressed() { return this.wasPressed('Space') || this.wasPressed('ArrowUp') || this.wasPressed('KeyW'); },
            consumeJumpBuffer() { 
                if (this.jumpBuffer > 0) {
                    this.jumpBuffer = 0;
                    return true;
                }
                return false;
            }
        };
        Input.init();

        window.addEventListener('keydown', e => {
            if (e.code === 'Escape') {
                togglePause();
            }
        });

        window.togglePause = function() {
            if (gameState === 'PLAYING') {
                gameState = 'PAUSED';
                pauseScreen.style.display = 'flex';
                pauseScreen.style.opacity = '1';
            } else if (gameState === 'PAUSED') {
                window.resumeGame();
            }
        };
        
        window.resumeGame = function() {
            gameState = 'PLAYING';
            pauseScreen.style.display = 'none';
            lastTime = performance.now();
        };

        window.startGame = function() {
            startScreen.style.opacity = '0';
            setTimeout(() => {
                startScreen.style.display = 'none';
                hudTop.style.opacity = '1';
                gameState = 'PLAYING';
                lastTime = performance.now();
                initLevel();
            }, 500);
        };

        window.restartGame = function() {
            gameState = 'PLAYING';
            endScreen.style.display = 'none';
            pauseScreen.style.display = 'none';
            hudTop.style.opacity = '1';
            initLevel();
            lastTime = performance.now();
        };

        let player, platforms, enemies, collectibles, portal, particles, trails;
        
        const Camera = {
            x: 0, y: 0,
            targetX: 0, targetY: 0,
            shakeAmount: 0,
            follow(target, dt) {
                // Lookahead based on velocity
                const lookaheadX = target.vx * 0.5;
                const lookaheadY = target.vy * 0.2;
                
                this.targetX = target.x + target.width/2 - width/2 + lookaheadX;
                this.targetY = target.y + target.height/2 - height/2 + lookaheadY;
                
                // Boundaries
                this.targetX = Math.max(0, Math.min(this.targetX, config.world.width - width));
                this.targetY = Math.max(0, Math.min(this.targetY, config.world.height - height));
                
                // Smooth follow (lerp)
                this.x += (this.targetX - this.x) * 5 * dt;
                this.y += (this.targetY - this.y) * 5 * dt;

                if (this.shakeAmount > 0) {
                    this.shakeAmount -= dt * 25;
                    if (this.shakeAmount < 0) this.shakeAmount = 0;
                }
            },
            shake(amount) {
                this.shakeAmount = Math.max(this.shakeAmount, amount);
            },
            apply() {
                ctx.translate(-this.x, -this.y);
                if (this.shakeAmount > 0) {
                    const sx = (Math.random() - 0.5) * this.shakeAmount;
                    const sy = (Math.random() - 0.5) * this.shakeAmount;
                    ctx.translate(sx, sy);
                }
            }
        };

        function initLevel() {
            score = 0;
            hudStatus.innerText = "Score: " + score;
            particles = [];
            trails = [];
            
            player = {
                x: config.player.startX, y: config.player.startY, 
                width: config.player.width, height: config.player.height,
                vx: 0, vy: 0, 
                isGrounded: false,
                coyoteTime: 0,
                scaleX: 1, scaleY: 1,
                animTimer: 0,
                color: config.colors.player
            };
            
            platforms = config.entities.platforms.map(p => ({...p}));
            enemies = config.entities.enemies.map(e => ({...e, vx: e.speedX, vy: e.speedY, originalY: e.y}));
            collectibles = config.entities.collectibles.map(c => ({...c, collected: false, floatOffset: Math.random() * 100}));
            portal = {...config.entities.portal};
            
            Camera.x = player.x + player.width/2 - width/2;
            Camera.y = player.y + player.height/2 - height/2;
        }

        function emitParticles(x, y, color, count, speed = 2, sizeRange = 4) {
            for(let i=0; i<count; i++) {
                particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * speed * 200,
                    vy: (Math.random() - 0.5) * speed * 200,
                    life: 1.0,
                    color: color,
                    size: Math.random() * sizeRange + 2
                });
            }
        }

        function checkAABB(a, b) {
            return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
        }

        function updatePhysics(dt) {
            if (dt > 0.1) dt = 0.1; // Cap dt to prevent massive jumps
            
            // Animation & Timers
            player.animTimer += dt;
            player.scaleX += (1 - player.scaleX) * 15 * dt;
            player.scaleY += (1 - player.scaleY) * 15 * dt;
            
            if (player.isGrounded) {
                player.coyoteTime = 0.15;
            } else {
                player.coyoteTime -= dt;
            }
            
            // Trails
            if (Math.abs(player.vx) > 100 || Math.abs(player.vy) > 300) {
                trails.push({ x: player.x, y: player.y, w: player.width, h: player.height, life: 1, sx: player.scaleX, sy: player.scaleY });
            }

            // Player input
            let moveDirX = 0;
            let moveDirY = 0;
            if (Input.isLeft()) moveDirX -= 1;
            if (Input.isRight()) moveDirX += 1;
            
            const accel = player.isGrounded ? 150 : 80; // Air control
            
            if (config.isTopDown) {
                if (Input.isUp()) moveDirY -= 1;
                if (Input.isDownDir()) moveDirY += 1;
                
                if (moveDirX !== 0 && moveDirY !== 0) {
                    const len = Math.sqrt(moveDirX*moveDirX + moveDirY*moveDirY);
                    moveDirX /= len;
                    moveDirY /= len;
                }
                
                player.vx += moveDirX * config.moveSpeed * accel * dt;
                player.vy += moveDirY * config.moveSpeed * accel * dt;
            } else {
                player.vx += moveDirX * config.moveSpeed * accel * dt;
                player.vy += config.gravity * 800 * dt;
                
                // Jump with Coyote Time & Jump Buffering
                if (Input.consumeJumpBuffer() && player.coyoteTime > 0) {
                    player.vy = -config.jumpForce * 40; 
                    player.isGrounded = false;
                    player.coyoteTime = 0;
                    player.scaleX = 0.5;
                    player.scaleY = 1.5;
                    emitParticles(player.x + player.width/2, player.y + player.height, "#fff", 15, 0.5);
                }
                
                // Variable jump height
                if (!Input.isJump() && player.vy < -100) {
                    player.vy *= Math.pow(0.5, dt * 60);
                }
            }

            // Friction / Drag
            const groundFriction = config.isTopDown ? config.friction : (player.isGrounded ? config.friction : config.friction * 1.2);
            const drag = Math.pow(groundFriction, dt * 60);
            player.vx *= drag;
            if (config.isTopDown) player.vy *= drag;

            // Max speed clamp
            const maxSpeedX = config.moveSpeed * 60;
            if (Math.abs(player.vx) > maxSpeedX) player.vx = Math.sign(player.vx) * maxSpeedX;
            if (config.isTopDown) {
                if (Math.abs(player.vy) > maxSpeedX) player.vy = Math.sign(player.vy) * maxSpeedX;
            } else {
                if (player.vy > 1200) player.vy = 1200; // Terminal velocity
            }

            // X Collisions
            player.x += player.vx * dt;
            for (let p of platforms) {
                if (checkAABB(player, p)) {
                    if (player.vx > 0) { player.x = p.x - player.width; player.vx = 0; }
                    else if (player.vx < 0) { player.x = p.x + p.width; player.vx = 0; }
                }
            }

            // Y Collisions
            player.y += player.vy * dt;
            player.isGrounded = false;
            for (let p of platforms) {
                if (checkAABB(player, p)) {
                    if (player.vy > 0) { 
                        player.y = p.y - player.height; 
                        if (!player.isGrounded && player.vy > 200) {
                            player.scaleX = 1.5;
                            player.scaleY = 0.5;
                            Camera.shake(Math.min(player.vy * 0.01, 10));
                            emitParticles(player.x + player.width/2, player.y + player.height, "#ccc", 10, 0.4);
                        }
                        player.vy = 0; 
                        player.isGrounded = true; 
                    }
                    else if (player.vy < 0) { 
                        player.y = p.y + p.height; 
                        player.vy = 0; 
                        emitParticles(player.x + player.width/2, player.y, "#fff", 5, 0.2);
                    }
                }
            }
            
            // Bounds
            if (player.x < 0) { player.x = 0; player.vx = 0; }
            if (player.x > config.world.width - player.width) { player.x = config.world.width - player.width; player.vx = 0; }
            if (player.y < 0) { player.y = 0; player.vy = 0; }
            if (player.y > config.world.height * 1.5) {
                gameOver(false, "You fell out of the world.");
                return;
            }

            // Enemies (floating + patrol)
            for (let e of enemies) {
                e.x += e.vx * dt * 50;
                if (!config.isTopDown) {
                    e.y = e.originalY + Math.sin(performance.now() / 300 + e.x) * 15;
                } else {
                    e.y += e.vy * dt * 50;
                }
                
                for (let p of platforms) {
                    if (checkAABB(e, p)) {
                        if (e.vx > 0) { e.x = p.x - e.width; e.vx *= -1; }
                        else if (e.vx < 0) { e.x = p.x + p.width; e.vx *= -1; }
                    }
                }
                
                if (checkAABB(player, e)) {
                    // Simple bounce on top
                    if (!config.isTopDown && player.vy > 0 && player.y + player.height - 10 <= e.y) {
                        player.vy = -config.jumpForce * 35;
                        emitParticles(e.x + e.width/2, e.y + e.height/2, config.colors.enemy, 30, 2);
                        e.x = -9999; // "kill"
                        score += 50;
                        hudStatus.innerText = "Score: " + score;
                        Camera.shake(8);
                    } else {
                        emitParticles(player.x + player.width/2, player.y + player.height/2, "#ef4444", 50, 4);
                        Camera.shake(20);
                        gameOver(false, "You were defeated.");
                        return;
                    }
                }
            }

            // Collectibles
            for (let c of collectibles) {
                if (!c.collected && checkAABB(player, c)) {
                    c.collected = true;
                    window.emitEvent("ITEM_COLLECTED", { id: Math.random() });
                    emitParticles(c.x + c.width/2, c.y + c.height/2, config.colors.collectible, 30, 1.5);
                    score += 10;
                    hudStatus.innerText = "Score: " + score;
                    Camera.shake(3);
                    player.scaleX = 1.4;
                    player.scaleY = 1.4;
                }
            }

            // Portal
            if (checkAABB(player, portal)) {
                emitParticles(player.x + player.width/2, player.y + player.height/2, "#4ade80", 150, 5);
                Camera.shake(10);
                gameOver(true, "Goal Reached!");
                return;
            }

            // Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt * 1.5;
                if (p.life <= 0) particles.splice(i, 1);
            }
            
            // Trails
            for (let i = trails.length - 1; i >= 0; i--) {
                let t = trails[i];
                t.life -= dt * 4;
                if (t.life <= 0) trails.splice(i, 1);
            }

            Camera.follow(player, dt);
        }

        function drawProceduralRect(x, y, w, h, color, glowColor, rx = 4) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = color;
            
            // Rounded rect
            ctx.beginPath();
            ctx.moveTo(x + rx, y);
            ctx.lineTo(x + w - rx, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
            ctx.lineTo(x + w, y + h - rx);
            ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
            ctx.lineTo(x + rx, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - rx);
            ctx.lineTo(x, y + rx);
            ctx.quadraticCurveTo(x, y, x + rx, y);
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowBlur = 0;
            // Inner highlight
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.beginPath();
            ctx.moveTo(x + rx, y);
            ctx.lineTo(x + w - rx, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
            ctx.lineTo(x + w, y + h/3);
            ctx.lineTo(x, y + h/3);
            ctx.lineTo(x, y + rx);
            ctx.quadraticCurveTo(x, y, x + rx, y);
            ctx.closePath();
            ctx.fill();
        }

        function drawPlayer(x, y, w, h, sx, sy) {
            ctx.save();
            ctx.translate(x + w/2, y + h); // Pivot bottom center
            ctx.scale(sx, sy);
            
            // Outer Aura
            ctx.fillStyle = config.colors.player;
            ctx.shadowColor = config.colors.player;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, -h/2, w/1.5, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Core Geometry
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.roundRect(-w/2, -h, w, h, 6);
            ctx.fill();
            
            // Inner Core Details
            ctx.fillStyle = config.colors.player;
            ctx.beginPath();
            ctx.roundRect(-w/2 + 3, -h + 3, w - 6, h - 6, 4);
            ctx.fill();
            
            // Eyes / Direction
            const dirX = player.vx > 0.1 ? 1 : (player.vx < -0.1 ? -1 : 0);
            ctx.fillStyle = "#fff";
            if (dirX !== 0) {
                ctx.fillRect(dirX * (w/4) - 2, -h + 8, 5, 5);
                ctx.fillRect(dirX * (w/4) + (dirX*8) - 2, -h + 8, 5, 5);
            } else {
                ctx.fillRect(-6, -h + 8, 4, 4);
                ctx.fillRect(2, -h + 8, 4, 4);
            }
            
            ctx.restore();
        }

        function draw(time) {
            // Background
            ctx.fillStyle = config.colors.bg;
            ctx.fillRect(0, 0, width, height);
            
            // Parallax Background Grid
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.03)";
            ctx.lineWidth = 1;
            const gridSize = 100;
            const offsetX = -Camera.x * 0.2 % gridSize;
            const offsetY = -Camera.y * 0.2 % gridSize;
            ctx.beginPath();
            for(let x = offsetX - gridSize; x < width; x += gridSize) {
                ctx.moveTo(x, 0); ctx.lineTo(x, height);
            }
            for(let y = offsetY - gridSize; y < height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(width, y);
            }
            ctx.stroke();
            
            // Far Parallax Particles
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            for(let i=0; i<30; i++) {
                const px = ((i * 314 + -Camera.x * 0.1) % width + width) % width;
                const py = ((i * 271 + -Camera.y * 0.1) % height + height) % height;
                ctx.beginPath();
                ctx.arc(px, py, (i%3)+1, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();

            ctx.save();
            Camera.apply();

            // Trails
            ctx.globalCompositeOperation = "screen";
            for (let t of trails) {
                ctx.save();
                ctx.translate(t.x + t.w/2, t.y + t.h);
                ctx.scale(t.sx, t.sy);
                ctx.globalAlpha = t.life * 0.4;
                ctx.fillStyle = config.colors.player;
                ctx.beginPath();
                ctx.roundRect(-t.w/2, -t.h, t.w, t.h, 6);
                ctx.fill();
                ctx.restore();
            }
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = "source-over";

            // Portal
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = "rgba(74, 222, 128, 0.15)";
            ctx.beginPath();
            ctx.arc(portal.x + portal.width/2, portal.y + portal.height/2, 60 + Math.sin(time/200)*15, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#4ade80";
            ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
            ctx.fillStyle = "#fff";
            ctx.fillRect(portal.x + 10, portal.y + 10, portal.width - 20, portal.height - 20);
            ctx.globalCompositeOperation = "source-over";

            // Platforms
            for (let p of platforms) {
                drawProceduralRect(p.x, p.y, p.width, p.height, config.colors.platform, "rgba(0,0,0,0.8)", 8);
                // Deco line
                ctx.fillStyle = "rgba(255,255,255,0.08)";
                ctx.fillRect(p.x + 10, p.y + p.height/2 - 2, p.width - 20, 4);
            }

            // Collectibles
            for (let c of collectibles) {
                if (!c.collected) {
                    ctx.save();
                    const cy = c.y + Math.sin(time/250 + c.floatOffset)*8;
                    ctx.translate(c.x + c.width/2, cy + c.height/2);
                    ctx.rotate(time / 500);
                    const scale = 1 + Math.sin(time/150 + c.x)*0.15;
                    ctx.scale(scale, scale);
                    
                    ctx.fillStyle = config.colors.collectible;
                    ctx.shadowColor = config.colors.collectible;
                    ctx.shadowBlur = 20;
                    
                    // Diamond shape
                    ctx.beginPath();
                    ctx.moveTo(0, -c.height);
                    ctx.lineTo(c.width, 0);
                    ctx.lineTo(0, c.height);
                    ctx.lineTo(-c.width, 0);
                    ctx.fill();
                    
                    ctx.fillStyle = "#fff";
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(0, -c.height/2);
                    ctx.lineTo(c.width/2, 0);
                    ctx.lineTo(0, c.height/2);
                    ctx.lineTo(-c.width/2, 0);
                    ctx.fill();
                    ctx.restore();
                }
            }

            // Enemies
            for (let e of enemies) {
                ctx.save();
                ctx.translate(e.x + e.width/2, e.y + e.height/2);
                
                ctx.fillStyle = config.colors.enemy;
                ctx.shadowColor = config.colors.enemy;
                ctx.shadowBlur = 20;
                
                // Spike polygon
                const sides = 6;
                const r = e.width/2 + Math.sin(time/100 + e.x)*3;
                ctx.beginPath();
                for(let i=0; i<sides; i++) {
                    const angle = i * Math.PI * 2 / sides + time/400;
                    const vx = Math.cos(angle) * r;
                    const vy = Math.sin(angle) * r;
                    if(i===0) ctx.moveTo(vx, vy);
                    else ctx.lineTo(vx, vy);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = "#fff";
                ctx.shadowBlur = 0;
                const core = 8 + Math.sin(time/80)*2;
                ctx.beginPath();
                ctx.arc(0, 0, core, 0, Math.PI*2);
                ctx.fill();
                
                ctx.restore();
            }

            // Player
            if (gameState === "PLAYING" || gameState === "PAUSED") {
                drawPlayer(player.x, player.y, player.width, player.height, player.scaleX, player.scaleY);
            }

            // Particles
            ctx.globalCompositeOperation = "screen";
            for (let p of particles) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = "source-over";

            ctx.restore();
            
            // Vignette overlay
            const grad = ctx.createRadialGradient(width/2, height/2, height/2, width/2, height/2, height);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.7)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        let lastTime = performance.now();
        function gameLoop(timestamp) {
            const dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            
            Input.update(dt);

            if (gameState === 'PLAYING') {
                updatePhysics(dt);
            }
            
            // Only draw if not fully in menus to save resources, but we draw always to have nice bg
            draw(timestamp);
            
            reqId = requestAnimationFrame(gameLoop);
        }

        function gameOver(win, message) {
            gameState = "GAME_OVER";
            endScreen.style.display = "flex";
            endScreen.style.opacity = '1';
            hudTop.style.opacity = '0';
            
            if (win) {
                endTitle.innerText = "MISSION SUCCESS";
                window.emitEvent("GAME_COMPLETED", { score: score });
                endTitle.className = "win-text";
            } else {
                endTitle.innerText = "CRITICAL FAILURE";
                window.emitEvent("PLAYER_DIED", { score: score });
                endTitle.className = "lose-text";
            }
            endSubtitle.innerText = message;
            endScore.innerText = "Score: " + score;
        }

        // Initially we are on START_SCREEN, do not initLevel immediately so we show default config state
        initLevel();
        requestAnimationFrame(gameLoop);
        
    </script>
</body>
</html>\`;
}
`;

fs.writeFileSync('src/engine/template.ts', code);
console.log("Template upgraded successfully.");
