
"use strict";

// =============================================
// 1. MENGHUBUNGKAN ELEMEN HTML
// =============================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const shootBtn = document.getElementById("shootBtn");
const resetBtn = document.getElementById("resetBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// Ukuran area permainan
const W = canvas.width;
const H = canvas.height;
const groundY = 430;

// =============================================
// 2. PENGATURAN RING DAN KARAKTER
// =============================================

// Posisi ring basket
const hoop = {
    x: 710,
    y: 250,
    w: 58
};

// Posisi awal karakter
const initialPlayerX = 105;
let playerX = initialPlayerX;

// Posisi bola relatif terhadap karakter
const ballOffsetX = 42;
const startY = 365;

// =============================================
// 3. VARIABEL BOLA
// =============================================

const ball = {
    x: playerX + ballOffsetX,
    y: startY,
    r: 12,
    vx: 0,
    vy: 0,
    flying: false,
    scored: false
};

// =============================================
// 4. VARIABEL PERMAINAN
// =============================================

let gameStarted = false;
let score = 0;
let angle = 52;

// Batas sudut tembakan
const minAngle = 10;
const maxAngle = 80;

// Kecepatan perubahan sudut (derajat per detik)
const angleSpeed = 55;

// Kecepatan karakter (piksel per detik)
const playerSpeed = 240;

let jumpHeight = 0;
let jumpVelocity = 0;

const jumpStrength = 430;
const jumpGravity = 1200;


// Kecepatan awal bola
const launchSpeed = 570;

// Kekuatan gravitasi
const gravity = 620;

// Status tombol keyboard
const keys = {
    a: false,
    d: false,
    w: false,
    s: false
};

// Waktu frame sebelumnya
let lastTime = 0; 

// =============================================
// 5. MENGATUR POSISI AWAL BOLA
// =============================================


function resetBall() {
  ball.x = playerX + ballOffsetX;
  ball.y = startY - jumpHeight;

  ball.vx = 0;
  ball.vy = 0;

  ball.flying = false;
  ball.scored = false;
}




// =============================================
// 6. RESET SELURUH PERMAINAN
// =============================================

function startGame() {
    gameStarted = true;
    startScreen.hidden = true;

    statusEl.textContent =
        "Atur posisi dan sudut, lalu tembak bola!";
}
function resetGame() {
    gameStarted = true;
    startScreen.hidden = true;

    score = 0;
    scoreEl.textContent = score;

    playerX = initialPlayerX;
    angle = 52;

    jumpHeight = 0;
    jumpVelocity = 0;

    resetBall();

    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });

    statusEl.textContent =
        "Permainan direset. Ayo menembak!";
}


// =============================================
// 7. MENEMBAKKAN BOLA
// =============================================

function shoot() {
    // Tidak bisa menembak jika bola masih terbang
    if (!gameStarted || ball.flying) return;

    // Mengubah sudut dari derajat menjadi radian
    const rad = angle * Math.PI / 180;

    // Memecah kecepatan menjadi sumbu horizontal
    // dan vertikal
    ball.vx = launchSpeed * Math.cos(rad);
    ball.vy = -launchSpeed * Math.sin(rad);

    ball.flying = true;

    statusEl.textContent = "Bola meluncur...";
}

// =============================================
// 8. MENGGAMBAR LAPANGAN DAN RING
// =============================================

