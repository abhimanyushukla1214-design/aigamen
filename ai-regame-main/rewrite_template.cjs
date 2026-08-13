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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>\${def.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        
        :root {
            --bg-color: \${bgColor};
            --player-color: \${playerColor};
            --enemy-color: \${enemyColor};
            --platform-color: \${platformColor};
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --panel-bg: rgba(15, 23, 42, 0.75);
            --panel-border: rgba(255, 255, 255, 0.15);
            --glow-spread: 0 0 20px rgba(255, 255, 255, 0.2);
        }
        
        * { box-sizing: border-box; }
        
        body, html { 
            margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; 
            background-color: var(--bg-color); font-family: 'Rajdhani', sans-serif; 
            color: var(--text-primary); user-select: none; -webkit-user-select: none;
        }
        
        canvas { 
            display: block; width: 100%; height: 100%; position: absolute; 
            top: 0; left: 0; z-index: 1; 
        }
        
        #ui-layer { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            pointer-events: none; z-index: 10; display: flex; flex-direction: column; 
            justify-content: space-between;
        }
        
        .hud-container {
            display: flex; justify-content: space-between; align-items: flex-start;
            padding: max(20px, env(safe-area-inset-top)) max(30px, env(safe-area-inset-right)) 20px max(30px, env(safe-area-inset-left));
            opacity: 0; transition: opacity 0.5s ease;
        }
        
        .hud-left, .hud-center, .hud-right { display: flex; flex-direction: column; gap: 10px; pointer-events: auto; }
        
        .status-bar {
            width: 200px; height: 8px; background: rgba(0,0,0,0.5); 
            border-radius: 4px; overflow: hidden; border: 1px solid var(--panel-border);
            position: relative;
        }
        
        .hp-fill { height: 100%; background: #4ade80; width: 100%; transition: width 0.2s; box-shadow: 0 0 10px #4ade80; }
        .energy-fill { height: 100%; background: var(--player-color); width: 100%; box-shadow: 0 0 10px var(--player-color); }
        
        .hud-label { font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--text-secondary); margin-bottom: -6px; text-transform: uppercase; }
        
        .objective-panel {
            background: var(--panel-bg); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            padding: 12px 30px; border-radius: 30px; border: 1px solid var(--panel-border);
            text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: pulse-border 4s infinite alternate;
        }
        
        @keyframes pulse-border {
            0% { border-color: rgba(255,255,255,0.1); }
            100% { border-color: rgba(255,255,255,0.3); }
        }
        
        .objective-title { font-size: 10px; letter-spacing: 3px; color: var(--player-color); font-weight: 700; margin-bottom: 2px; }
        .objective-text { font-size: 16px; font-weight: 500; letter-spacing: 1px; }
        
        .hud-icon-btn {
            background: var(--panel-bg); border: 1px solid var(--panel-border);
            width: 44px; height: 44px; border-radius: 50%; display: flex;
            align-items: center; justify-content: center; cursor: pointer;
            backdrop-filter: blur(5px); color: white; transition: all 0.2s;
        }
        
        .hud-icon-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }
        
        /* Overlays */
        .screen-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(5, 8, 15, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            z-index: 50; display: none; flex-direction: column; align-items: center; justify-content: center;
            pointer-events: auto; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .screen-overlay.active { display: flex; opacity: 1; }
        
        .glass-panel {
            background: linear-gradient(135deg, rgba(25, 33, 50, 0.7) 0%, rgba(10, 15, 25, 0.9) 100%);
            border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding: 50px; border-radius: 16px; text-align: center; max-width: 600px; width: 90%;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
            transform: translateY(20px); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .screen-overlay.active .glass-panel { transform: translateY(0); }
        
        .game-title {
            margin: 0 0 10px 0; font-size: 36px; font-weight: 700; letter-spacing: 6px;
            text-transform: uppercase; color: #fff; text-shadow: 0 0 20px var(--player-color);
            background: linear-gradient(to right, #fff, var(--player-color));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        
        .mission-subtitle { font-size: 14px; letter-spacing: 4px; color: var(--player-color); font-weight: 600; margin-bottom: 30px; }
        
        .briefing-text { color: var(--text-secondary); font-size: 16px; line-height: 1.6; margin-bottom: 40px; text-align: left; }
        
        .controls-section { background: rgba(0,0,0,0.4); border-radius: 8px; padding: 20px; margin-bottom: 40px; text-align: left; border: 1px solid rgba(255,255,255,0.05); }
        .controls-title { font-size: 12px; letter-spacing: 2px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 700; }
        
        .control-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 10px; }
        .control-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        
        .key-badge {
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
            padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 14px; font-weight: bold;
            box-shadow: 0 4px 0 rgba(0,0,0,0.3); transform: translateY(-2px);
        }
        
        .btn-group { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        
        .cyber-btn {
            background: transparent; color: white; border: 1px solid var(--panel-border);
            padding: 16px 36px; font-size: 14px; font-family: 'Rajdhani', sans-serif; font-weight: 700;
            text-transform: uppercase; letter-spacing: 3px; cursor: pointer; border-radius: 4px;
            transition: all 0.2s; position: relative; overflow: hidden;
        }
        
        .cyber-btn::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.4s;
        }
        
        .cyber-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.3); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .cyber-btn:hover::before { left: 100%; }
        
        .cyber-btn.primary { background: var(--player-color); border-color: var(--player-color); color: #000; box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
        .cyber-btn.primary:hover { background: #fff; border-color: #fff; box-shadow: 0 0 30px rgba(255, 255, 255, 0.6); }
        
        .status-title { font-size: 42px; font-weight: 700; letter-spacing: 8px; margin: 0 0 10px 0; text-transform: uppercase; }
        .status-title.victory { color: #4ade80; text-shadow: 0 0 30px rgba(74, 222, 128, 0.5); }
        .status-title.defeat { color: #ef4444; text-shadow: 0 0 30px rgba(239, 68, 68, 0.5); }
        
        /* Mobile Controls */
        #mobile-controls { display: none; position: absolute; bottom: 30px; left: 0; width: 100%; padding: 0 30px; justify-content: space-between; pointer-events: none; z-index: 20; }
        @media (hover: none) and (pointer: coarse) {
            #mobile-controls { display: flex; }
            .controls-section { display: none; }
        }
        
        .joystick-base { width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); position: relative; pointer-events: auto; }
        .joystick-stick { width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 50%; position: absolute; top: 35px; left: 35px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
        
        .action-pad { display: flex; gap: 15px; align-items: flex-end; }
        .mob-btn { width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); color: white; font-weight: bold; font-family: 'Rajdhani', sans-serif; pointer-events: auto; display: flex; justify-content: center; align-items: center; font-size: 16px; user-select: none; }
        .mob-btn:active { background: rgba(255,255,255,0.3); transform: scale(0.95); }
        
        .cinematic-bars { position: absolute; width: 100%; height: 0; background: #000; z-index: 5; transition: height 0.5s ease; }
        .cinematic-top { top: 0; }
        .cinematic-bottom { bottom: 0; }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    
    <div class="cinematic-bars cinematic-top" id="cine-top"></div>
    <div class="cinematic-bars cinematic-bottom" id="cine-bot"></div>
    
    <div id="ui-layer">
        <div class="hud-container" id="hud">
            <div class="hud-left">
                <div>
                    <div class="hud-label">Integrity</div>
                    <div class="status-bar"><div class="hp-fill" id="hp-bar"></div></div>
                </div>
                <div>
                    <div class="hud-label">Energy</div>
                    <div class="status-bar"><div class="energy-fill" style="width:100%"></div></div>
                </div>
            </div>
            
            <div class="hud-center">
                <div class="objective-panel">
                    <div class="objective-title">CURRENT DIRECTIVE</div>
                    <div class="objective-text">\${def.winCondition}</div>
                </div>
            </div>
            
            <div class="hud-right">
                <button class="hud-icon-btn" onclick="Game.pause()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
            </div>
        </div>
        
        <div id="mobile-controls">
            <div class="joystick-base" id="joystick">
                <div class="joystick-stick" id="stick"></div>
            </div>
            <div class="action-pad">
                <div class="mob-btn" id="btn-jump">JUMP</div>
            </div>
        </div>
    </div>

    <!-- Briefing Screen -->
    <div id="screen-briefing" class="screen-overlay active">
        <div class="glass-panel">
            <div class="mission-subtitle">NEXUS SIMULATION</div>
            <h1 class="game-title">\${def.title}</h1>
            
            <div class="briefing-text">
                Initializing environment protocol...<br><br>
                Target location confirmed. Environmental hazards detected. Proceed with caution.
                Complete your directive to successfully extract.
            </div>
            
            <div class="controls-section">
                <div class="controls-title">SYSTEM CONTROLS</div>
                \${def.controls.map((c: any) => \`
                <div class="control-row">
                    <span>\${c.action}</span>
                    <span class="key-badge">\${c.key}</span>
                </div>\`).join('')}
            </div>
            
            <button class="cyber-btn primary" onclick="Game.start()">INITIALIZE SEQUENCE</button>
        </div>
    </div>

    <!-- Pause Screen -->
    <div id="screen-pause" class="screen-overlay">
        <div class="glass-panel">
            <h1 class="game-title">SYSTEM PAUSED</h1>
            <div class="briefing-text" style="text-align: center;">Simulation suspended. Awaiting input.</div>
            
            <div class="btn-group">
                <button class="cyber-btn primary" onclick="Game.resume()">RESUME</button>
                <button class="cyber-btn" onclick="Game.restart()">RESTART</button>
                <button class="cyber-btn" onclick="Game.home()">EXIT TO NEXUS</button>
            </div>
        </div>
    </div>

    <!-- End Screen -->
    <div id="screen-end" class="screen-overlay">
        <div class="glass-panel">
            <h1 id="end-title" class="status-title"></h1>
            <div id="end-desc" class="briefing-text" style="text-align: center; font-size: 18px; margin-bottom: 50px;"></div>
            
            <div class="btn-group">
                <button class="cyber-btn primary" onclick="Game.restart()">DEPLOY AGAIN</button>
                <button class="cyber-btn" onclick="Game.home()">RETURN TO NEXUS</button>
            </div>
        </div>
    </div>

    <script>
        const config = {
            colors: {
                bg: "\${bgColor}",
                player: "\${playerColor}",
                platform: "\${platformColor}",
                enemy: "\${enemyColor}",
                collectible: "\${def.theme.collectible}"
            },
            physics: {
                gravity: \${gravity},
                jump: \${def.physics.jumpForce},
                speed: \${def.physics.movementSpeed},
                friction: \${def.physics.friction}
            },
            world: { w: \${def.world.width}, h: \${def.world.height} }
        };

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        let width, height;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener('resize', resize);
        resize();

        // Game State Manager
        const Game = {
            state: 'BRIEFING', // BRIEFING, PLAYING, PAUSED, END
            lastTime: 0,
            reqId: null,
            score: 0,
            hp: 100,
            
            start() {
                document.getElementById('screen-briefing').classList.remove('active');
                document.getElementById('hud').style.opacity = '1';
                document.getElementById('cine-top').style.height = '0';
                document.getElementById('cine-bot').style.height = '0';
                this.state = 'PLAYING';
                Level.init();
            },
            
            pause() {
                if (this.state !== 'PLAYING') return;
                this.state = 'PAUSED';
                document.getElementById('screen-pause').classList.add('active');
                document.getElementById('hud').style.opacity = '0.3';
            },
            
            resume() {
                this.state = 'PLAYING';
                document.getElementById('screen-pause').classList.remove('active');
                document.getElementById('hud').style.opacity = '1';
                this.lastTime = performance.now();
            },
            
            restart() {
                document.querySelectorAll('.screen-overlay').forEach(el => el.classList.remove('active'));
                document.getElementById('hud').style.opacity = '1';
                this.state = 'PLAYING';
                Level.init();
            },
            
            end(win, msg) {
                this.state = 'END';
                document.getElementById('hud').style.opacity = '0';
                document.getElementById('screen-end').classList.add('active');
                
                const title = document.getElementById('end-title');
                if(win) {
                    title.innerText = "MISSION SUCCESS";
                    title.className = "status-title victory";
                    window.parent.postMessage({ type: 'NEXUS_EVENT', eventType: 'GAME_COMPLETED', data: { score: this.score } }, '*');
                } else {
                    title.innerText = "CRITICAL FAILURE";
                    title.className = "status-title defeat";
                    window.parent.postMessage({ type: 'NEXUS_EVENT', eventType: 'PLAYER_DIED', data: { score: this.score } }, '*');
                }
                document.getElementById('end-desc').innerText = msg;
            },
            
            home() {
                window.parent.postMessage({ type: 'NEXUS_EVENT', eventType: 'RETURN_HOME', data: {} }, '*');
            },
            
            damage(amount) {
                this.hp = Math.max(0, this.hp - amount);
                document.getElementById('hp-bar').style.width = this.hp + '%';
                Camera.shake(10);
                if(this.hp <= 0) this.end(false, "Vitals depleted.");
            }
        };
        
        window.Game = Game; // Expose for UI buttons

        // Input
        const Input = {
            keys: {}, axes: { x: 0, y: 0 },
            init() {
                window.addEventListener('keydown', e => this.keys[e.code] = true);
                window.addEventListener('keyup', e => this.keys[e.code] = false);
            },
            update() {
                this.axes.x = (this.keys['ArrowRight'] || this.keys['KeyD'] ? 1 : 0) - (this.keys['ArrowLeft'] || this.keys['KeyA'] ? 1 : 0);
                this.axes.y = (this.keys['ArrowDown'] || this.keys['KeyS'] ? 1 : 0) - (this.keys['ArrowUp'] || this.keys['KeyW'] ? 1 : 0);
            }
        };
        Input.init();

        // Advanced Camera
        const Camera = {
            x: 0, y: 0, targetX: 0, targetY: 0, shakeIntensity: 0, zoom: 1,
            update(dt, target) {
                this.targetX = target.x + target.w/2 - width/2;
                this.targetY = target.y + target.h/2 - height/2 + 100;
                
                // Boundaries
                this.targetX = Math.max(0, Math.min(this.targetX, config.world.w - width));
                this.targetY = Math.max(0, Math.min(this.targetY, config.world.h - height));
                
                // Lerp
                this.x += (this.targetX - this.x) * 5 * dt;
                this.y += (this.targetY - this.y) * 5 * dt;
                
                if (this.shakeIntensity > 0) {
                    this.x += (Math.random()-0.5) * this.shakeIntensity;
                    this.y += (Math.random()-0.5) * this.shakeIntensity;
                    this.shakeIntensity = Math.max(0, this.shakeIntensity - 30 * dt);
                }
            },
            shake(amt) { this.shakeIntensity = amt; },
            apply() {
                ctx.translate(-this.x, -this.y);
            }
        };

        // Particles
        const Particles = {
            list: [],
            add(x, y, vx, vy, color, life, size) {
                this.list.push({x, y, vx, vy, color, life, maxLife: life, size});
            },
            burst(x, y, count, color) {
                for(let i=0; i<count; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 200 + 50;
                    this.add(x, y, Math.cos(ang)*speed, Math.sin(ang)*speed, color, Math.random()*0.5 + 0.2, Math.random()*4+2);
                }
            },
            update(dt) {
                for(let i = this.list.length-1; i>=0; i--) {
                    let p = this.list[i];
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.life -= dt;
                    if(p.life <= 0) this.list.splice(i, 1);
                }
            },
            draw() {
                ctx.globalCompositeOperation = 'screen';
                for(let p of this.list) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life / p.maxLife;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
            }
        };

        // Player
        const player = {
            x: \${def.player.startX}, y: \${def.player.startY}, w: \${def.player.width}, h: \${def.player.height},
            vx: 0, vy: 0, grounded: false, dir: 1, animTime: 0,
            update(dt) {
                // Acceleration
                if (Input.axes.x !== 0) {
                    this.vx += Input.axes.x * 2000 * dt;
                    this.dir = Input.axes.x > 0 ? 1 : -1;
                    this.animTime += dt * 10;
                    if (this.grounded && Math.random() > 0.8) Particles.add(this.x + this.w/2, this.y + this.h, (Math.random()-0.5)*50, -Math.random()*50, 'rgba(255,255,255,0.5)', 0.3, 3);
                } else {
                    this.animTime = 0;
                }
                
                // Friction / Max Speed
                this.vx *= config.physics.friction;
                const maxSpd = config.physics.speed * 60;
                if (this.vx > maxSpd) this.vx = maxSpd;
                if (this.vx < -maxSpd) this.vx = -maxSpd;
                
                // Gravity & Jump
                \${isTopDown ? \`
                    if (Input.axes.y !== 0) {
                        this.vy += Input.axes.y * 2000 * dt;
                    }
                    this.vy *= config.physics.friction;
                \` : \`
                    this.vy += config.physics.gravity * 1000 * dt;
                    if ((Input.keys['Space'] || Input.keys['ArrowUp']) && this.grounded) {
                        this.vy = -config.physics.jump * 60;
                        this.grounded = false;
                        Particles.burst(this.x + this.w/2, this.y + this.h, 10, 'rgba(255,255,255,0.8)');
                    }
                \`}
                
                // Move X
                this.x += this.vx * dt;
                this.checkCollisions(true);
                // Move Y
                this.y += this.vy * dt;
                this.checkCollisions(false);
                
                // Bounds
                if(this.y > config.world.h + 200) Game.end(false, "\${def.loseCondition}");
            },
            
            checkCollisions(isX) {
                \${!isTopDown ? \`if(!isX) this.grounded = false;\` : ''}
                for(let p of Level.platforms) {
                    if (this.x < p.x + p.w && this.x + this.w > p.x && 
                        this.y < p.y + p.h && this.y + this.h > p.y) {
                        if (isX) {
                            if (this.vx > 0) this.x = p.x - this.w;
                            else this.x = p.x + p.w;
                            this.vx = 0;
                        } else {
                            if (this.vy > 0) { this.y = p.y - this.h; this.grounded = true; }
                            else this.y = p.y + p.h;
                            this.vy = 0;
                        }
                    }
                }
            },
            
            draw() {
                ctx.save();
                ctx.translate(this.x + this.w/2, this.y + this.h);
                ctx.scale(this.dir, 1);
                
                // Procedural Anime Character Rendering
                // Aura
                ctx.globalCompositeOperation = 'screen';
                const auraWave = Math.sin(performance.now()/150)*0.1 + 1;
                ctx.fillStyle = config.colors.player;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.ellipse(0, -this.h/2, this.w*0.8*auraWave, this.h*0.6*auraWave, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
                
                // Bounce animation
                const bounce = this.grounded && Input.axes.x !== 0 ? Math.abs(Math.sin(this.animTime))*4 : 0;
                ctx.translate(0, -bounce);
                
                // Body
                ctx.fillStyle = '#1e293b'; // dark suit
                ctx.beginPath();
                ctx.roundRect(-this.w/2, -this.h, this.w, this.h-10, 4);
                ctx.fill();
                
                // Highlights
                ctx.fillStyle = config.colors.player;
                ctx.fillRect(-this.w/2 + 2, -this.h + 2, this.w - 4, 4); // shoulders
                
                // Head
                ctx.fillStyle = '#f8fafc'; // pale skin/helmet
                ctx.beginPath();
                ctx.arc(0, -this.h - 5, 12, 0, Math.PI*2);
                ctx.fill();
                
                // Visor
                ctx.fillStyle = config.colors.player;
                ctx.shadowColor = config.colors.player;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.roundRect(2, -this.h - 8, 12, 6, 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Scarf/Cape
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(-5, -this.h + 5);
                ctx.lineTo(-20 - (this.vx*0.05), -this.h + 15 + Math.sin(performance.now()/100)*5);
                ctx.lineTo(-5, -this.h + 10);
                ctx.fill();
                
                // Legs
                const legSwing = this.grounded && Input.axes.x !== 0 ? Math.sin(this.animTime)*10 : 0;
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-8 - legSwing/2, -10, 6, 10);
                ctx.fillRect(2 + legSwing/2, -10, 6, 10);
                
                ctx.restore();
            }
        };

        // Level Data
        const Level = {
            platforms: [], enemies: [], items: [], portal: null,
            init() {
                this.platforms = \${JSON.stringify(def.entities.platforms)}.map(p => ({x:p.x, y:p.y, w:p.width, h:p.height}));
                this.enemies = \${JSON.stringify(def.entities.enemies)}.map(e => ({x:e.x, y:e.y, w:e.width, h:e.height, vx:e.speedX*60, vy:e.speedY*60, startX:e.x}));
                this.items = \${JSON.stringify(def.entities.collectibles)}.map(c => ({x:c.x, y:c.y, w:c.width, h:c.height, active:true}));
                const pt = \${JSON.stringify(def.entities.portal)};
                this.portal = {x:pt.x, y:pt.y, w:pt.width, h:pt.height};
                
                player.x = \${def.player.startX};
                player.y = \${def.player.startY};
                player.vx = 0; player.vy = 0;
                Game.hp = 100;
                Game.score = 0;
                document.getElementById('hp-bar').style.width = '100%';
                Camera.x = player.x - width/2;
                Camera.y = player.y - height/2;
            },
            
            update(dt) {
                // Enemies
                for(let e of this.enemies) {
                    e.x += e.vx * dt;
                    if(Math.abs(e.x - e.startX) > 150) e.vx *= -1;
                    
                    // Collision with player
                    if (player.x < e.x + e.w && player.x + player.w > e.x && 
                        player.y < e.y + e.h && player.y + player.h > e.y) {
                        // Simple bounce and damage
                        if(player.vy > 0 && player.y + player.h < e.y + e.h/2) {
                            // Player stomped enemy
                            player.vy = -config.physics.jump * 40;
                            Particles.burst(e.x+e.w/2, e.y+e.h/2, 20, config.colors.enemy);
                            e.x = -9999; // kill
                        } else {
                            // Player took damage
                            Game.damage(20);
                            player.vx = player.x < e.x ? -500 : 500;
                            player.vy = -300;
                            Particles.burst(player.x+player.w/2, player.y+player.h/2, 10, '#ef4444');
                        }
                    }
                }
                
                // Collectibles
                for(let i of this.items) {
                    if(i.active && player.x < i.x + i.w && player.x + player.w > i.x && 
                       player.y < i.y + i.h && player.y + player.h > i.y) {
                        i.active = false;
                        Game.score++;
                        Particles.burst(i.x+i.w/2, i.y+i.h/2, 15, config.colors.collectible);
                    }
                }
                
                // Portal
                if(this.portal) {
                    let p = this.portal;
                    if(player.x < p.x + p.w && player.x + player.w > p.x && 
                       player.y < p.y + p.h && player.y + player.h > p.y) {
                        Game.end(true, "\${def.winCondition} accomplished.");
                    }
                }
            },
            
            draw(time) {
                // Background Parallax
                ctx.save();
                ctx.fillStyle = config.colors.bg;
                ctx.fillRect(0, 0, width, height);
                
                // Deep Parallax Grid
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const offX = -(Camera.x * 0.1) % 100;
                const offY = -(Camera.y * 0.1) % 100;
                for(let x=offX-100; x<width; x+=100) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
                for(let y=offY-100; y<height; y+=100) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
                ctx.stroke();
                ctx.restore();
                
                ctx.save();
                Camera.apply();
                
                // Platforms (Sci-fi style)
                for(let p of this.platforms) {
                    ctx.fillStyle = config.colors.platform;
                    ctx.beginPath();
                    ctx.roundRect(p.x, p.y, p.w, p.h, 4);
                    ctx.fill();
                    // Top highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(p.x, p.y, p.w, 4);
                    // Tech lines
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    for(let lx = p.x+20; lx < p.x+p.w-20; lx+=40) {
                        ctx.fillRect(lx, p.y+10, 4, p.h-20);
                    }
                }
                
                // Items
                for(let i of this.items) {
                    if(!i.active) continue;
                    ctx.save();
                    ctx.translate(i.x + i.w/2, i.y + i.h/2 + Math.sin(time/200)*5);
                    ctx.rotate(time/500);
                    ctx.fillStyle = config.colors.collectible;
                    ctx.shadowColor = config.colors.collectible;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0);
                    ctx.fill();
                    ctx.restore();
                }
                
                // Portal
                if(this.portal) {
                    let p = this.portal;
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
                    ctx.beginPath();
                    ctx.arc(p.x+p.w/2, p.y+p.h/2, 50 + Math.sin(time/150)*10, 0, Math.PI*2);
                    ctx.fill();
                    
                    ctx.strokeStyle = '#4ade80';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.roundRect(p.x, p.y, p.w, p.h, 8);
                    ctx.stroke();
                    ctx.globalCompositeOperation = 'source-over';
                }
                
                // Enemies
                for(let e of this.enemies) {
                    if(e.x < -1000) continue;
                    ctx.save();
                    ctx.translate(e.x + e.w/2, e.y + e.h/2);
                    ctx.fillStyle = config.colors.enemy;
                    ctx.shadowColor = config.colors.enemy;
                    ctx.shadowBlur = 20;
                    
                    ctx.beginPath();
                    for(let i=0; i<3; i++) {
                        let ang = i * Math.PI*2/3 + time/200;
                        let px = Math.cos(ang)*e.w/1.5;
                        let py = Math.sin(ang)*e.h/1.5;
                        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
                    }
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.fillStyle = '#fff';
                    ctx.shadowBlur = 0;
                    ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
                    ctx.restore();
                }
                
                ctx.restore();
            }
        };

        // Main Loop
        function gameLoop(time) {
            const dt = Math.min((time - Game.lastTime) / 1000, 0.1); // clamp dt
            Game.lastTime = time;
            
            if (Game.state === 'PLAYING') {
                Input.update();
                player.update(dt);
                Level.update(dt);
                Particles.update(dt);
                Camera.update(dt, player);
            }
            
            // Render
            Level.draw(time);
            
            ctx.save();
            Camera.apply();
            if(Game.state !== 'END') player.draw();
            Particles.draw();
            ctx.restore();
            
            // Atmospheric Vignette Overlay
            const grad = ctx.createRadialGradient(width/2, height/2, height*0.3, width/2, height/2, height);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(5,8,15,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,width,height);
            
            Game.reqId = requestAnimationFrame(gameLoop);
        }
        
        Game.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
        
        // Expose to window for testing
        window.Level = Level;
    </script>
</body>
</html>\`;
}
`;

fs.writeFileSync('src/engine/template.ts', code);
