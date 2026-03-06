"use strict";

(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const scoreValue = document.getElementById("scoreValue");
  const comboValue = document.getElementById("comboValue");
  const stageValue = document.getElementById("stageValue");
  const pauseButton = document.getElementById("pauseButton");
  const startGameButton = document.getElementById("startGameButton");
  const primaryActionButton = document.getElementById("primaryActionButton");
  const secondaryActionButton = document.getElementById("secondaryActionButton");
  const homeActionButton = document.getElementById("homeActionButton");
  const titleScreen = document.getElementById("titleScreen");
  const stateScreen = document.getElementById("stateScreen");
  const stateKicker = document.getElementById("stateKicker");
  const stateTitle = document.getElementById("stateTitle");
  const stateMessage = document.getElementById("stateMessage");
  const currentBubblePreview = document.getElementById("currentBubblePreview");
  const nextBubblePreview = document.getElementById("nextBubblePreview");
  const statusText = document.getElementById("statusText");
  const stageFlavorText = document.getElementById("stageFlavorText");
  const descentMeter = document.getElementById("descentMeter");
  const boardStage = document.getElementById("boardStage");

  const CONFIG = {
    viewWidth: 420,
    viewHeight: 760,
    fieldLeft: 18,
    fieldRight: 402,
    topPadding: 78,
    bubbleRadius: 22,
    columns: 8,
    rowStep: 38,
    descendIntervalMs: 12000,
    descendHalfStep: 19,
    descendPenaltyStep: 38,
    missLimit: 5,
    projectileSpeed: 760,
    launcherX: 210,
    launcherY: 686,
    dangerLineY: 580,
    boardSearchRows: 20,
    colors: ["#ff6b6b", "#ffd166", "#4ecdc4", "#5f7bff", "#c77dff"],
  };

  const BUBBLE_DIAMETER = CONFIG.bubbleRadius * 2;
  const GRID_START_X = (CONFIG.viewWidth - (CONFIG.columns * BUBBLE_DIAMETER + CONFIG.bubbleRadius)) / 2 + CONFIG.bubbleRadius;
  const PLAYER_NAME = "\uD604\uC11C";
  const STAGE_THEMES = [
    "\uC6CC\uBC0D\uC5C5 \uB77C\uC6B4\uB4DC",
    "\uC9D1\uC911\uB825 \uC2A4\uD30C\uD06C",
    "\uBC18\uC0AC \uAC01\uB3C4 \uC1FC\uD0C0\uC784",
    "\uBC84\uBE14 \uD30C\uD2F0",
    "\uD074\uB7EC\uCE58 \uCC4C\uB9B0\uC9C0",
    "\uD558\uC774\uB77C\uC774\uD2B8 \uD53C\uB0A0\uB808",
  ];
  const MISS_LINES = [
    "\uC774\uBC88 \uC0F7\uC740 \uC544\uC27D\uC9C0\uB9CC \uC544\uC9C1 \uD750\uB984\uC740 \uC0B4\uC544 \uC788\uC5B4\uC694.",
    "\uAC01\uB3C4\uB97C \uC870\uAE08\uB9CC \uB354 \uB2E4\uB4EC\uC73C\uBA74 \uBC14\uB85C \uD130\uC9C8 \uAC83 \uAC19\uC544\uC694.",
    "\uB2E4\uC74C \uD55C \uBC1C\uC774 \uD604\uC11C\uC758 \uD558\uC774\uB77C\uC774\uD2B8\uAC00 \uB420 \uC218\uB3C4 \uC788\uC5B4\uC694.",
  ];


  const state = {
    mode: "title",
    stage: 1,
    score: 0,
    combo: 0,
    missStreak: 0,
    boardOffsetY: 0,
    descendElapsed: 0,
    board: [],
    currentBubble: null,
    nextBubble: null,
    projectile: null,
    aiming: false,
    aimAngle: -Math.PI / 2,
    particles: [],
    popups: [],
    flashLevel: 0,
    stageClearQueued: false,
    stageClearTimerId: 0,
    overlayPrimaryAction: "resume",
    overlaySecondaryAction: "restart",
    animationFrameId: 0,
    lastTime: 0,
  };

  function createSeededRandom(seed) {
    let value = seed >>> 0;
    return function next() {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mixColor(hex, amount) {
    const base = hex.replace("#", "");
    const channels = [
      parseInt(base.slice(0, 2), 16),
      parseInt(base.slice(2, 4), 16),
      parseInt(base.slice(4, 6), 16),
    ];
    const mixWith = amount >= 0 ? 255 : 0;
    const strength = Math.abs(amount);
    const mixed = channels.map((channel) => Math.round(channel + (mixWith - channel) * strength));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  }

  function randomFrom(array, randomFn = Math.random) {
    return array[Math.floor(randomFn() * array.length)];
  }

  function createEmptyBoard(rows = CONFIG.boardSearchRows) {
    return Array.from({ length: rows }, () => Array(CONFIG.columns).fill(null));
  }

  function ensureRowExists(rowIndex) {
    while (state.board.length <= rowIndex) {
      state.board.push(Array(CONFIG.columns).fill(null));
    }
  }

  function getCellCenter(row, col) {
    return {
      x: GRID_START_X + col * BUBBLE_DIAMETER + (row % 2 === 1 ? CONFIG.bubbleRadius : 0),
      y: CONFIG.topPadding + row * CONFIG.rowStep + state.boardOffsetY,
    };
  }

  function getNeighbors(row, col) {
    const shared = [
      [row, col - 1],
      [row, col + 1],
    ];
    const diagonalOffsets = row % 2 === 0
      ? [[row - 1, col - 1], [row - 1, col], [row + 1, col - 1], [row + 1, col]]
      : [[row - 1, col], [row - 1, col + 1], [row + 1, col], [row + 1, col + 1]];

    return shared.concat(diagonalOffsets)
      .filter(([candidateRow, candidateCol]) => candidateRow >= 0 && candidateCol >= 0 && candidateCol < CONFIG.columns);
  }

  function getBubble(row, col) {
    if (row < 0 || row >= state.board.length || col < 0 || col >= CONFIG.columns) {
      return null;
    }
    return state.board[row][col];
  }

  function setBubble(row, col, bubble) {
    ensureRowExists(row);
    state.board[row][col] = bubble;
  }

  function getExistingColors() {
    const colors = new Set();
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = state.board[row][col];
        if (bubble) {
          colors.add(bubble.color);
        }
      }
    }
    return colors.size > 0 ? Array.from(colors) : CONFIG.colors;
  }

  function createBubble(color) {
    return { color };
  }

  function pickBubbleColor() {
    return randomFrom(getExistingColors());
  }

  function getStageTheme(stage) {
    return STAGE_THEMES[(stage - 1) % STAGE_THEMES.length];
  }

  function getStageLabel(stage) {
    return `${PLAYER_NAME}의 ${getStageTheme(stage)}`;
  }

  function getComboCheer(combo) {
    if (combo >= 5) {
      return `${PLAYER_NAME} 하이라이트!`;
    }
    if (combo >= 3) {
      return `${PLAYER_NAME} 콤보 타임!`;
    }
    return `${PLAYER_NAME} 리듬 좋아요!`;
  }

  function hideOverlay(element) {
    element.classList.remove("overlay-active");
  }

  function showElement(element) {
    element.classList.add("overlay-active");
  }

  function paintPreview(element, color) {
    element.style.background = `radial-gradient(circle at 30% 30%, ${mixColor(color, 0.6)}, ${color} 55%, ${mixColor(color, -0.35)})`;
  }

  function updateStatus(message) {
    statusText.textContent = message;
  }

  function updateLauncherPreview() {
    paintPreview(currentBubblePreview, state.currentBubble ? state.currentBubble.color : "#68708c");
    paintPreview(nextBubblePreview, state.nextBubble ? state.nextBubble.color : "#68708c");
  }

  function updateHud() {
    scoreValue.textContent = state.score.toLocaleString("ko-KR");
    comboValue.textContent = `${state.combo}`;
    stageValue.textContent = `${state.stage}`;
    pauseButton.disabled = state.mode === "title";
    pauseButton.textContent = state.mode === "paused" ? "계속하기" : "일시정지";

    if (stageFlavorText) {
      stageFlavorText.textContent = state.mode === "title"
        ? `${PLAYER_NAME} \uC804\uC6A9 \uC2A4\uD14C\uC774\uC9C0\uAC00 \uC900\uBE44 \uC911\uC774\uC5D0\uC694.`
        : `\uD604\uC7AC \uD14C\uB9C8: ${getStageLabel(state.stage)}`;
    }

    const descentProgress = state.mode === "title"
      ? 0
      : Math.min(state.descendElapsed / CONFIG.descendIntervalMs, 1);
    descentMeter.style.width = `${descentProgress * 100}%`;
  }

  function showOverlay(options) {
    stateKicker.textContent = options.kicker;
    stateTitle.textContent = options.title;
    stateMessage.textContent = options.message;
    primaryActionButton.textContent = options.primaryLabel;
    secondaryActionButton.textContent = options.secondaryLabel;
    secondaryActionButton.style.display = options.secondaryLabel ? "inline-flex" : "none";
    homeActionButton.style.display = options.showHome === false ? "none" : "inline-flex";
    state.overlayPrimaryAction = options.primaryAction;
    state.overlaySecondaryAction = options.secondaryAction || "restart";
    showElement(stateScreen);
  }

  function buildStage(stage) {
    const random = createSeededRandom(stage * 99173 + 17);
    const rows = clamp(5 + stage, 6, 10);
    const gapRate = clamp(0.05 + stage * 0.015, 0.08, 0.18);
    const patternMode = stage % 3;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        let shouldFill = true;
        if (row > 0 && random() < gapRate && !(row === rows - 1 && col % 2 === 0)) {
          shouldFill = false;
        }
        if (!shouldFill) {
          continue;
        }

        let colorIndex;
        if (patternMode === 0) {
          colorIndex = (row + col + Math.floor(random() * 2)) % CONFIG.colors.length;
        } else if (patternMode === 1) {
          colorIndex = (row * 2 + Math.floor(col / 2) + Math.floor(random() * 3)) % CONFIG.colors.length;
        } else {
          colorIndex = Math.floor(random() * CONFIG.colors.length);
          if (col > 0 && random() < 0.45) {
            const leftBubble = getBubble(row, col - 1);
            if (leftBubble) {
              colorIndex = CONFIG.colors.indexOf(leftBubble.color);
            }
          }
        }
        setBubble(row, col, createBubble(CONFIG.colors[colorIndex]));
      }
    }
  }

  function resetRun(stage = 1, preserveScore = false) {
    state.stage = stage;
    state.score = preserveScore ? state.score : 0;
    state.combo = 0;
    state.missStreak = 0;
    state.boardOffsetY = 0;
    state.descendElapsed = 0;
    state.projectile = null;
    state.aiming = false;
    state.flashLevel = 0;
    state.popups = [];
    state.particles = [];
    state.stageClearQueued = false;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.board = createEmptyBoard();
    buildStage(stage);
    state.currentBubble = createBubble(pickBubbleColor());
    state.nextBubble = createBubble(pickBubbleColor());
    state.mode = "playing";
    hideOverlay(titleScreen);
    hideOverlay(stateScreen);
    boardStage.classList.remove("warning", "shake");
    checkDangerState();
    updateHud();
    updateLauncherPreview();
    addPopup(getStageLabel(stage), CONFIG.launcherX, 138, "#ffd166");
    updateStatus(`${PLAYER_NAME}, ${getStageTheme(stage)} \uC2DC\uC791! \uCCAB \uBC84\uBE14\uC744 \uC2DC\uC6D0\uD558\uAC8C \uC3F4\uBCF4\uC138\uC694.`);
  }

  function togglePause() {
    if (state.mode === "title" || state.mode === "gameover" || state.mode === "clear") {
      return;
    }
    if (state.mode === "paused") {
      state.mode = "playing";
      hideOverlay(stateScreen);
      updateStatus(`${PLAYER_NAME}, \uB2E4\uC2DC \uBC84\uBE14\uC1FC \uC2DC\uC791!`);
      updateHud();
      return;
    }
    state.mode = "paused";
    state.aiming = false;
    showOverlay({
      kicker: `${PLAYER_NAME} \uC804\uC6A9 \uBA54\uB274`,
      title: `${PLAYER_NAME}\uC758 \uC7A0\uAE50 \uC228 \uACE0\uB974\uAE30`,
      message: `${PLAYER_NAME}, \uC228\uC744 \uACE0\uB978 \uB4A4 \uB2E4\uC2DC \uC774\uC5B4\uAC00\uBA74 \uB3FC\uC694.`,
      primaryLabel: "계속하기",
      primaryAction: "resume",
      secondaryLabel: "다시하기",
      secondaryAction: "restart",
    });
    updateHud();
  }

  function triggerShake() {
    boardStage.classList.remove("shake");
    void boardStage.offsetWidth;
    boardStage.classList.add("shake");
    window.setTimeout(() => boardStage.classList.remove("shake"), 360);
  }

  function addPopup(text, x, y, color) {
    state.popups.push({ text, x, y, color, life: 1 });
  }

  function addParticles(x, y, color, amount) {
    for (let index = 0; index < amount; index += 1) {
      const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.3;
      const speed = 70 + Math.random() * 130;
      const maxLife = 0.7 + Math.random() * 0.35;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color,
        life: maxLife,
        maxLife,
      });
    }
  }

  function beginAim(pointerX, pointerY) {
    if (state.mode !== "playing" || state.projectile) {
      return;
    }
    state.aiming = true;
    updateAim(pointerX, pointerY);
  }

  function updateAim(pointerX, pointerY) {
    if (!state.aiming) {
      return;
    }
    const dx = pointerX - CONFIG.launcherX;
    const dy = pointerY - CONFIG.launcherY;
    const rawAngle = Math.atan2(dy, dx);
    state.aimAngle = clamp(rawAngle, -Math.PI + 0.22, -0.22);
  }

  function fireBubble() {
    if (!state.aiming || state.mode !== "playing" || state.projectile) {
      state.aiming = false;
      return;
    }
    state.projectile = {
      x: CONFIG.launcherX,
      y: CONFIG.launcherY,
      vx: Math.cos(state.aimAngle) * CONFIG.projectileSpeed,
      vy: Math.sin(state.aimAngle) * CONFIG.projectileSpeed,
      color: state.currentBubble.color,
    };
    state.currentBubble = state.nextBubble;
    state.nextBubble = createBubble(pickBubbleColor());
    state.aiming = false;
    updateLauncherPreview();
    updateStatus(`${PLAYER_NAME}, \uBC84\uBE14 \uBC1C\uC0AC \uC644\uB8CC! \uB2E4\uC74C \uAC01\uB3C4\uB97C \uC77D\uC5B4\uBD10\uC694.`);
  }

  function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function findCollisionAt(x, y) {
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = getBubble(row, col);
        if (!bubble) {
          continue;
        }
        const center = getCellCenter(row, col);
        const dx = center.x - x;
        const dy = center.y - y;
        if (dx * dx + dy * dy <= (BUBBLE_DIAMETER - 4) * (BUBBLE_DIAMETER - 4)) {
          return { row, col, center };
        }
      }
    }
    return null;
  }

  function findSnapCell(targetX, targetY) {
    const approximateRow = Math.round((targetY - CONFIG.topPadding - state.boardOffsetY) / CONFIG.rowStep);
    let best = null;

    for (let row = Math.max(0, approximateRow - 3); row <= approximateRow + 3; row += 1) {
      ensureRowExists(row);
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          continue;
        }
        const center = getCellCenter(row, col);
        const distance = Math.hypot(center.x - targetX, center.y - targetY);
        const valid = row === 0 || getNeighbors(row, col).some(([nRow, nCol]) => Boolean(getBubble(nRow, nCol)));
        if (!valid || distance > BUBBLE_DIAMETER * 1.35) {
          continue;
        }
        if (!best || distance < best.distance) {
          best = { row, col, distance };
        }
      }
    }

    if (best) {
      return best;
    }

    for (let row = 0; row < state.board.length + 2; row += 1) {
      ensureRowExists(row);
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          continue;
        }
        const center = getCellCenter(row, col);
        const distance = Math.hypot(center.x - targetX, center.y - targetY);
        const valid = row === 0 || getNeighbors(row, col).some(([nRow, nCol]) => Boolean(getBubble(nRow, nCol)));
        if (!valid) {
          continue;
        }
        if (!best || distance < best.distance) {
          best = { row, col, distance };
        }
      }
    }

    return best || { row: 0, col: clamp(Math.round((targetX - GRID_START_X) / BUBBLE_DIAMETER), 0, CONFIG.columns - 1) };
  }

  function collectConnectedSameColor(startRow, startCol) {
    const origin = getBubble(startRow, startCol);
    if (!origin) {
      return [];
    }
    const targetColor = origin.color;
    const visited = new Set();
    const stack = [[startRow, startCol]];

    while (stack.length > 0) {
      const [row, col] = stack.pop();
      const key = `${row}:${col}`;
      if (visited.has(key)) {
        continue;
      }
      const bubble = getBubble(row, col);
      if (!bubble || bubble.color !== targetColor) {
        continue;
      }
      visited.add(key);
      for (const neighbor of getNeighbors(row, col)) {
        stack.push(neighbor);
      }
    }

    return Array.from(visited).map((key) => {
      const [row, col] = key.split(":").map(Number);
      return { row, col };
    });
  }

  function collectFloatingBubbles() {
    const connected = new Set();
    const stack = [];
    for (let col = 0; col < CONFIG.columns; col += 1) {
      if (getBubble(0, col)) {
        stack.push([0, col]);
      }
    }

    while (stack.length > 0) {
      const [row, col] = stack.pop();
      const key = `${row}:${col}`;
      if (connected.has(key) || !getBubble(row, col)) {
        continue;
      }
      connected.add(key);
      for (const neighbor of getNeighbors(row, col)) {
        stack.push(neighbor);
      }
    }

    const floating = [];
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col) && !connected.has(`${row}:${col}`)) {
          floating.push({ row, col });
        }
      }
    }
    return floating;
  }

  function removeBubbles(bubbles, popLabel) {
    if (bubbles.length === 0) {
      return;
    }
    let averageX = 0;
    let averageY = 0;
    let count = 0;

    for (const { row, col } of bubbles) {
      const bubble = getBubble(row, col);
      if (!bubble) {
        continue;
      }
      const center = getCellCenter(row, col);
      averageX += center.x;
      averageY += center.y;
      count += 1;
      addParticles(center.x, center.y, bubble.color, 8);
      setBubble(row, col, null);
    }

    if (count > 0) {
      addPopup(popLabel, averageX / count, averageY / count, "#ffe29a");
    }
  }

  function getRemainingBubbleCount() {
    let count = 0;
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          count += 1;
        }
      }
    }
    return count;
  }

  function queueStageClear() {
    if (state.stageClearQueued) {
      return;
    }
    state.stageClearQueued = true;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
    }
    const queuedStage = state.stage;
    state.stageClearTimerId = window.setTimeout(() => {
      state.stageClearTimerId = 0;
      if (state.mode !== "playing" || state.stage !== queuedStage || !state.stageClearQueued) {
        return;
      }
      state.mode = "clear";
      showOverlay({
        kicker: `${PLAYER_NAME} Clear`,
        title: `${getStageLabel(state.stage)} \uC644\uB8CC`,
        message: `${PLAYER_NAME}, \uD604\uC7AC \uC810\uC218\uB294 ${state.score.toLocaleString("ko-KR")}\uC810\uC774\uC5D0\uC694. \uB2E4\uC74C \uC2A4\uD14C\uC774\uC9C0\uC5D0\uC11C\uB3C4 \uBC84\uBE14\uC1FC\uB97C \uC774\uC5B4\uAC08\uAE4C\uC694?`,
        primaryLabel: "\uB2E4\uC74C \uC2A4\uD14C\uC774\uC9C0",
        primaryAction: "nextStage",
        secondaryLabel: "\uB2E4\uC2DC\uD558\uAE30",
        secondaryAction: "restart",
      });
      updateStatus(`${PLAYER_NAME}, \uC2A4\uD14C\uC774\uC9C0\uB97C \uD074\uB9AC\uC5B4\uD588\uC5B4\uC694!`);
      updateHud();
    }, 320);
  }

  function triggerGameOver() {
    if (state.mode === "gameover") {
      return;
    }
    state.stageClearQueued = false;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.mode = "gameover";
    state.projectile = null;
    state.aiming = false;
    triggerShake();
    showOverlay({
      kicker: `${PLAYER_NAME} Retry`,
      title: `${PLAYER_NAME}, \uD55C \uD310 \uB354 \uB3C4\uC804\uD574\uBCFC\uAE4C\uC694?`,
      message: `\uCD5C\uC885 \uC810\uC218 ${state.score.toLocaleString("ko-KR")}\uC810, \uB3C4\uB2EC \uC2A4\uD14C\uC774\uC9C0 ${state.stage}. \uB2E4\uC74C \uD310\uC5D0\uC11C\uB294 \uB354 \uBA4B\uC9C4 \uAC01\uB3C4\uAC00 \uB098\uC62C \uAC70\uC608\uC694.`,
      primaryLabel: "\uB2E4\uC2DC\uD558\uAE30",
      primaryAction: "restart",
      secondaryLabel: "\uCC98\uC74C\uBD80\uD130",
      secondaryAction: "newGame",
    });
    updateStatus(`${PLAYER_NAME}, \uC774\uBC88 \uB77C\uC6B4\uB4DC\uB294 \uC5EC\uAE30\uAE4C\uC9C0\uC608\uC694. \uB2E4\uC2DC \uC2DC\uC791\uD574\uBCFC\uAE4C\uC694?`);
    updateHud();
  }

  function getLowestBubbleBottom() {
    let lowest = -Infinity;
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (!getBubble(row, col)) {
          continue;
        }
        const center = getCellCenter(row, col);
        lowest = Math.max(lowest, center.y + CONFIG.bubbleRadius);
      }
    }
    return lowest;
  }

  function checkDangerState() {
    const lowest = getLowestBubbleBottom();
    const nearDanger = lowest >= CONFIG.dangerLineY - 48;
    boardStage.classList.toggle("warning", nearDanger);
    if (lowest >= CONFIG.dangerLineY) {
      triggerGameOver();
    }
  }

  function descendBoard(amount, fromPenalty = false) {
    state.boardOffsetY += amount;
    state.descendElapsed = 0;
    state.flashLevel = fromPenalty ? 0.85 : 0.45;
    triggerShake();
    checkDangerState();
  }

  function resolveShot(cell) {
    setBubble(cell.row, cell.col, createBubble(state.projectile.color));
    state.projectile = null;

    const matched = collectConnectedSameColor(cell.row, cell.col);
    if (matched.length >= 3) {
      const matchedCount = matched.length;
      removeBubbles(matched, `${matchedCount}\uAC1C \uBC84\uBE14 \uD321`);
      const floating = collectFloatingBubbles();
      const floatingCount = floating.length;
      if (floatingCount > 0) {
        removeBubbles(floating, `${floatingCount}\uAC1C \uBC84\uBE14 \uB099\uD558`);
      }

      state.combo += 1;
      state.missStreak = 0;
      const comboBonus = state.combo > 1 ? (state.combo - 1) * 25 : 0;
      const gainedScore = matchedCount * 120 + floatingCount * 180 + comboBonus;
      state.score += gainedScore;
      addPopup(`+${gainedScore}`, CONFIG.launcherX, CONFIG.launcherY - 86, "#7cf5d6");
      updateStatus(
        floatingCount > 0
          ? `${PLAYER_NAME}, ${matchedCount}\uAC1C \uB9E4\uCE58\uC5D0 ${floatingCount}\uAC1C \uB099\uD558! \uCF64\uBCF4 ${state.combo}!`
          : `${PLAYER_NAME}, ${matchedCount}\uAC1C \uBC84\uBE14\uC744 \uC81C\uAC70\uD588\uC5B4\uC694. \uCF64\uBCF4 ${state.combo}!`
      );
      if (state.combo > 1) {
        addPopup(getComboCheer(state.combo), CONFIG.launcherX, CONFIG.launcherY - 120, "#ffd166");
      }
    } else {
      state.combo = 0;
      state.missStreak += 1;
      updateStatus(`${PLAYER_NAME}, ${randomFrom(MISS_LINES)} \uB9E4\uCE58 \uC2E4\uD328 ${state.missStreak}/${CONFIG.missLimit}.`);
      if (state.missStreak >= CONFIG.missLimit) {
        state.missStreak = 0;
        descendBoard(CONFIG.descendPenaltyStep, true);
        addPopup("Pressure Drop", CONFIG.launcherX, CONFIG.dangerLineY - 32, "#ff8f8f");
        updateStatus(`${PLAYER_NAME}, 5\uBC88 \uC5F0\uC18D \uC2E4\uD328\uB85C \uBCBD\uC774 \uB354 \uB0B4\uB824\uC654\uC5B4\uC694. \uB2E4\uC2DC \uB9AC\uB4EC\uC744 \uC7A1\uC544\uBD10\uC694.`);
      }
    }

    if (getRemainingBubbleCount() === 0) {
      queueStageClear();
    }

    checkDangerState();
    updateHud();
    updateLauncherPreview();
  }

  function stepProjectile(dt) {
    if (!state.projectile) {
      return;
    }
    const stepCount = Math.max(1, Math.ceil((CONFIG.projectileSpeed * dt) / 10));
    const subStep = dt / stepCount;

    for (let step = 0; step < stepCount; step += 1) {
      state.projectile.x += state.projectile.vx * subStep;
      state.projectile.y += state.projectile.vy * subStep;

      if (state.projectile.x <= CONFIG.fieldLeft + CONFIG.bubbleRadius && state.projectile.vx < 0) {
        state.projectile.x = CONFIG.fieldLeft + CONFIG.bubbleRadius;
        state.projectile.vx *= -1;
      } else if (state.projectile.x >= CONFIG.fieldRight - CONFIG.bubbleRadius && state.projectile.vx > 0) {
        state.projectile.x = CONFIG.fieldRight - CONFIG.bubbleRadius;
        state.projectile.vx *= -1;
      }

      const topLimit = CONFIG.topPadding + state.boardOffsetY;
      if (state.projectile.y <= topLimit) {
        const snapCell = findSnapCell(state.projectile.x, topLimit);
        resolveShot(snapCell);
        return;
      }

      if (findCollisionAt(state.projectile.x, state.projectile.y)) {
        const snapCell = findSnapCell(state.projectile.x, state.projectile.y);
        resolveShot(snapCell);
        return;
      }
    }
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.985;
      particle.vy = particle.vy * 0.985 + 420 * dt;
      return particle.life > 0;
    });

    state.popups = state.popups.filter((popup) => {
      popup.life -= dt * 1.2;
      popup.y -= 38 * dt;
      return popup.life > 0;
    });

    state.flashLevel = Math.max(0, state.flashLevel - dt * 1.8);
  }

  function stepGame(dt) {
    if (state.mode !== "playing") {
      updateParticles(dt);
      return;
    }

    state.descendElapsed += dt * 1000;
    if (state.descendElapsed >= CONFIG.descendIntervalMs) {
      descendBoard(CONFIG.descendHalfStep);
      updateStatus(`${PLAYER_NAME}, \uC2DC\uAC04\uC774 \uC9C0\uB098 \uBC84\uBE14 \uBCBD\uC774 \uC870\uAE08 \uB0B4\uB824\uC654\uC5B4\uC694.`);
    }

    stepProjectile(dt);
    updateParticles(dt);
    checkDangerState();
    updateHud();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const panelGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    panelGradient.addColorStop(0, "#0f2448");
    panelGradient.addColorStop(0.4, "#13213f");
    panelGradient.addColorStop(1, "#120f24");
    ctx.fillStyle = panelGradient;
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 22);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = 0.16;
    for (let row = 0; row < 11; row += 1) {
      const y = CONFIG.topPadding - 10 + row * 48;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CONFIG.fieldLeft + 8, y);
      ctx.lineTo(CONFIG.fieldRight - 8, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 3;
    ctx.strokeRect(CONFIG.fieldLeft, 26, CONFIG.fieldRight - CONFIG.fieldLeft, CONFIG.dangerLineY - 24);

    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "rgba(255, 116, 116, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CONFIG.fieldLeft + 6, CONFIG.dangerLineY);
    ctx.lineTo(CONFIG.fieldRight - 6, CONFIG.dangerLineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 140, 140, 0.9)";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText("위험선", CONFIG.fieldRight - 58, CONFIG.dangerLineY - 8);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(CONFIG.launcherX, CONFIG.launcherY + 22, 46, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDedicationStamp() {
    ctx.save();
    ctx.fillStyle = "rgba(124, 245, 214, 0.14)";
    roundRect(ctx, CONFIG.fieldLeft + 14, 34, 166, 46, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(124, 245, 214, 0.34)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "rgba(124, 245, 214, 0.94)";
    ctx.font = "700 13px Trebuchet MS";
    ctx.fillText(`${PLAYER_NAME} CUSTOM`, CONFIG.fieldLeft + 28, 54);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.font = "700 11px Trebuchet MS";
    ctx.fillText(getStageTheme(state.stage), CONFIG.fieldLeft + 28, 71);
    ctx.restore();
  }

  function drawBubble(x, y, color, radius = CONFIG.bubbleRadius, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const gradient = ctx.createRadialGradient(
      x - radius * 0.4,
      y - radius * 0.45,
      radius * 0.2,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, mixColor(color, 0.64));
    gradient.addColorStop(0.52, color);
    gradient.addColorStop(1, mixColor(color, -0.38));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
    ctx.beginPath();
    ctx.arc(x - radius * 0.28, y - radius * 0.34, radius * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBoardBubbles() {
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = getBubble(row, col);
        if (!bubble) {
          continue;
        }
        const center = getCellCenter(row, col);
        drawBubble(center.x, center.y, bubble.color);
      }
    }
  }

  function drawAimGuide() {
    if (!state.aiming || state.projectile || state.mode !== "playing") {
      return;
    }

    let x = CONFIG.launcherX;
    let y = CONFIG.launcherY;
    let vx = Math.cos(state.aimAngle);
    let vy = Math.sin(state.aimAngle);

    ctx.save();
    for (let index = 0; index < 24; index += 1) {
      x += vx * 18;
      y += vy * 18;

      if (x <= CONFIG.fieldLeft + CONFIG.bubbleRadius) {
        x = CONFIG.fieldLeft + CONFIG.bubbleRadius + (CONFIG.fieldLeft + CONFIG.bubbleRadius - x);
        vx *= -1;
      } else if (x >= CONFIG.fieldRight - CONFIG.bubbleRadius) {
        x = CONFIG.fieldRight - CONFIG.bubbleRadius - (x - (CONFIG.fieldRight - CONFIG.bubbleRadius));
        vx *= -1;
      }

      if (y <= CONFIG.topPadding + state.boardOffsetY - 8) {
        break;
      }

      ctx.globalAlpha = 0.18 + index * 0.02;
      ctx.fillStyle = "#f8fbff";
      ctx.beginPath();
      ctx.arc(x, y, 4 - index * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLauncher() {
    ctx.save();
    ctx.translate(CONFIG.launcherX, CONFIG.launcherY + 20);
    ctx.rotate(state.mode === "playing" ? state.aimAngle + Math.PI / 2 : 0);
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    roundRect(ctx, -15, -48, 30, 64, 14);
    ctx.fill();
    ctx.restore();

    if (!state.projectile && state.currentBubble) {
      drawBubble(CONFIG.launcherX, CONFIG.launcherY, state.currentBubble.color);
    }

    if (state.projectile) {
      drawBubble(state.projectile.x, state.projectile.y, state.projectile.color);
    }

    if (state.nextBubble) {
      drawBubble(CONFIG.fieldRight - 40, CONFIG.launcherY + 6, state.nextBubble.color, 18, 0.9);
      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.font = "700 12px Trebuchet MS";
      ctx.fillText("NEXT", CONFIG.fieldRight - 61, CONFIG.launcherY - 25);
    }
  }

  function drawParticles() {
    for (const particle of state.particles) {
      ctx.save();
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const popup of state.popups) {
      ctx.save();
      ctx.globalAlpha = clamp(popup.life, 0, 1);
      ctx.fillStyle = popup.color;
      ctx.font = "700 22px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(popup.text, popup.x, popup.y);
      ctx.restore();
    }
  }

  function drawWarningOverlay() {
    const lowest = getLowestBubbleBottom();
    if (lowest < CONFIG.dangerLineY - 56 && state.flashLevel <= 0) {
      return;
    }
    const intensity = clamp(
      Math.max((lowest - (CONFIG.dangerLineY - 70)) / 90, 0) * 0.28 + state.flashLevel * 0.2,
      0,
      0.4
    );
    ctx.save();
    const overlay = ctx.createLinearGradient(0, CONFIG.dangerLineY - 120, 0, canvas.height);
    overlay.addColorStop(0, `rgba(255, 90, 90, ${intensity * 0.15})`);
    overlay.addColorStop(1, `rgba(255, 90, 90, ${intensity})`);
    ctx.fillStyle = overlay;
    ctx.fillRect(CONFIG.fieldLeft, CONFIG.dangerLineY - 110, CONFIG.fieldRight - CONFIG.fieldLeft, canvas.height);
    ctx.restore();
  }

  function drawMissCounter() {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText(`${PLAYER_NAME}\uC758 \uC2E4\uC218 ${state.missStreak}/${CONFIG.missLimit}`, CONFIG.fieldLeft + 18, CONFIG.launcherY - 30);
    ctx.restore();
  }

  function render() {
    drawBackground();
    drawDedicationStamp();
    drawAimGuide();
    drawBoardBubbles();
    drawLauncher();
    drawParticles();
    drawWarningOverlay();
    drawMissCounter();
  }

  function gameLoop(timestamp) {
    if (!state.lastTime) {
      state.lastTime = timestamp;
    }
    const dt = clamp((timestamp - state.lastTime) / 1000, 0, 0.032);
    state.lastTime = timestamp;

    stepGame(dt);
    render();

    state.animationFrameId = window.requestAnimationFrame(gameLoop);
  }

  function handlePrimaryAction() {
    switch (state.overlayPrimaryAction) {
      case "resume":
        hideOverlay(stateScreen);
        state.mode = "playing";
        updateStatus(`${PLAYER_NAME}, \uB2E4\uC2DC \uBC84\uBE14\uC1FC \uC2DC\uC791!`);
        break;
      case "restart":
        resetRun(state.stage);
        break;
      case "nextStage":
        state.score += state.stage * 300;
        resetRun(state.stage + 1, true);
        break;
      case "newGame":
        resetRun(1);
        break;
      default:
        break;
    }
    updateHud();
  }

  function handleSecondaryAction() {
    switch (state.overlaySecondaryAction) {
      case "restart":
        resetRun(state.stage);
        break;
      case "newGame":
        resetRun(1);
        break;
      default:
        break;
    }
    updateHud();
  }

  function goHome() {
    state.mode = "title";
    state.stage = 1;
    state.score = 0;
    state.projectile = null;
    state.aiming = false;
    state.combo = 0;
    state.missStreak = 0;
    state.descendElapsed = 0;
    state.boardOffsetY = 0;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.stageClearQueued = false;
    state.flashLevel = 0;
    state.board = createEmptyBoard();
    state.currentBubble = null;
    state.nextBubble = null;
    state.particles = [];
    state.popups = [];
    boardStage.classList.remove("warning", "shake");
    showElement(titleScreen);
    hideOverlay(stateScreen);
    updateStatus(`${PLAYER_NAME}, \uC2DC\uC791 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uCCAB \uC2A4\uD14C\uC774\uC9C0\uAC00 \uC5F4\uB824\uC694.`);
    updateHud();
    updateLauncherPreview();
  }

  pauseButton.addEventListener("click", togglePause);
  startGameButton.addEventListener("click", () => resetRun(1));
  primaryActionButton.addEventListener("click", handlePrimaryAction);
  secondaryActionButton.addEventListener("click", handleSecondaryAction);
  homeActionButton.addEventListener("click", goHome);

  canvas.addEventListener("pointerdown", (event) => {
    const point = getCanvasCoordinates(event);
    beginAim(point.x, point.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = getCanvasCoordinates(event);
    updateAim(point.x, point.y);
  });

  canvas.addEventListener("pointerup", fireBubble);
  canvas.addEventListener("pointerleave", () => {
    if (state.aiming) {
      fireBubble();
    }
  });
  canvas.addEventListener("pointercancel", () => {
    state.aiming = false;
  });

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      if (state.mode === "playing" && state.aiming) {
        fireBubble();
      } else {
        togglePause();
      }
    }
    if (event.code === "Escape") {
      togglePause();
    }
  });

  updateHud();
  updateStatus("시작 버튼을 누르면 스테이지 1이 열립니다.");
  updateLauncherPreview();
  render();
  state.animationFrameId = window.requestAnimationFrame(gameLoop);
})();