function drawCourt() {
    ctx.clearRect(0, 0, W, H);

    // Latar belakang
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, W, H);

    // Garis-garis latar
    ctx.strokeStyle = "#e8edf1";
    ctx.lineWidth = 1;

    for (let x = 40; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, groundY);
        ctx.stroke();
    }

    // Lantai
    ctx.fillStyle = "#e9edf1";
    ctx.fillRect(0, groundY, W, H - groundY);

    ctx.strokeStyle = "#aab4bf";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Tiang ring
    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(785, 155);
    ctx.lineTo(785, groundY);
    ctx.stroke();

    // Papan ring
    ctx.fillStyle = "#dce3e9";
    ctx.fillRect(742, 150, 65, 8);

    ctx.strokeStyle = "#657180";
    ctx.lineWidth = 3;
    ctx.strokeRect(742, 150, 65, 52);

    // Lingkaran ring
    ctx.strokeStyle = "#f28b27";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y);
    ctx.lineTo(hoop.x + hoop.w, hoop.y);
    ctx.stroke();

    // Jaring basket
    ctx.strokeStyle = "#c4cbd3";
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.moveTo(hoop.x + 3, hoop.y + 3);
    ctx.lineTo(hoop.x + 12, hoop.y + 42);

    ctx.moveTo(hoop.x + 20, hoop.y + 3);
    ctx.lineTo(hoop.x + 22, hoop.y + 42);

    ctx.moveTo(hoop.x + 38, hoop.y + 3);
    ctx.lineTo(hoop.x + 32, hoop.y + 42);

    ctx.moveTo(hoop.x + 55, hoop.y + 3);
    ctx.lineTo(hoop.x + 42, hoop.y + 42);

    ctx.moveTo(hoop.x + 8, hoop.y + 22);
    ctx.lineTo(hoop.x + 48, hoop.y + 22);

    ctx.moveTo(hoop.x + 12, hoop.y + 42);
    ctx.lineTo(hoop.x + 42, hoop.y + 42);

    ctx.stroke();

    // Menggambar karakter
    drawPlayer();

    // Garis perkiraan arah tembakan
    if (!ball.flying) {
        const rad = angle * Math.PI / 180;

        ctx.strokeStyle = "#9aa5b1";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);

        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);

        ctx.lineTo(
            ball.x + Math.cos(rad) * 100,
            ball.y - Math.sin(rad) * 100
        );

        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Informasi sudut
    ctx.fillStyle = "#344054";
    ctx.font = "bold 16px Arial";
    ctx.fillText(
        "Sudut: " + Math.round(angle) + "°",
        35,
        38
    );

    ctx.font = "13px Arial";
    ctx.fillStyle = "#7b8591";
    ctx.fillText("Ring", hoop.x + 10, hoop.y - 18);
}

// =============================================
// 9. MENGGAMBAR KARAKTER
// =============================================

function drawPlayer() {
    const px = playerX;
    const py = groundY - jumpHeight;
    // Kaki
    ctx.strokeStyle = "#344054";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(px - 7, py - 39);
    ctx.lineTo(px - 17, py - 5);

    ctx.moveTo(px + 7, py - 39);
    ctx.lineTo(px + 19, py - 5);

    ctx.stroke();

    // Badan atau jersey
    ctx.strokeStyle = "#3276c3";
    ctx.lineWidth = 20;

    ctx.beginPath();
    ctx.moveTo(px, py - 78);
    ctx.lineTo(px, py - 43);
    ctx.stroke();

    // Lengan
    ctx.strokeStyle = "#f0bd91";
    ctx.lineWidth = 7;

    ctx.beginPath();
    ctx.moveTo(px, py - 70);
    ctx.lineTo(px + 24, py - 56);
    ctx.stroke();

    // Kepala
    ctx.fillStyle = "#f0bd91";

    ctx.beginPath();
    ctx.arc(px, py - 96, 15, 0, Math.PI * 2);
    ctx.fill();

    // Rambut
    ctx.fillStyle = "#3b302b";

    ctx.beginPath();
    ctx.arc(
        px,
        py - 101,
        15,
        Math.PI,
        Math.PI * 2
    );
    ctx.fill();

    // Mata
    ctx.fillStyle = "#202833";

    ctx.beginPath();
    ctx.arc(px + 5, py - 96, 2, 0, Math.PI * 2);
    ctx.fill();
}

// =============================================
// 10. MENGGAMBAR BOLA BASKET
// =============================================

function drawBall() {
    // Badan bola
    ctx.fillStyle = "#f28b27";

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.r,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Garis hitam bola
    ctx.strokeStyle = "#8d4812";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.r - 1,
        -Math.PI / 2,
        Math.PI / 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.r - 1,
        Math.PI / 2,
        Math.PI * 1.5
    );

    ctx.stroke();

    // Garis tengah bola
    ctx.beginPath();

    ctx.moveTo(ball.x - ball.r + 2, ball.y);

    ctx.quadraticCurveTo(
        ball.x,
        ball.y - 5,
        ball.x + ball.r - 2,
        ball.y
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(ball.x - ball.r + 2, ball.y);

    ctx.quadraticCurveTo(
        ball.x,
        ball.y + 5,
        ball.x + ball.r - 2,
        ball.y
    );

    ctx.stroke();
}

// =============================================
// 11. MEMPERBARUI PERMAINAN DAN FISIKA
// =============================================

