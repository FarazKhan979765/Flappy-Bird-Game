const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load bird image
const birdImg = new Image();
birdImg.src = 'bird.png';

const bird = {
    x: canvas.width * 0.1,
    y: canvas.height * 0.5,
    width: canvas.width * 0.05,
    height: canvas.width * 0.05,
    velocity: 0,
    gravity: canvas.height * 0.0006,
    jump: -canvas.height * 0.015
};

const pipes = [];
const pipeWidth = canvas.width * 0.1;
const pipeGap = canvas.height * 0.31;
let pipeSpeed = canvas.width * 0.002;
let score = 0;
let gameRunning = true;

// 🌥️ Create soft clouds
const clouds = [];
const cloudCount = 8;
for (let i = 0; i < cloudCount; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        width: canvas.width * (0.1 + Math.random() * 0.2),
        height: canvas.height * 0.05,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.3
    });
}

// Add pipes every 3 seconds
setInterval(() => {
    if (gameRunning) {
        const pipeHeight = Math.random() * (canvas.height - pipeGap - 50) + 30;

        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeWidth * 2) {
            pipes.push({
                x: canvas.width,
                topHeight: pipeHeight,
                bottomY: pipeHeight + pipeGap
            });
        }
    }
}, 3000);

function update() {
    if (!gameRunning) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y < 0) bird.y = 0;
    if (bird.y + bird.height > canvas.height) gameOver();

    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score++;
            updateScore();
        }

        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
            gameOver();
        }
    });

    // 🌥️ Cloud movement
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
            cloud.y = Math.random() * canvas.height * 0.4;
            cloud.width = canvas.width * (0.1 + Math.random() * 0.2);
            cloud.speed = Math.random() * 0.5 + 0.2;
            cloud.opacity = Math.random() * 0.5 + 0.3;
        }
    });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // 👉 Sky gradient
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.5, '#ADD8E6');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 🌞 Draw sun
    let sunX = canvas.width * 0.1;
    let sunY = canvas.height * 0.15;
    let sunRadius = canvas.width * 0.07;
    let sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunGradient.addColorStop(0, 'rgba(255, 223, 0, 1)');
    sunGradient.addColorStop(1, 'rgba(255, 223, 0, 0)');
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // 🌥️ Soft clouds with shading
    clouds.forEach(cloud => {
        ctx.globalAlpha = cloud.opacity;

        let cloudGradient = ctx.createRadialGradient(
            cloud.x + cloud.width * 0.5,
            cloud.y + cloud.height * 0.5,
            0,
            cloud.x + cloud.width * 0.5,
            cloud.y + cloud.height * 0.5,
            cloud.width * 0.5
        );
        cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        cloudGradient.addColorStop(1, 'rgba(200, 200, 200, 0.4)');

        ctx.fillStyle = cloudGradient;

        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width * 0.15, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.height * 0.3, cloud.width * 0.2, Math.PI * 1, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.15, Math.PI * 1.5, Math.PI * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
    });

    // 👉 Bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // 👉 Pipes with mouth
    pipes.forEach(pipe => {
        let gradientTop = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        gradientTop.addColorStop(0, '#4CAF50');
        gradientTop.addColorStop(1, '#2E7D32');
        ctx.fillStyle = gradientTop;
        ctx.beginPath();
        ctx.roundRect(pipe.x, 0, pipeWidth, pipe.topHeight, 8);
        ctx.fill();

        // Top mouth
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(pipe.x + pipeWidth / 2, pipe.topHeight, pipeWidth / 2, Math.PI, 0);
        ctx.fill();

        let gradientBottom = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipeWidth, pipe.bottomY);
        gradientBottom.addColorStop(0, '#4CAF50');
        gradientBottom.addColorStop(1, '#2E7D32');
        ctx.fillStyle = gradientBottom;
        ctx.beginPath();
        ctx.roundRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY, 8);
        ctx.fill();

        // Bottom mouth
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(pipe.x + pipeWidth / 2, pipe.bottomY, pipeWidth / 2, 0, Math.PI);
        ctx.fill();
    });
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

function jump() {
    bird.velocity = bird.jump;
}

function gameOver() {
    gameRunning = false;
    setTimeout(() => {
        alert(`Game Over! Your Score: ${score}`);
        location.reload();
    }, 100);
} 

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
});

canvas.addEventListener('click', jump);

update();
