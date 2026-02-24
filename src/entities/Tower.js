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
        this.image = new Image();
        this.image.src = type === 'pill' ? './pill_tower.png' : ''; // Use color if no image
    }

    update() {
        if (this.type === 'cheese') {
            if (this.timer % 300 === 0 && this.timer > 0) { // Every 5 seconds
                this.game.cheese += 25;
                this.game.updateUI();
            }
        } else if (this.timer % this.fireRate === 0) {
            this.shoot();
        }
        this.timer++;
    }

    shoot() {
        // Encontrar se há inimigo na mesma linha
        const enemiesInRow = this.game.enemies.filter(enemy =>
            Math.abs(enemy.y - this.y) < 50 && enemy.x > this.x
        );

        if (enemiesInRow.length > 0) {
            this.game.projectiles.push(new Projectile(this.game, this.x + 40, this.y, this.type));
        }
    }

    draw(ctx) {
        if (this.image.src && this.type === 'pill') {
            ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
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
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.speed = 4;
        this.damage = type === 'pill' ? 25 : 10;
        this.type = type;
    }

    update() {
        this.x += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'pill' ? '#38bdf8' : '#a855f7';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
