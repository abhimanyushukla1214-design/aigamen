const fs = require('fs');

const code = `
import { PlayableGameDefinition } from '../types/gameBuilder.js';

export function generateGameHTML(def: PlayableGameDefinition): string {
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
        }

        body, html {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            background-color: var(--bg-color);
            overflow: hidden;
            font-family: 'Rajdhani', sans-serif;
            touch-action: none;
        }
        
        #gameCanvas {
            width: 100%; height: 100%;
            display: block;
        }

        #ui-layer {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px;
            box-sizing: border-box;
        }

        .hud-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .health-bar-container {
            width: 200px;
            height: 12px;
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            overflow: hidden;
        }

        #hp-bar {
            width: 100%; height: 100%;
            background: var(--player-color);
            transition: width 0.2s;
        }
        
        #score-display {
            font-size: 24px;
            color: white;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        
        #title-display {
            font-size: 18px;
            color: rgba(255,255,255,0.7);
        }

        #overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            pointer-events: auto;
        }
        
        #overlay h1 { font-size: 48px; margin-bottom: 10px; text-transform: uppercase; }
        #overlay p { font-size: 24px; margin-bottom: 30px; opacity: 0.8; }
        
        button {
            padding: 12px 32px;
            font-size: 20px;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
            background: transparent;
            color: white;
            border: 2px solid var(--player-color);
            border-radius: 8px;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.2s;
        }
        button:hover {
            background: var(--player-color);
            color: black;
        }

        /* Mobile Controls */
        #mobile-controls {
            display: none;
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            pointer-events: auto;
        }
        
        @media (max-width: 768px) {
            #mobile-controls { display: flex; justify-content: space-between; }
        }

        .d-pad, .action-pad { display: flex; gap: 10px; }
        .btn {
            width: 60px; height: 60px;
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; user-select: none;
        }
        .btn:active { background: rgba(255,255,255,0.3); }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    
    <div id="ui-layer">
        <div class="hud-top">
            <div>
                <div id="title-display">\${def.title}</div>
                <div class="health-bar-container"><div id="hp-bar"></div></div>
                <div style="font-size: 14px; margin-top: 5px; color: rgba(255,255,255,0.5);">\${def.winCondition}</div>
            </div>
            <div id="score-display">0</div>
        </div>
        
        <div id="mobile-controls">
            <div class="d-pad">
                <div class="btn" id="btn-left">←</div>
                <div class="btn" id="btn-right">→</div>
            </div>
            <div class="action-pad">
                <div class="btn" id="btn-up">↑</div>
                <div class="btn" id="btn-down">↓</div>
            </div>
        </div>
    </div>
    
    <div id="overlay">
        <h1 id="overlay-title">GAME OVER</h1>
        <p id="overlay-desc">You died.</p>
        <button onclick="location.reload()">RESTART</button>
    </div>

    <script>
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

        // Game Configuration injected from definition
        const config = {
            gameType: "\${def.gameType}",
            colors: {
                bg: "\${bgColor}",
                player: "\${playerColor}",
                platform: "\${platformColor}",
                enemy: "\${enemyColor}",
                collectible: "\${def.theme.collectible}",
                particle: "\${def.theme.particle}"
            },
            physics: {
                gravity: \${def.physics.gravity},
                jump: \${def.physics.jumpForce},
                speed: \${def.physics.movementSpeed},
                friction: \${def.physics.friction}
            },
            playerShape: "\${def.player.shape}",
            cameraFollow: "\${def.cameraFollow}"
        };

        // Engine State
        const Game = {
            state: 'PLAYING',
            score: 0,
            hp: 100,
            lastTime: 0,
            reqId: null,
            end(win, msg) {
                this.state = 'END';
                document.getElementById('overlay').style.display = 'flex';
                document.getElementById('overlay-title').innerText = win ? 'VICTORY' : 'GAME OVER';
                document.getElementById('overlay-title').style.color = win ? '#4ade80' : '#ef4444';
                document.getElementById('overlay-desc').innerText = msg;
            },
            damage(amt) {
                this.hp = Math.max(0, this.hp - amt);
                document.getElementById('hp-bar').style.width = this.hp + '%';
                if(this.hp <= 0) this.end(false, "\${def.loseCondition}");
            }
        };

        // Input
        const keys = {};
        window.addEventListener('keydown', e => keys[e.code] = true);
        window.addEventListener('keyup', e => keys[e.code] = false);
        
        // Touch controls
        const btnMap = { 'btn-left':'ArrowLeft', 'btn-right':'ArrowRight', 'btn-up':'Space', 'btn-down':'ArrowDown' };
        for(let id in btnMap) {
            let el = document.getElementById(id);
            if(el) {
                el.addEventListener('touchstart', e => { e.preventDefault(); keys[btnMap[id]] = true; });
                el.addEventListener('touchend', e => { e.preventDefault(); keys[btnMap[id]] = false; });
            }
        }

        const Input = {
            left: () => keys['ArrowLeft'] || keys['KeyA'],
            right: () => keys['ArrowRight'] || keys['KeyD'],
            up: () => keys['ArrowUp'] || keys['KeyW'] || keys['Space'],
            down: () => keys['ArrowDown'] || keys['KeyS'],
            update() {}
        };

        // Camera
        const Camera = {
            x: 0, y: 0, shakeTime: 0,
            update(dt, target) {
                if(config.cameraFollow === 'X' || config.cameraFollow === 'BOTH') {
                    const tx = target.x - width/2 + target.w/2;
                    this.x += (tx - this.x) * 5 * dt;
                }
                if(config.cameraFollow === 'Y' || config.cameraFollow === 'BOTH') {
                    const ty = target.y - height/2 + target.h/2;
                    this.y += (ty - this.y) * 5 * dt;
                }
                if(this.shakeTime > 0) this.shakeTime -= dt;
            },
            apply() {
                let sx = 0, sy = 0;
                if(this.shakeTime > 0) {
                    sx = (Math.random()-0.5)*10;
                    sy = (Math.random()-0.5)*10;
                }
                ctx.translate(-Math.floor(this.x) + sx, -Math.floor(this.y) + sy);
            },
            shake(dur) { this.shakeTime = dur; }
        };

        // Particles
        const Particles = {
            list: [],
            burst(x, y, count, color) {
                for(let i=0; i<count; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const v = Math.random() * 200 + 50;
                    this.list.push({
                        x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v,
                        life: 1, color
                    });
                }
            },
            update(dt) {
                for(let i=this.list.length-1; i>=0; i--) {
                    let p = this.list[i];
                    p.x += p.vx * dt; p.y += p.vy * dt;
                    p.life -= dt * 2;
                    if(config.gameType === 'PLATFORMER') p.vy += config.physics.gravity * 60 * dt;
                    if(p.life <= 0) this.list.splice(i, 1);
                }
            },
            draw() {
                for(let p of this.list) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(0, p.life);
                    ctx.fillRect(p.x, p.y, 4, 4);
                }
                ctx.globalAlpha = 1;
            }
        };

        // Player Entity
        const player = {
            x: \${def.player.startX}, y: \${def.player.startY}, 
            w: \${def.player.width}, h: \${def.player.height},
            vx: 0, vy: 0, grounded: false,
            
            update(dt) {
                // Movement logic based on GameType
                if (config.gameType === 'RACING') {
                    // Auto forward
                    this.vx = config.physics.speed * 60;
                    if(Input.up()) this.vx *= 1.5;
                    if(Input.down()) this.vx *= 0.5;
                    
                    // Steer Y
                    if(Input.left()) this.vy = -config.physics.speed * 40;
                    else if(Input.right()) this.vy = config.physics.speed * 40;
                    else this.vy *= config.physics.friction;
                    
                } else if (config.gameType === 'TOP_DOWN') {
                    let mx = 0, my = 0;
                    if(Input.left()) mx -= 1;
                    if(Input.right()) mx += 1;
                    if(Input.up()) my -= 1;
                    if(Input.down()) my += 1;
                    
                    if(mx!==0 && my!==0) { let len = Math.sqrt(mx*mx+my*my); mx/=len; my/=len; }
                    this.vx += mx * config.physics.speed * 600 * dt;
                    this.vy += my * config.physics.speed * 600 * dt;
                    
                    this.vx *= config.physics.friction;
                    this.vy *= config.physics.friction;
                } else {
                    // PLATFORMER
                    if(Input.left()) this.vx -= config.physics.speed * 100 * dt;
                    else if(Input.right()) this.vx += config.physics.speed * 100 * dt;
                    else this.vx *= config.physics.friction;
                    
                    if(Input.up() && this.grounded) {
                        this.vy = -config.physics.jump * 60;
                        this.grounded = false;
                        Particles.burst(this.x+this.w/2, this.y+this.h, 10, config.colors.player);
                    }
                    this.vy += config.physics.gravity * 60 * dt;
                }

                // Apply velocity
                this.x += this.vx * dt;
                
                // X Collision
                if(config.gameType !== 'RACING') {
                    for(let p of Level.platforms) {
                        if(this.x < p.x+p.w && this.x+this.w > p.x && this.y < p.y+p.h && this.y+this.h > p.y) {
                            if(this.vx > 0) this.x = p.x - this.w;
                            else this.x = p.x + p.w;
                            this.vx = 0;
                        }
                    }
                }
                
                this.y += this.vy * dt;
                this.grounded = false;
                
                // Y Collision
                if(config.gameType !== 'RACING') {
                    for(let p of Level.platforms) {
                        if(this.x < p.x+p.w && this.x+this.w > p.x && this.y < p.y+p.h && this.y+this.h > p.y) {
                            if(this.vy > 0) {
                                this.y = p.y - this.h;
                                this.grounded = true;
                            } else {
                                this.y = p.y + p.h;
                            }
                            this.vy = 0;
                        }
                    }
                }

                // Racing bounds
                if (config.gameType === 'RACING') {
                    if(this.y < 500) this.y = 500;
                    if(this.y > 900 - this.h) this.y = 900 - this.h;
                }

                // Fall out of bounds
                if(this.y > \${def.world.height} + 1000) {
                    Game.end(false, "You fell out of the world.");
                }
            },
            
            draw() {
                ctx.fillStyle = config.colors.player;
                ctx.shadowColor = config.colors.player;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                
                if (config.playerShape === 'circle') {
                    ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/2, 0, Math.PI*2);
                } else if (config.playerShape === 'triangle') {
                    ctx.moveTo(this.x, this.y + this.h);
                    ctx.lineTo(this.x + this.w, this.y + this.h/2);
                    ctx.lineTo(this.x, this.y);
                } else {
                    ctx.roundRect(this.x, this.y, this.w, this.h, 4);
                }
                
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Engine exhaust for racing
                if (config.gameType === 'RACING') {
                    Particles.burst(this.x, this.y + this.h/2, 1, '#f97316');
                }
            }
        };

        // Level Manager
        const Level = {
            platforms: \${JSON.stringify(def.entities.platforms)}.map(p => ({x:p.x, y:p.y, w:p.width, h:p.height, t:p.type})),
            enemies: \${JSON.stringify(def.entities.enemies)}.map(e => ({x:e.x, y:e.y, w:e.width, h:e.height, vx:e.speedX*60, vy:e.speedY*60, startX:e.x, startY:e.y})),
            items: \${JSON.stringify(def.entities.collectibles)}.map(c => ({x:c.x, y:c.y, w:c.width, h:c.height, active:true})),
            obstacles: \${JSON.stringify(def.entities.obstacles || [])}.map(o => ({x:o.x, y:o.y, w:o.width, h:o.height, active:true})),
            portal: \${JSON.stringify(def.entities.portal)},
            
            update(dt) {
                // Enemies
                for(let e of this.enemies) {
                    if (config.gameType === 'TOP_DOWN') {
                        // Simple chase player if close
                        let dx = player.x - e.x;
                        let dy = player.y - e.y;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 500) {
                            e.x += (dx/dist) * 100 * dt;
                            e.y += (dy/dist) * 100 * dt;
                        }
                    } else {
                        // Patrol X
                        e.x += e.vx * dt;
                        if(Math.abs(e.x - e.startX) > 150) e.vx *= -1;
                    }

                    // Collision
                    if (player.x < e.x + e.w && player.x + player.w > e.x && 
                        player.y < e.y + e.h && player.y + player.h > e.y) {
                        
                        if(config.gameType === 'PLATFORMER' && player.vy > 0 && player.y + player.h < e.y + e.h/2) {
                            player.vy = -config.physics.jump * 40;
                            Particles.burst(e.x+e.w/2, e.y+e.h/2, 20, config.colors.enemy);
                            e.x = -9999;
                        } else {
                            Game.damage(20);
                            player.vx = player.x < e.x ? -300 : 300;
                            player.vy = -300;
                            Camera.shake(0.2);
                            Particles.burst(player.x+player.w/2, player.y+player.h/2, 10, '#ef4444');
                            if(config.gameType === 'RACING') e.x = -9999; // destroy on impact
                        }
                    }
                }
                
                // Obstacles
                for(let o of this.obstacles) {
                    if(!o.active) continue;
                    if (player.x < o.x + o.w && player.x + player.w > o.x && 
                        player.y < o.y + o.h && player.y + player.h > o.y) {
                        Game.damage(30);
                        Camera.shake(0.3);
                        player.vx = -200; // Knockback
                        Particles.burst(o.x+o.w/2, o.y+o.h/2, 20, '#ffffff');
                        o.active = false;
                    }
                }

                // Collectibles
                for(let i of this.items) {
                    if(i.active && player.x < i.x + i.w && player.x + player.w > i.x &&
                        player.y < i.y + i.h && player.y + player.h > i.y) {
                        i.active = false;
                        Game.score++;
                        document.getElementById('score-display').innerText = Game.score;
                        Particles.burst(i.x+i.w/2, i.y+i.h/2, 15, config.colors.collectible);
                    }
                }
                
                // Portal
                if(this.portal) {
                    let p = this.portal;
                    if(player.x < p.x + p.w && player.x + player.w > p.x &&
                        player.y < p.y + p.h && player.y + player.h > p.y) {
                        Game.end(true, "Objective Completed!");
                    }
                }
            },
            
            draw(time) {
                // Background
                ctx.save();
                ctx.fillStyle = config.colors.bg;
                ctx.fillRect(0, 0, width, height);
                
                // Grid/Stars based on genre
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const offX = -(Camera.x * 0.2) % 100;
                const offY = -(Camera.y * 0.2) % 100;
                for(let x=offX-100; x<width; x+=100) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
                for(let y=offY-100; y<height; y+=100) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
                ctx.stroke();
                ctx.restore();
                
                ctx.save();
                Camera.apply();
                
                // Platforms
                for(let p of this.platforms) {
                    ctx.fillStyle = config.colors.platform;
                    if(p.t === 'wall') ctx.fillStyle = '#222';
                    if(p.t === 'road') {
                        ctx.fillStyle = '#111';
                        ctx.fillRect(p.x, p.y, p.w, p.h);
                        // Lane lines
                        ctx.fillStyle = '#fff';
                        for(let lx = p.x; lx < p.x+p.w; lx += 200) {
                            ctx.fillRect(lx, p.y + p.h/2 - 5, 100, 10);
                        }
                        continue;
                    }
                    ctx.beginPath();
                    ctx.roundRect(p.x, p.y, p.w, p.h, 4);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(p.x, p.y, p.w, 4);
                }
                
                // Obstacles
                for(let o of this.obstacles) {
                    if(!o.active) continue;
                    ctx.fillStyle = '#64748b';
                    ctx.fillRect(o.x, o.y, o.w, o.h);
                    ctx.fillStyle = '#fef08a';
                    ctx.fillRect(o.x+4, o.y+4, o.w-8, o.h-8);
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
                    if(config.gameType === 'RACING') {
                        ctx.fillRect(p.x, p.y, 50, p.h);
                        // Checkered pattern
                        ctx.fillStyle = '#fff';
                        for(let cy=0; cy<p.h; cy+=20) {
                            if((cy/20)%2===0) ctx.fillRect(p.x, p.y+cy, 25, 20);
                            else ctx.fillRect(p.x+25, p.y+cy, 25, 20);
                        }
                    } else {
                        ctx.arc(p.x+p.w/2, p.y+p.h/2, 50 + Math.sin(time/150)*10, 0, Math.PI*2);
                        ctx.fill();
                        ctx.strokeStyle = '#4ade80';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.roundRect(p.x, p.y, p.w, p.h, 8);
                        ctx.stroke();
                    }
                    ctx.globalCompositeOperation = 'source-over';
                }
                
                // Enemies
                for(let e of this.enemies) {
                    if(e.x < Camera.x - 500) continue; // Culling
                    ctx.save();
                    ctx.translate(e.x + e.w/2, e.y + e.h/2);
                    ctx.fillStyle = config.colors.enemy;
                    ctx.shadowColor = config.colors.enemy;
                    ctx.shadowBlur = 20;
                    
                    ctx.beginPath();
                    if (e.shape === 'circle') {
                        ctx.arc(0, 0, e.w/2, 0, Math.PI*2);
                    } else {
                        // Diamond
                        ctx.moveTo(0, -e.h/2);
                        ctx.lineTo(e.w/2, 0);
                        ctx.lineTo(0, e.h/2);
                        ctx.lineTo(-e.w/2, 0);
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

        function gameLoop(time) {
            const dt = Math.min((time - Game.lastTime) / 1000, 0.1);
            Game.lastTime = time;
            
            if (Game.state === 'PLAYING') {
                Input.update();
                player.update(dt);
                Level.update(dt);
                Particles.update(dt);
                Camera.update(dt, player);
            }
            
            Level.draw(time);
            
            ctx.save();
            Camera.apply();
            if(Game.state !== 'END') player.draw();
            Particles.draw();
            ctx.restore();
            
            // Atmospheric Vignette Overlay
            const grad = ctx.createRadialGradient(width/2, height/2, height*0.4, width/2, height/2, height);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,width,height);
            
            Game.reqId = requestAnimationFrame(gameLoop);
        }
        
        Game.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    </script>
</body>
</html>\`;
}
`;

fs.writeFileSync('src/engine/template.ts', code);
