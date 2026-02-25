export class Tower {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.type = type;
        this.fireRate = 100; // frames
        this.timer = 0;
        this.level = 1;
        this.damage = type === 'pill' ? 25 : 10;
        this.image = new Image();

        if (type === 'pill') {
            this.image.src = './mouse_tower.png.png';
        } else if (type === 'syrup') {
            this.image.src = './xarope.png';
            this.fireRate = 180; // 3 segundos (60fps)
        } else {
            this.image.src = '';
        }

        // Configurações de animação
        this.spriteWidth = 256;
        this.spriteHeight = 256;
        this.frameX = 0;
        this.frameY = 0; // Row 0: Idle, Row 1: Attack
        this.maxFrame = 3; // 4 frames por linha
        this.animTimer = 0;
        this.animSpeed = 10; // Velocidade da animação (muda frame a cada 10 game frames)
        this.isAttacking = false;
        this.attackAnimTimer = 0;
    }

    upgrade() {
        const upgradeCost = 100; // Dobro do custo original da pílula
        if (this.game.cheese >= upgradeCost && this.level === 1) {
            this.game.cheese -= upgradeCost;
            this.level++;
            this.damage *= 1.5; // +50% dano
            this.fireRate *= 0.9; // 10% mais rápido (menos frames entre tiros)
            this.game.updateUI();
            return true;
        }
        return false;
    }

    update() {
        if (this.type === 'cheese') {
            if (this.timer % 360 === 0 && this.timer > 0) {
                this.game.cheese += 20;
                this.game.updateUI();
            }
        } else if (this.type === 'pill') {
            // Lógica de animação
            if (this.timer % this.animSpeed === 0) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
            }

            // Atirar
            if (this.timer % this.fireRate === 0) {
                this.shoot();
            }

            // Verifica se há inimigos na linha para mudar a animação
            const enemiesInRow = this.game.enemies.some(enemy =>
                Math.abs(enemy.y - this.y) < 50 && enemy.x > this.x
            );
            this.frameY = enemiesInRow ? 1 : 0;
        } else if (this.type === 'syrup') {
            if (this.timer % this.animSpeed === 0) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
            }
            if (this.timer % this.fireRate === 0) {
                this.shoot();
                this.frameY = 1; // Ataque
                this.attackAnimTimer = 40;
            }
            if (this.attackAnimTimer > 0) {
                this.attackAnimTimer--;
            } else {
                this.frameY = 0; // Idle
            }
        }
        this.timer++;
    }

    shoot() {
        if (this.type === 'pill') {
            const enemiesInRow = this.game.enemies.filter(enemy =>
                Math.abs(enemy.y - this.y) < 50 && enemy.x > this.x
            );
            if (enemiesInRow.length > 0) {
                const totalDamage = this.damage * this.game.damageMultiplier;
                this.game.projectiles.push(new Projectile(this.game, this.x + 40, this.y, this.type, totalDamage));
            }
        } else if (this.type === 'syrup') {
            // Lança xarope 2 grids a frente (ou o máximo possível)
            const targetX = Math.min(this.x + 200, this.game.width - 50);
            this.game.projectiles.push(new SyrupShot(this.game, this.x, this.y, targetX, this.y));
        }
    }

    draw(ctx) {
        if (this.image.complete && this.image.src && (this.type === 'pill' || this.type === 'syrup')) {
            // Desenha o frame específico da spritesheet
            ctx.drawImage(
                this.image,
                this.frameX * this.spriteWidth,
                this.frameY * this.spriteHeight,
                this.spriteWidth,
                this.spriteHeight,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );

            // Indicador de upgrade
            if (this.level > 1) {
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(this.x + 25, this.y - 25, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('+', this.x + 25, this.y - 21);
            }
        } else {
            // Draw placeholders for other types
            ctx.fillStyle = this.type === 'cheese' ? '#fbbf24' : '#a855f7';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.fill();

            // Add a little detail to the cheese
            if (this.type === 'cheese') {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath(); ctx.arc(this.x - 10, this.y - 10, 5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(this.x + 10, this.y + 5, 4, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
}

class Projectile {
    constructor(game, x, y, type, damage) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 20;
        this.speed = 4;
        this.damage = damage;
        this.type = type;
        this.image = new Image();
        this.image.src = './Projetil_Tower.png.png';
    }

    update() {
        this.x += this.speed;
    }

    draw(ctx) {
        if (this.image.complete && this.type === 'pill') {
            ctx.drawImage(this.image, this.x, this.y - this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class SyrupShot {
    constructor(game, x, y, targetX, targetY) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 3;
        this.arcHeight = 60;
        this.distance = targetX - x;
        this.progress = 0;
        this.image = new Image();
        this.image.src = './projetil_xarope.png';
        this.size = 256; // Tamanho original da sprite
    }

    update() {
        this.progress += this.speed / this.distance;
        if (this.progress >= 1) {
            this.game.puddles.push(new Puddle(this.game, this.targetX, this.targetY));
            this.game.projectiles = this.game.projectiles.filter(p => p !== this);
        }
        this.x = this.x + this.speed;
        this.currentY = this.targetY - Math.sin(this.progress * Math.PI) * this.arcHeight;
    }

    draw(ctx) {
        if (this.image.complete) {
            // Escala dinâmica: começa pequena e cresce até o tamanho normal (0.4 -> 1.0)
            const baseScale = 0.4;
            const currentScale = baseScale + (this.progress * (1 - baseScale));
            const drawSize = 80 * currentScale; // Aumentei um pouco o tamanho base do desenho

            ctx.drawImage(
                this.image,
                this.x - drawSize / 2,
                this.currentY - drawSize / 2,
                drawSize,
                drawSize
            );
        } else {
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(this.x, this.currentY || this.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

export class Puddle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.duration = 120; // 2 segundos a 60fps
        this.image = new Image();
        this.image.src = './poca_projetil_xarope.png';
        this.width = 120; // Poça um pouco maior que o grid para cobrir bem
        this.height = 120;
    }

    update() {
        this.duration--;
    }

    draw(ctx) {
        if (this.image.complete) {
            // Aplica opacidade baseada na duração restante (fade out no final)
            const opacity = this.duration < 20 ? this.duration / 20 : 1;
            ctx.globalAlpha = opacity;
            ctx.drawImage(
                this.image,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + 20, 50, 25, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
