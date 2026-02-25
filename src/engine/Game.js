import { Enemy } from '../entities/Enemy.js';
import { Tower } from '../entities/Tower.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.cells = [];
        this.gridSize = 100;
        this.topOffset = 100; // Espaço para a HUD
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.puddles = []; // Para o efeito do Xarope
        this.cheese = 75;
        this.health = 5;
        this.frame = 0;
        this.gameOver = false;
        this.selectedTower = 'pill';
        this.wave = 1;
        this.waveDuration = 30 * 60; // 30 segundos a 60fps (antes era 60s)
        this.waveTimer = this.waveDuration;
        this.waveEnemiesTarget = 10; // Reduzido de 26 para 10 para um início mais tranquilo
        this.enemiesSpawnedInWave = 0;
        this.enemiesDefeatedInWave = 0;
        this.nextWaveFrame = 0;
        this.score = 0;
        this.maxWaves = 10;
        this.isVictory = false;

        this.bgImage = new Image();
        this.bgImage.src = './background_lab.png';

        this.initGrid();
        this.setupEvents();
    }

    initGrid() {
        // Reduzido para 4 linhas (removendo a última) para não bater com o HUD da loja
        for (let y = this.topOffset; y < this.height - this.gridSize; y += this.gridSize) {
            for (let x = 0; x < this.width; x += this.gridSize) {
                this.cells.push({ x, y, width: this.gridSize, height: this.gridSize });
            }
        }
    }

    setupEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const gridX = Math.floor(mouseX / this.gridSize) * this.gridSize + this.gridSize / 2;
            const gridY = Math.floor((mouseY - this.topOffset) / this.gridSize) * this.gridSize + this.gridSize / 2 + this.topOffset;

            if (mouseY < this.topOffset || mouseY >= this.height - this.gridSize) return; // Não clicar na HUD ou na área da loja

            const towerCosts = { 'pill': 50, 'cheese': 40, 'syrup': 100 };
            const cost = towerCosts[this.selectedTower] || 50;

            const existingTower = this.getTowerAt(gridX, gridY);

            if (existingTower) {
                // Tenta fazer upgrade se for uma pílula e estiver no nível 1
                if (existingTower.type === 'pill' && existingTower.level === 1) {
                    existingTower.upgrade();
                }
            } else if (this.cheese >= cost) {
                this.towers.push(new Tower(this, gridX, gridY, this.selectedTower));
                this.cheese -= cost;
                this.updateUI();
            }
        });

        // Add selection from shop
        document.querySelectorAll('.tower-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectedTower = card.dataset.type;
                document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });

        // Initialize first selection
        const firstCard = document.querySelector('.tower-card[data-type="pill"]');
        if (firstCard) firstCard.classList.add('active');
    }

    isTowerAt(x, y) {
        return this.towers.some(t => t.x === x && t.y === y);
    }

    getTowerAt(x, y) {
        return this.towers.find(t => t.x === x && t.y === y);
    }

    updateUI() {
        document.getElementById('cheese-display').innerText = `🧀 ${Math.floor(this.cheese)}`;
        document.getElementById('health-display').innerText = `❤️ ${this.health}`;
        const waveDisplay = document.getElementById('wave-display');
        if (waveDisplay) {
            const timeLeft = Math.max(0, Math.ceil(this.waveTimer / 60));
            waveDisplay.innerText = `Onda: ${this.wave}/10 | Tempo: ${timeLeft}s | Score: ${this.score}`;
        }
    }

    update() {
        if (this.gameOver) return;

        this.frame++;

        // Lógica de Waves e Spawning
        if (!this.isVictory) {
            if (this.waveTimer > 0) {
                this.waveTimer--;

                // Calcula intervalo de spawn para distribuir inimigos nos 60 segundos
                const spawnInterval = Math.floor(this.waveDuration / this.waveEnemiesTarget);

                if (this.frame % spawnInterval === 0 && this.enemiesSpawnedInWave < this.waveEnemiesTarget) {
                    // Determina o tipo de inimigo com base na wave
                    let type = 'basic';

                    if (this.wave === this.maxWaves && this.enemiesSpawnedInWave === this.waveEnemiesTarget - 1) {
                        type = 'boss'; // Último inimigo da última wave é o Boss
                    } else if (this.wave > 1) {
                        const rand = Math.random();
                        if (rand > 0.6) type = 'elite';
                        else if (rand > 0.3 && this.wave > 2) type = 'fast';
                    }
                    this.enemies.push(new Enemy(this, type));
                    this.enemiesSpawnedInWave++;
                }
                this.updateUI();
            } else if (this.enemies.length === 0 && !this.gameOver) {
                // Intervalo entre waves
                if (this.nextWaveFrame === 0) this.nextWaveFrame = this.frame + 180; // 3s respiro

                if (this.frame >= this.nextWaveFrame) {
                    if (this.wave < this.maxWaves) {
                        this.wave++;
                        this.waveEnemiesTarget = Math.floor(this.waveEnemiesTarget * 1.35); // +35% inimigos (era 20%)
                        this.enemiesSpawnedInWave = 0;
                        this.waveTimer = this.waveDuration;
                        this.nextWaveFrame = 0;
                        this.updateUI();
                    } else {
                        this.isVictory = true;
                    }
                }
            }
        }

        // Update entities
        [...this.enemies, ...this.towers, ...this.projectiles, ...this.puddles].forEach(obj => obj.update());

        // Puddle logic: Slow enemies passing through
        this.enemies.forEach(enemy => {
            this.puddles.forEach(puddle => {
                const dx = enemy.x - puddle.x;
                const dy = enemy.y - puddle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 50) {
                    enemy.slowTimer = 2; // Mantém a lentidão enquanto estiver na poça
                }
            });
        });

        // Collision detection
        this.projectiles.forEach((p, pIdx) => {
            this.enemies.forEach((e, eIdx) => {
                const dx = p.x - e.x;
                const dy = p.y - e.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 30) {
                    e.health -= p.damage;
                    if (p.type === 'syrup') {
                        e.slowTimer = 180; // Slow for 3 seconds (60fps)
                    }
                    this.projectiles.splice(pIdx, 1);
                    if (e.health <= 0) {
                        const reward = e.cheeseValue;
                        this.enemies.splice(eIdx, 1);
                        this.cheese += reward;
                        this.score += reward; // Pontuação igual ao queijo
                        this.updateUI();
                    }
                }
            });
        });

        // Check if enemies reach the base
        this.enemies.forEach((e, idx) => {
            if (e.x < 0) {
                this.health--;
                this.enemies.splice(idx, 1);
                this.updateUI();
                if (this.health <= 0) this.gameOver = true;
            }
        });

        // Clean up off-screen projectiles and expired puddles
        this.projectiles = this.projectiles.filter(p => p.x < this.width);
        this.puddles = this.puddles.filter(p => p.duration > 0);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);

        // Draw grid lines (Escuras com 50% alpha)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        this.cells.forEach(cell => {
            this.ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
        });

        // Draw puddles (at ground level)
        this.puddles.forEach(puddle => puddle.draw(this.ctx));

        // Draw entities
        [...this.enemies, ...this.towers, ...this.projectiles].forEach(obj => obj.draw(this.ctx));

        if (this.gameOver || this.isVictory) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.isVictory ? 'VITÓRIA! LABORATÓRIO SALVO' : 'FIM DE JOGO', this.width / 2, this.height / 2);
            this.ctx.font = '24px Inter';
            this.ctx.fillText(`Score Final: ${this.score}`, this.width / 2, this.height / 2 + 50);
        }
    }
}
