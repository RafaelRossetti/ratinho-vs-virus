export class Enemy {
    constructor(game, type) {
        this.game = game;
        this.x = game.width;
        this.y = Math.floor(Math.random() * 5) * game.gridSize + (game.gridSize / 2) + game.topOffset;
        this.width = 60;
        this.height = 60;
        this.type = type;
        this.image = new Image();
        this.image.src = './virus_basic.png';

        const waveScale = 1 + (game.wave - 1) * 0.15; // +15% de poder por wave
        this.cheeseValue = 20 * waveScale;

        if (type === 'fast') {
            this.speed = (Math.random() * 1.0 + 1.5) * 1.1;
            this.health = 40 * waveScale;
            this.maxHealth = this.health;
        } else if (type === 'elite') {
            this.speed = Math.random() * 0.5 + 0.5;
            this.health = 150 * waveScale;
            this.maxHealth = this.health;
        } else if (type === 'boss') {
            this.speed = 0.2;
            this.health = 3000 * waveScale; // 30x a vida base
            this.maxHealth = this.health;
            this.width = 150;
            this.height = 150;
            this.cheeseValue = 1000;
        } else {
            this.speed = Math.random() * 0.5 + 0.4;
            this.health = 100 * waveScale;
            this.maxHealth = this.health;
        }

        this.slowTimer = 0;
    }

    update() {
        let currentSpeed = this.speed;
        if (this.slowTimer > 0) {
            currentSpeed *= 0.5;
            this.slowTimer--;
        }
        this.x -= currentSpeed;
    }

    draw(ctx) {
        if (this.type === 'fast') {
            ctx.filter = 'hue-rotate(90deg) brightness(1.2)'; // Amarelado
        } else if (this.type === 'elite') {
            ctx.filter = 'hue-rotate(280deg)'; // Avermelhado
        } else if (this.type === 'boss') {
            ctx.filter = 'hue-rotate(180deg) brightness(0.5) drop-shadow(0 0 10px red)'; // Negro/Ciano com brilho
        }
        ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.filter = 'none';

        // Health bar
        const barWidth = this.width;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 10, barWidth, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 10, barWidth * (this.health / this.maxHealth), 5);
    }
}