function update(dt) {
  // Gerakan karakter
  if (!gameStarted) return;
  if (!ball.flying) {
    if (keys.a) {
    playerX -= playerSpeed * dt;
}

if (keys.d) {
    playerX += playerSpeed * dt;
}
    playerX = Math.max(45, Math.min(550, playerX));
  }

  // Fisika lompatan
  if (jumpHeight > 0 || jumpVelocity > 0) {
    jumpVelocity -= jumpGravity * dt;
    jumpHeight += jumpVelocity * dt;

    if (jumpHeight <= 0) {
      jumpHeight = 0;
      jumpVelocity = 0;
    }
  }

  // Posisi bola sebelum ditembak
  if (!ball.flying) {
    ball.x = playerX + ballOffsetX;
    ball.y = startY - jumpHeight;
  }

  // Pengaturan sudut tembakan
  if (keys.w) {
    angle += angleSpeed * dt;
}

if (keys.s) {
    angle -= angleSpeed * dt;
}

angle = Math.max(minAngle, Math.min(maxAngle, angle));

  // Hentikan fisika bola jika belum ditembak
  if (!ball.flying) return;


  // Kode fisika bola setelah bagian ini tetap dilanjutkan...


    // Simpan posisi vertikal sebelumnya
    const oldY = ball.y;

    // -----------------------------------------
    // FISIKA BOLA
    // -----------------------------------------

    // Gravitasi mempercepat bola ke bawah
    ball.vy += gravity * dt;

    // Perbarui posisi bola
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // -----------------------------------------
    // DETEKSI BOLA MASUK RING
    // -----------------------------------------

    if (
        !ball.scored &&
        oldY < hoop.y &&
        ball.y >= hoop.y &&
        ball.vy > 0
    ) {
        // Perkiraan posisi horizontal saat bola
        // melintasi ketinggian ring
        const fraction =
            (hoop.y - oldY) / (ball.y - oldY);

        const crossingX =
            ball.x - ball.vx * dt * (1 - fraction);

        // Bagian dalam ring
        const leftEdge = hoop.x + ball.r;
        const rightEdge = hoop.x + hoop.w - ball.r;

        if (
            crossingX >= leftEdge &&
            crossingX <= rightEdge
        ) {
            ball.scored = true;

            score++;
            scoreEl.textContent = score;

            statusEl.textContent = "MASUK! +1 poin!";
        }
    }

    // -----------------------------------------
    // PANTULAN DI LANTAI
    // -----------------------------------------

    if (ball.y + ball.r >= groundY) {

        ball.y = groundY - ball.r;

        // Setelah mencetak skor, kembalikan bola
        // agar pemain bisa mencoba tembakan berikutnya
        if (ball.scored) {
            resetBall();

            statusEl.textContent =
                "Bola masuk! +1 poin. Tembak lagi!";

            return;
        }

        // Pantulkan bola jika masih cukup cepat
        if (Math.abs(ball.vy) > 100) {
            ball.vy *= -0.48;
            ball.vx *= 0.78;
        } else {
            ball.vy = 0;
            ball.vx = 0;
            ball.flying = false;

            statusEl.textContent =
                "Meleset! Coba posisi atau sudut lain.";
        }
    }

    // -----------------------------------------
    // BOLA KELUAR DARI AREA PERMAINAN
    // -----------------------------------------

    if (
        ball.x > W + 40 ||
        ball.x < -40 ||
        ball.y > H + 80
    ) {
        resetBall();

        statusEl.textContent =
            "Bola meleset. Coba lagi!";
    }
}

// =============================================
// 12. GAME LOOP
// =============================================

function loop(timestamp) {

    // Delta time menjaga gerakan relatif konsisten
    // meskipun frame rate berubah
    const dt = Math.min(
        (timestamp - (lastTime || timestamp)) / 1000,
        0.033
    );

    lastTime = timestamp;

    update(dt);
    drawCourt();
    drawBall();

    requestAnimationFrame(loop);
}

// =============================================
// 13. KONTROL KEYBOARD
// =============================================

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === " " || key.startsWith("arrow")) {
        e.preventDefault();
    }

    if (key === " " && !e.repeat) {
    if (gameStarted && jumpHeight === 0) {
        jumpVelocity = jumpStrength;
    }
    return;
}

    if (key in keys) {
        keys[key] = true;
    }
});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();

    if (key in keys) {
        keys[key] = false;
    }
});

window.addEventListener("blur", function() {
  Object.keys(keys).forEach(function(key) {
    keys[key] = false;
  });
});

// =============================================
// 14. KONTROL MOUSE DAN TOMBOL HTML
// =============================================

// Klik kiri di area permainan
canvas.addEventListener("click", function(e) {
    if (e.button === 0) {
        shoot();
    }
});

startBtn.addEventListener("click", startGame);
// Tombol tembak
shootBtn.addEventListener("click", shoot);

// Tombol reset
resetBtn.addEventListener("click", resetGame);

// =============================================
// 15. MEMULAI PERMAINAN
// =============================================

drawCourt();
drawBall();

requestAnimationFrame(loop);
