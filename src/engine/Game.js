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
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.cheese = 100;
        this.health = 10;
        this.frame = 0;
        this.gameOver = false;
        this.selectedTower = 'pill';
        this.wave = 1;
        this.waveEnemies = 5;
        this.enemiesSpawned = 0;
        this.nextWaveFrame = 0;

        this.bgImage = new Image();
        this.bgImage.src = './background_lab.png';

        this.initGrid();
        this.setupEvents();
    }

    initGrid() {
        for (let y = 0; y < this.height; y += this.gridSize) {
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
            const gridY = Math.floor(mouseY / this.gridSize) * this.gridSize + this.gridSize / 2;

            const towerCosts = { 'pill': 50, 'cheese': 40, 'syrup': 100 };
            const cost = towerCosts[this.selectedTower] || 50;

            if (this.cheese >= cost && !this.isTowerAt(gridX, gridY)) {
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

    updateUI() {
        document.getElementById('cheese-display').innerText = `🧀 ${this.cheese}`;
        document.getElementById('health-display').innerText = `❤️ ${this.health}`;
        const waveDisplay = document.getElementById('wave-display');
        if (waveDisplay) waveDisplay.innerText = `Onda: ${this.wave}`;
    }

    update() {
        if (this.gameOver) return;

        this.frame++;

        // Spawn enemies logic
        if (this.enemiesSpawned < this.waveEnemies) {
            if (this.frame % 150 === 0) {
                const type = (this.wave > 2 && Math.random() > 0.7) ? 'fast' : 'basic';
                this.enemies.push(new Enemy(this, type));
                this.enemiesSpawned++;
            }
        } else if (this.enemies.length === 0 && !this.gameOver) {
            // Start next wave
            if (this.nextWaveFrame === 0) this.nextWaveFrame = this.frame + 180; // 3s delay

            if (this.frame >= this.nextWaveFrame) {
                this.wave++;
                this.waveEnemies += 3;
                this.enemiesSpawned = 0;
                this.nextWaveFrame = 0;
                this.updateUI();
            }
        }

        // Update entities
        [...this.enemies, ...this.towers, ...this.projectiles].forEach(obj => obj.update());

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
                        this.enemies.splice(eIdx, 1);
                        this.cheese += 25;
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

        // Clean up off-screen projectiles
        this.projectiles = this.projectiles.filter(p => p.x < this.width);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.cells.forEach(cell => {
            this.ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
        });

        // Draw entities
        [...this.enemies, ...this.towers, ...this.projectiles].forEach(obj => obj.draw(this.ctx));

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FIM DE JOGO', this.width / 2, this.height / 2);
        }
    }
}
