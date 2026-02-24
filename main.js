import { Game } from './src/engine/Game.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = 1000;
canvas.height = 600;

let game;
const startBtn = document.getElementById('start-btn');
const modal = document.getElementById('menu-modal');

startBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    game = new Game(canvas);
    requestAnimationFrame(gameLoop);
});

function gameLoop() {
    if (!game) return;

    game.update();
    game.draw();

    if (!game.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Icon preview in shop
document.getElementById('pill-icon').src = './pill_tower.png';
