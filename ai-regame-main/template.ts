import { PlayableGameDefinition } from '../types/gameBuilder.js';

export function generateGameHTML(def: PlayableGameDefinition): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>\${def.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        
        :root {
            --bg: \${def.visuals.colorPalette.background};
            --primary: \${def.visuals.colorPalette.primary};
            --secondary: \${def.visuals.colorPalette.secondary};
            --accent: \${def.visuals.colorPalette.accent};
            --text-main: #ffffff;
        }

        * { box-sizing: border-box; }

        body, html {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            background-color: var(--bg);
            overflow: hidden;
            font-family: 'Rajdhani', sans-serif;
            touch-action: none;
            color: var(--text-main);
        }
        
        #gameCanvas {
            width: 100%; height: 100%;
            display: block;
        }

        /* React-owned UI layers will be injected via parent window postMessage,
           but for fallback standalone running, we provide basic HUD here. */
        #ui-layer {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px;
            z-index: 10;
        }

        .hud-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .health-bar-container {
            width: 200px;
            height: 12px;
            background: rgba(0,0,0,0.7);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            overflow: hidden;
            margin-top: 5px;
        }

        #hp-bar {
            width: 100%; height: 100%;
            background: var(--primary);
            transition: width 0.2s;
        }
        
        #score-display {
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            color: var(--accent);
        }

        /* Screen shake effect via CSS if needed, but we do it in canvas */
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    
    <div id="ui-layer">
        <div class="hud-top">
            <div>
                <div style="font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">\${def.title}</div>
                <div class="health-bar-container"><div id="hp-bar"></div></div>
                <div id="objective-display" style="font-size: 14px; margin-top: 8px; color: rgba(255,255,255,0.7); max-width: 300px;">
                    \${def.objectives[0]}
                </div>
            </div>
            <div id="score-display">0</div>
        </div>
    </div>

    <script>
        // CONFIG
        const config = \${JSON.stringify(def)};
        
        // MODULES
        const Engine = {
            canvas: document.getElementById('gameCanvas'),
            ctx: null,
            width: 0, height: 0,
            lastTime: 0,
            state: 'PLAYING',
            score: 0,
            
            init() {
                this.ctx = this.canvas.getContext('2d', { alpha: false });
                this.resize();
                window.addEventListener('resize', () => this.resize());
                
                // Initialize systems
                Input.init();
                Level.init();
                
                this.lastTime = performance.now();
                requestAnimationFrame(t => this.loop(t));
            },
            
            resize() {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.canvas.width = this.width;
                this.canvas.height = this.height;
            },
            
            loop(time) {
                const dt = Math.min((time - this.lastTime) / 1000, 0.1);
                this.lastTime = time;
                
                if (this.state === 'PLAYING') {
                    Input.update();
                    Player.update(dt);
                    Level.update(dt);
                    Particles.update(dt);
                    Camera.update(dt, Player);
                    
                    this.checkTriggers();
                }
                
                Renderer.draw(time);
                
                // Send state to parent (React)
                if (window.parent) {
                    window.parent.postMessage({
                        type: 'GAME_STATE',
                        hp: Player.hp,
                        maxHp: Player.maxHp,
                        score: this.score,
                        state: this.state
                    }, '*');
                }
                
                requestAnimationFrame(t => this.loop(t));
            },
            
            checkTriggers() {
                if (Player.hp <= 0 && this.state !== 'GAMEOVER') {
                    this.state = 'GAMEOVER';
                    if (window.parent) window.parent.postMessage({ type: 'GAME_OVER', win: false }, '*');
                }
                
                let p = Level.portal;
                if (p && Physics.AABB(Player, p)) {
                    this.state = 'VICTORY';
                    if (window.parent) window.parent.postMessage({ type: 'GAME_OVER', win: true }, '*');
                }
            },
            
            addScore(pts) {
                this.score += pts;
                document.getElementById('score-display').innerText = this.score;
            }
        };

        const Input = {
            keys: {},
            init() {
                window.addEventListener('keydown', e => this.keys[e.code] = true);
                window.addEventListener('keyup', e => this.keys[e.code] = false);
            },
            update() {},
            left: () => Input.keys['ArrowLeft'] || Input.keys['KeyA'],
            right: () => Input.keys['ArrowRight'] || Input.keys['KeyD'],
            up: () => Input.keys['ArrowUp'] || Input.keys['KeyW'] || Input.keys['Space'],
            down: () => Input.keys['ArrowDown'] || Input.keys['KeyS']
        };

        const Physics = {
            AABB(a, b) {
                return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
            }
        };

        const Camera = {
            x: 0, y: 0,
            shakeTime: 0, shakeMag: 0,
            update(dt, target) {
                // Smooth follow with deadzone
                const targetX = target.x - Engine.width/2 + target.w/2 + (target.vx * 0.5);
                const targetY = target.y - Engine.height/2 + target.h/2;
                
                if (config.cameraFollow === 'X' || config.cameraFollow === 'BOTH') {
                    this.x += (targetX - this.x) * 5 * dt;
                }
                if (config.cameraFollow === 'Y' || config.cameraFollow === 'BOTH') {
                    this.y += (targetY - this.y) * 5 * dt;
                }
                
                if (this.shakeTime > 0) this.shakeTime -= dt;
            },
            apply(ctx) {
                let sx = 0, sy = 0;
                if (this.shakeTime > 0) {
                    sx = (Math.random() - 0.5) * this.shakeMag;
                    sy = (Math.random() - 0.5) * this.shakeMag;
                }
                ctx.translate(-Math.floor(this.x) + sx, -Math.floor(this.y) + sy);
            },
            shake(time, mag) {
                this.shakeTime = time;
                this.shakeMag = mag;
            }
        };

        const Particles = {
            list: [],
            burst(x, y, count, color, speed = 100) {
                for(let i=0; i<count; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const v = Math.random() * speed + speed*0.2;
                    this.list.push({
                        x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v,
                        life: 1, color, size: Math.random() * 4 + 2
                    });
                }
            },
            update(dt) {
                for(let i=this.list.length-1; i>=0; i--) {
                    let p = this.list[i];
                    p.x += p.vx * dt; p.y += p.vy * dt;
                    p.life -= dt * 2;
                    if (config.gameType === 'PLATFORMER') p.vy += config.physics.gravity * 60 * dt;
                    if (p.life <= 0) this.list.splice(i, 1);
                }
            },
            draw(ctx) {
                for(let p of this.list) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(0, p.life);
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }
                ctx.globalAlpha = 1;
            }
        };

        const Player = {
            x: config.player.startX, y: config.player.startY,
            w: config.player.width, h: config.player.height,
            vx: 0, vy: 0,
            grounded: false,
            hp: 100, maxHp: 100,
            invuln: 0,
            state: 'IDLE',
            animTime: 0,
            
            update(dt) {
                this.animTime += dt;
                if (this.invuln > 0) this.invuln -= dt;

                const speed = config.physics.movementSpeed * 60;
                
                if (config.gameType === 'RACING') {
                    this.vx = speed;
                    if(Input.up()) this.vx *= 1.5;
                    if(Input.down()) this.vx *= 0.5;
                    
                    if(Input.left()) this.vy -= speed * 2 * dt;
                    else if(Input.right()) this.vy += speed * 2 * dt;
                    else this.vy *= config.physics.friction;
                    
                } else if (config.gameType === 'TOP_DOWN') {
                    let mx = 0, my = 0;
                    if(Input.left()) mx -= 1;
                    if(Input.right()) mx += 1;
                    if(Input.up()) my -= 1;
                    if(Input.down()) my += 1;
                    
                    if(mx!==0 && my!==0) { let len = Math.sqrt(mx*mx+my*my); mx/=len; my/=len; }
                    this.vx += mx * speed * 10 * dt;
                    this.vy += my * speed * 10 * dt;
                    
                    this.vx *= config.physics.friction;
                    this.vy *= config.physics.friction;
                } else {
                    // PLATFORMER
                    if(Input.left()) this.vx -= speed * 10 * dt;
                    else if(Input.right()) this.vx += speed * 10 * dt;
                    else this.vx *= config.physics.friction;
                    
                    if(Input.up() && this.grounded) {
                        this.vy = -config.physics.jumpForce * 60;
                        this.grounded = false;
                        Particles.burst(this.x+this.w/2, this.y+this.h, 15, config.visuals.colorPalette.primary, 50);
                    }
                    this.vy += config.physics.gravity * 60 * dt;
                }

                // Apply X
                this.x += this.vx * dt;
                if (config.gameType !== 'RACING') {
                    for(let p of Level.platforms) {
                        if(p.type !== 'floor' && p.type !== 'wall' && Physics.AABB(this, p)) {
                            if(this.vx > 0) this.x = p.x - this.w;
                            else this.x = p.x + p.w;
                            this.vx = 0;
                        }
                    }
                }
                
                // Apply Y
                this.y += this.vy * dt;
                this.grounded = false;
                
                if (config.gameType !== 'RACING') {
                    for(let p of Level.platforms) {
                        if(Physics.AABB(this, p)) {
                            if (p.type === 'floor' || p.type === 'wall' || this.vy > 0) {
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
                }

                // Bounds
                if (config.gameType === 'RACING') {
                    if (this.y < 500) { this.y = 500; this.vy = 0; }
                    if (this.y > 1100 - this.h) { this.y = 1100 - this.h; this.vy = 0; }
                }
                if (this.y > config.world.height + 1000) {
                    this.damage(100);
                }

                // Animation State
                if (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10) this.state = 'RUN';
                else this.state = 'IDLE';
                if (config.gameType === 'PLATFORMER' && !this.grounded) {
                    this.state = this.vy < 0 ? 'JUMP' : 'FALL';
                }
            },
            
            damage(amt) {
                if (this.invuln > 0) return;
                this.hp = Math.max(0, this.hp - amt);
                this.invuln = 1.0;
                document.getElementById('hp-bar').style.width = (this.hp/this.maxHp*100) + '%';
                Camera.shake(0.3, 15);
                Particles.burst(this.x+this.w/2, this.y+this.h/2, 20, '#ef4444', 200);
            },

            draw(ctx) {
                if (this.invuln > 0 && Math.floor(this.animTime * 10) % 2 === 0) return; // blink

                const visual = config.visuals.playerVisual;
                ctx.save();
                ctx.translate(this.x + this.w/2, this.y + this.h/2);
                
                // Face direction
                if (config.gameType !== 'RACING' && this.vx < -5) ctx.scale(-1, 1);
                
                // Bobbing anim
                if (this.state === 'RUN') {
                    ctx.translate(0, Math.sin(this.animTime * 15) * 2);
                    ctx.rotate(Math.sin(this.animTime * 10) * 0.1);
                }
                
                // Draw composed parts
                if (visual && visual.parts) {
                    if (visual.glow) {
                        ctx.shadowColor = visual.glow;
                        ctx.shadowBlur = 15;
                    }
                    for (let part of visual.parts) {
                        ctx.fillStyle = part.color;
                        ctx.beginPath();
                        // Centered offset calculation
                        const px = part.offsetX - this.w/2;
                        const py = part.offsetY - this.h/2;
                        
                        if (part.shape === 'rect') {
                            ctx.roundRect(px, py, part.width, part.height, 4);
                        } else if (part.shape === 'circle') {
                            ctx.arc(px + part.width/2, py + part.height/2, part.width/2, 0, Math.PI*2);
                        } else if (part.shape === 'capsule') {
                            ctx.roundRect(px, py, part.width, part.height, part.height/2);
                        } else if (part.shape === 'polygon' && part.points) {
                            ctx.moveTo(px + part.points[0].x, py + part.points[0].y);
                            for (let i=1; i<part.points.length; i++) {
                                ctx.lineTo(px + part.points[i].x, py + part.points[i].y);
                            }
                            ctx.closePath();
                        }
                        ctx.fill();
                    }
                } else {
                    // Fallback
                    ctx.fillStyle = config.visuals.colorPalette.primary;
                    ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
                }
                ctx.restore();
                
                // Exhaust
                if (config.gameType === 'RACING') {
                    Particles.burst(this.x, this.y + this.h/2, 1, '#f97316', 50);
                }
            }
        };

        const Level = {
            platforms: config.entities.platforms.map(p => ({...p})),
            enemies: config.entities.enemies.map(e => ({...e, startX: e.x, startY: e.y, hp: 100})),
            items: config.entities.collectibles.map(c => ({...c, active: true})),
            obstacles: (config.entities.obstacles||[]).map(o => ({...o, active: true})),
            portal: config.entities.portal,
            
            init() {},
            
            update(dt) {
                // Enemies
                for(let e of this.enemies) {
                    if (e.hp <= 0) continue;

                    if (config.gameType === 'TOP_DOWN') {
                        let dx = Player.x - e.x;
                        let dy = Player.y - e.y;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 400) {
                            e.x += (dx/dist) * 100 * dt;
                            e.y += (dy/dist) * 100 * dt;
                        }
                    } else {
                        e.x += e.speedX * 60 * dt;
                        if(Math.abs(e.x - e.startX) > 200) e.speedX *= -1;
                    }

                    if (Physics.AABB(Player, e)) {
                        // Stomp mechanic for platformer
                        if (config.gameType === 'PLATFORMER' && Player.vy > 0 && Player.y + Player.h < e.y + e.h/2) {
                            Player.vy = -config.physics.jumpForce * 40;
                            e.hp = 0;
                            Particles.burst(e.x+e.w/2, e.y+e.h/2, 30, config.visuals.colorPalette.secondary, 150);
                            Engine.addScore(50);
                        } else {
                            Player.damage(20);
                            Player.vx = Player.x < e.x ? -300 : 300;
                            Player.vy = -200;
                        }
                    }
                }
                
                // Obstacles
                for(let o of this.obstacles) {
                    if (!o.active) continue;
                    if (Physics.AABB(Player, o)) {
                        Player.damage(30);
                        Player.vx = -300; 
                        o.active = false;
                        Particles.burst(o.x+o.w/2, o.y+o.h/2, 20, '#fff', 100);
                    }
                }

                // Items
                for(let i of this.items) {
                    if (i.active && Physics.AABB(Player, i)) {
                        i.active = false;
                        Engine.addScore(10);
                        Particles.burst(i.x+i.w/2, i.y+i.h/2, 15, config.visuals.colorPalette.accent, 80);
                    }
                }
            },
            
            draw(ctx, time) {
                const ts = config.visuals.terrainStyle;
                
                for(let p of this.platforms) {
                    if (p.type === 'road') {
                        ctx.fillStyle = '#111';
                        ctx.fillRect(p.x, p.y, p.w, p.h);
                        ctx.fillStyle = '#444';
                        for(let lx = p.x; lx < p.x+p.w; lx += 300) {
                            ctx.fillRect(lx - (time*0.5)%300, p.y + p.h/2 - 10, 150, 20);
                        }
                    } else if (p.type === 'floor' || p.type === 'wall') {
                        ctx.fillStyle = ts.platformColor;
                        ctx.fillRect(p.x, p.y, p.w, p.h);
                        // Grid/Tile pattern
                        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                        ctx.strokeRect(p.x, p.y, p.w, p.h);
                    } else {
                        // Standard platform
                        ctx.fillStyle = ts.platformColor;
                        ctx.beginPath();
                        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
                        ctx.fill();
                        
                        ctx.fillStyle = ts.platformTopColor;
                        ctx.beginPath();
                        ctx.roundRect(p.x, p.y, p.w, Math.min(8, p.h), 6);
                        ctx.fill();
                    }
                }
                
                for(let o of this.obstacles) {
                    if(!o.active) continue;
                    ctx.fillStyle = '#64748b';
                    ctx.fillRect(o.x, o.y, o.w, o.h);
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(o.x+4, o.y+4, o.w-8, o.h-8);
                }

                for(let i of this.items) {
                    if(!i.active) continue;
                    ctx.save();
                    ctx.translate(i.x + i.w/2, i.y + i.h/2 + Math.sin(time/200)*5);
                    ctx.rotate(time/500);
                    ctx.fillStyle = config.visuals.colorPalette.accent;
                    ctx.shadowColor = config.visuals.colorPalette.accent;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0);
                    ctx.fill();
                    ctx.restore();
                }
                
                let pt = this.portal;
                if(pt) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
                    ctx.translate(pt.x + pt.w/2, pt.y + pt.h/2);
                    
                    if (config.gameType === 'RACING') {
                        ctx.fillRect(-pt.w/2, -pt.h/2, 100, pt.h);
                    } else {
                        ctx.arc(0, 0, pt.w/2 + Math.sin(time/150)*10, 0, Math.PI*2);
                        ctx.fill();
                        ctx.strokeStyle = '#4ade80';
                        ctx.lineWidth = 4;
                        ctx.strokeRect(-pt.w/2, -pt.h/2, pt.w, pt.h);
                    }
                    ctx.restore();
                }

                for(let e of this.enemies) {
                    if (e.hp <= 0) continue;
                    const visualList = config.visuals.enemyVisuals;
                    const visual = visualList && visualList.length > 0 ? visualList[0] : null;
                    
                    ctx.save();
                    ctx.translate(e.x + e.w/2, e.y + e.h/2);
                    if (e.speedX > 0) ctx.scale(-1, 1); // Face movement direction
                    
                    if (visual && visual.parts) {
                        if (visual.glow) { ctx.shadowColor = visual.glow; ctx.shadowBlur = 15; }
                        for (let part of visual.parts) {
                            ctx.fillStyle = part.color;
                            ctx.beginPath();
                            const px = part.offsetX - e.w/2;
                            const py = part.offsetY - e.h/2;
                            if (part.shape === 'rect') ctx.fillRect(px, py, part.width, part.height);
                            else if (part.shape === 'circle') ctx.arc(px+part.width/2, py+part.height/2, part.width/2, 0, Math.PI*2);
                            else if (part.shape === 'polygon' && part.points) {
                                ctx.moveTo(px+part.points[0].x, py+part.points[0].y);
                                for(let k=1;k<part.points.length;k++) ctx.lineTo(px+part.points[k].x, py+part.points[k].y);
                                ctx.closePath();
                            }
                            ctx.fill();
                        }
                    } else {
                        ctx.fillStyle = config.visuals.colorPalette.secondary;
                        ctx.fillRect(-e.w/2, -e.h/2, e.w, e.h);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(-e.w/4, -e.h/4, 4, 4);
                    }
                    ctx.restore();
                }
            }
        };

        const Renderer = {
            draw(time) {
                const ctx = Engine.ctx;
                
                // Background clear
                ctx.fillStyle = config.visuals.colorPalette.background;
                ctx.fillRect(0, 0, Engine.width, Engine.height);
                
                // Parallax Background Layers
                ctx.save();
                let px = -Camera.x * 0.1;
                let py = -Camera.y * 0.1;
                ctx.translate(px % 200, py % 200);
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(let x = -200; x < Engine.width + 200; x += 100) { ctx.moveTo(x, -200); ctx.lineTo(x, Engine.height+200); }
                for(let y = -200; y < Engine.height + 200; y += 100) { ctx.moveTo(-200, y); ctx.lineTo(Engine.width+200, y); }
                ctx.stroke();
                ctx.restore();
                
                // Environmental Particles (Snow, Dust, Neon Rain)
                ctx.save();
                const pType = config.visuals.particleEffects[0] || 'dust';
                ctx.translate((-Camera.x * 0.5) % Engine.width, (-Camera.y * 0.5) % Engine.height);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                if (pType === 'neon_rain') ctx.fillStyle = 'rgba(0,255,255,0.4)';
                if (pType === 'ember') ctx.fillStyle = 'rgba(255,100,0,0.5)';
                for(let i=0; i<50; i++) {
                    let rx = (Math.sin(i*123) * Engine.width*2) % Engine.width;
                    let ry = (Math.cos(i*321) * Engine.height*2 + time*(pType==='neon_rain'?0.5:0.05)) % Engine.height;
                    if (rx < 0) rx += Engine.width;
                    if (ry < 0) ry += Engine.height;
                    
                    if (pType === 'neon_rain') {
                        ctx.fillRect(rx, ry, 2, 20);
                    } else {
                        ctx.beginPath(); ctx.arc(rx, ry, pType==='snow'?3:1.5, 0, Math.PI*2); ctx.fill();
                    }
                }
                ctx.restore();

                // Gameplay Layer
                ctx.save();
                Camera.apply(ctx);
                
                Level.draw(ctx, time);
                if (Player.hp > 0) Player.draw(ctx);
                Particles.draw(ctx);
                
                ctx.restore();
                
                // Lighting Overlay (Vignette)
                const grad = ctx.createRadialGradient(Engine.width/2, Engine.height/2, Engine.height*0.4, Engine.width/2, Engine.height/2, Engine.height);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.7)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, Engine.width, Engine.height);
            }
        };

        // Start
        Engine.init();
    </script>
</body>
</html>`;
}
