export class Enemy {
    constructor(game, type) {
        this.game = game;
        this.x = game.width;
        this.y = Math.floor(Math.random() * 5) * (game.height / 5) + (game.height / 10);
        this.width = 60;
        this.height = 60;
        this.type = type;
        this.image = new Image();
        this.image.src = './virus_basic.png';

        if (type === 'fast') {
            this.speed = Math.random() * 0.8 + 1.2;
            this.health = 50;
            this.maxHealth = 50;
        } else {
            this.speed = Math.random() * 0.5 + 0.3;
            this.health = 100;
            this.maxHealth = 100;
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
            ctx.filter = 'hue-rotate(90deg) brightness(1.2)';
        }
        ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.filter = 'none';

        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 30, this.y - 40, 60, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - 30, this.y - 40, 60 * (this.health / this.maxHealth), 5);
    }
}
