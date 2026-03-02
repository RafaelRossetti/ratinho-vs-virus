export class Enemy {
    constructor(game, type) {
        this.game = game;
        this.x = game.width;
        this.y = Math.floor(Math.random() * 4) * game.gridSize + (game.gridSize / 2) + game.topOffset;
        this.width = 80;
        this.height = 80;
        this.type = type;
        this.image = new Image();
        this.image.src = './Enemy.png.png';

        // O vírus é uma imagem única, não uma spritesheet.
        // Usamos um timer simples para uma animação sutil de escala/pulsação.
        this.timer = 0;
        this.animSpeed = 8;

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
            this.width = 180;
            this.height = 180;
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

        // Timer para animação de pulsação
        this.timer++;
    }

    draw(ctx) {
        if (this.type === 'fast') {
            ctx.filter = 'hue-rotate(90deg) brightness(1.2)'; // Fica Amarelado
        } else if (this.type === 'elite') {
            ctx.filter = 'hue-rotate(280deg)'; // Fica Avermelhado
        } else if (this.type === 'boss') {
            ctx.filter = 'hue-rotate(180deg) brightness(0.5) drop-shadow(0 0 10px red)';
        }

        if (this.image.complete) {
            // Efeito sutil de pulsação para dar vida ao vírus
            const pulse = 1 + Math.sin(this.timer * 0.1) * 0.05;
            const drawW = this.width * pulse;
            const drawH = this.height * pulse;

            ctx.drawImage(
                this.image,
                this.x - drawW / 2,
                this.y - drawH / 2,
                drawW,
                drawH
            );
        }

        ctx.filter = 'none';

        // Health bar
        const barWidth = this.width * 0.8;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 10, barWidth, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 10, barWidth * (this.health / this.maxHealth), 4);
    }
}
