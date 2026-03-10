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
  const appShell = document.getElementById("appShell");
  const gameCard = document.getElementById("gameCard");
  const boardHeader = document.getElementById("boardHeader");
  const canvasFrame = document.getElementById("canvasFrame");
  const launcherPanel = document.getElementById("launcherPanel");
  const hud = document.querySelector(".hud");

  const CONFIG = {
    viewWidth: 420,
    viewHeight: 700,
    fieldLeft: 18,
    fieldRight: 402,
    topPadding: 72,
    bubbleRadius: 22,
    columns: 8,
    rowStep: 38,
    descendIntervalMs: 12000,
    descendHalfStep: 19,
    descendPenaltyStep: 38,
    missLimit: 5,
    projectileSpeed: 760,
    launcherX: 210,
    launcherY: 632,
    dangerLineY: 534,
    boardSearchRows: 20,
    colors: ["#ff6b6b", "#ffd166", "#4ecdc4", "#5f7bff", "#c77dff"],
  };

  canvas.width = CONFIG.viewWidth;
  canvas.height = CONFIG.viewHeight;

  const BUBBLE_DIAMETER = CONFIG.bubbleRadius * 2;
  const GRID_START_X = (CONFIG.viewWidth - (CONFIG.columns * BUBBLE_DIAMETER + CONFIG.bubbleRadius)) / 2 + CONFIG.bubbleRadius;
  const PLAYER_NAME = "\uD604\uC11C";
  const TOTAL_STAGES = 20;
  const CHAPTER_THEMES = [
    "\uC624\uD504\uB2DD \uD30C\uB3D9",
    "\uBBF8\uB7EC \uB9AC\uB4EC",
    "\uD504\uB9AC\uC998 \uB77C\uBCF4",
    "\uD53C\uB0A0\uB808 \uB7EC\uC2DC",
  ];
  const BOSS_PROFILES = [
    {
      name: "\uD06C\uB9AC\uD37C",
      kind: "creeper",
      accent: "#7cff6f",
      secondary: "#234b28",
      aura: "rgba(125, 255, 142, 0.34)",
    },
    {
      name: "\uD55C\uB2C8\uBC1C \uB809\uD130",
      kind: "hannibal",
      accent: "#ffb173",
      secondary: "#6b211f",
      aura: "rgba(255, 166, 108, 0.32)",
      expressions: ["cold", "glare", "smirk", "amused"],
    },
    {
      name: "\uC708\uD130",
      kind: "winter",
      accent: "#9edfff",
      secondary: "#bfd3ff",
      aura: "rgba(173, 231, 255, 0.34)",
      expressions: ["smile", "wink", "focus", "surprised"],
    },
    {
      name: "\uACE0\uC2A4\uD2B8\uD398\uC774\uC2A4",
      kind: "ghostface",
      accent: "#f0f3ff",
      secondary: "#1e2237",
      aura: "rgba(223, 227, 255, 0.28)",
    },
  ];
  const BOSS_NAMES = BOSS_PROFILES.map((profile) => profile.name);
  const BOSS_ACTION_TEXT = {
    recolor: "\uC0C9 \uAD50\uB780",
    add: "\uBC84\uBE14 \uCD94\uAC00",
    shuffle: "\uBC30\uCE58 \uAD50\uB780",
  };
  const BOSS_DIALOGUES = {
  "creeper": {
    "kicker": "Boss Alert",
    "intro": "\ud604\uc11c, \ud06c\ub9ac\ud37c\uac00 \ubc84\ube14 \ubcbd \uc704\uc5d0\uc11c \uc26c\uc775\uac70\ub9ac\uba70 \ud3ed\ubc1c \ud0c0\uc774\ubc0d\uc744 \uc7ac\uace0 \uc788\uc5b4\uc694.",
    "ability": "\uc0c9\uc744 \ub4a4\ud2c0\uace0 \ube48 \uce78\uc5d0 \ubc84\ube14\uc744 \uc2ec\uc73c\uba70 \ubc30\uce58\ub97c \ud1b5\uc9f8\ub85c \ud5dd\ud074\uc5b4\ub728\ub9ac\ub824\uace0 \ud569\ub2c8\ub2e4.",
    "entryStatus": "\ud604\uc11c, \ud06c\ub9ac\ud37c\uc758 \ud3ed\ubc1c \ub9ac\ub4ec\ubcf4\ub2e4 \uc815\ud655\ud55c \uac01\ub3c4\uac00 \uba3c\uc800\uc608\uc694.",
    "clear": "\ud06c\ub9ac\ud37c\uc758 \ud3ed\ubc1c \ud328\ud134\uc744 \uc77d\uc5b4\ub0b4\uace0 \ubc84\ube14 \ubcbd\uc744 \ub2e4\uc2dc \uc7a5\uc545\ud588\uc5b4\uc694.",
    "enterPopup": "CREEPER",
    "taunts": {
      "recolor": [
        "\uc26c\uc775... \uc0c9\ubd80\ud130 \ubc14\uafd4\ubc84\ub9b4\uac8c.",
        "\ud604\uc11c, \ubc29\uae08 \uc678\uc6b4 \uc0c9\uc740 \uc774\uc81c \ud2c0\ub838\uc5b4."
      ],
      "add": [
        "\ud55c \uce78 \ub354 \uc2ec\uc5b4\ub458\uac8c.",
        "\ubc84\ube14 \ud558\ub098 \ub354. \uae38\uc744 \ub9c9\uc544\ubcfc\uae4c?"
      ],
      "shuffle": [
        "\ud53d\uc140 \uae38 \uc804\uccb4\ub97c \uac08\uc544\uc5ce\ub294\ub2e4!",
        "\ubc29\uae08 \uc678\uc6b4 \ubc30\uce58\ub294 \uc78a\uc5b4\ubc84\ub824."
      ]
    }
  },
  "hannibal": {
    "kicker": "Boss Cinema",
    "intro": "\ud55c\ub2c8\ubc1c \ub809\ud130\uac00 \ucc28\uac11\uac8c \ubbf8\uc18c \uc9c0\uc73c\uba70 \ud310\uc744 \ud574\uccb4\ud560 \uc900\ube44\ub97c \ub9c8\ucce4\uc5b4\uc694.",
    "ability": "\uc815\uad50\ud55c \uc0c9 \uad50\ub780\uacfc \ubc30\uce58 \uad50\ub780\uc73c\ub85c \ud604\uc11c\uc758 \ub9ac\ub4ec\uc744 \ubb34\ub108\ub728\ub9ac\ub824\uace0 \ud569\ub2c8\ub2e4.",
    "entryStatus": "\ud604\uc11c, \uce68\ucc29\ud558\uac8c \uac01\ub3c4\ub9cc \uc9c0\ud0a4\uba74 \ud55c\ub2c8\ubc1c\uc758 \uc2ec\ub9ac\uc804\ub3c4 \ud754\ub4e4 \uc218 \uc788\uc5b4\uc694.",
    "clear": "\ud55c\ub2c8\ubc1c \ub809\ud130\uc758 \uc2ec\ub9ac\uc804 \uc18d\uc5d0\uc11c\ub3c4 \ud604\uc11c\uc758 \uc0f7 \ub9ac\ub4ec\uc774 \ubb34\ub108\uc9c0\uc9c0 \uc54a\uc558\uc5b4\uc694.",
    "enterPopup": "LECTER",
    "taunts": {
      "recolor": [
        "\uc0c9\uc758 \uc9c8\uc11c\ub97c \uc870\uae08 \ubc14\uafd4\ubcf4\uc8e0.",
        "\ud604\uc11c, \uc774 \ud55c \uc218\ub85c \ud750\ub984\uc774 \ud750\ud2b8\ub7ec\uc9c8 \uac81\ub2c8\ub2e4."
      ],
      "add": [
        "\ud310 \uc704\uc5d0 \ud55c \uc218\ub97c \ub354 \uc62c\ub824\ub450\uc8e0.",
        "\ube48 \uc790\ub9ac\ub3c4 \uc804\ubd80 \uacc4\ud68d \uc548\uc5d0 \uc788\uc5c8\uc2b5\ub2c8\ub2e4."
      ],
      "shuffle": [
        "\ubc30\uce58\uac00 \ubb34\ub108\uc9c0\uba74 \ud310\ub2e8\ub3c4 \ud750\ub824\uc9d1\ub2c8\ub2e4.",
        "\ud604\uc11c, \uc9c0\uae08\ubd80\ud130\ub294 \ub208\uc774 \uc544\ub2c8\ub77c \ub9ac\ub4ec\uc73c\ub85c \uc313\uc544\uc57c \ud574\uc694."
      ]
    }
  },
  "winter": {
    "kicker": "Boss Stage",
    "intro": "\uc708\ud130\uac00 \ubc18\uc9dd\uc774\ub294 \uc560\ub2c8\ud48d \ubbf8\uc18c\ub85c \ubc84\ube14 \ud750\ub984\uc744 \ud754\ub4e4 \uc900\ube44\ub97c \ub05d\ub0c8\uc5b4\uc694.",
    "ability": "\ube60\ub978 \ud45c\uc815 \ubcc0\ud654\uc640 \ubc18\uc9dd\uc774\ub294 \uad50\ub780\uc73c\ub85c \ud604\uc11c\uc758 \uc608\uce21\uc744 \ud754\ub4ed\ub2c8\ub2e4.",
    "entryStatus": "\ud604\uc11c, \ub9ac\ub4ec\ub9cc \ub193\uce58\uc9c0 \uc54a\uc73c\uba74 \ubc18\uc9dd\uc774\ub294 \ud398\uc778\ud2b8\ub3c4 \ub3cc\ud30c\ud560 \uc218 \uc788\uc5b4\uc694.",
    "clear": "\uc708\ud130\uc758 \ud654\ub824\ud55c \uad50\ub780 \uc18d\uc5d0\uc11c\ub3c4 \ud604\uc11c\uac00 \ud15c\ud3ec\ub97c \ub05d\uae4c\uc9c0 \uc9c0\ucf1c\ub0c8\uc5b4\uc694.",
    "enterPopup": "WINTER",
    "taunts": {
      "recolor": [
        "\ubc18\uc9dd\uc774\ub294 \uc0c9\uc73c\ub85c \ub2e4\uc2dc \uc12d\uc5b4\ubcfc\uac8c!",
        "\ud604\uc11c, \uc774\ubc88\uc5d4 \uc870\uae08 \ub354 \ud654\ub824\ud558\uac8c \ud754\ub4e4\uc5b4\ubcfc\uac8c."
      ],
      "add": [
        "\ubc84\ube14 \ud558\ub098 \ub354! \ub9ac\ub4ec \ud754\ub4e4 \uc900\ube44\ub410\uc9c0?",
        "\ube48 \uc790\ub9ac\ub3c4 \uc7a0\uae50 \ucc44\uc6cc\ub458\uac8c."
      ],
      "shuffle": [
        "\ubc30\uce58\ub97c \uc0b4\uc9dd \uaf2c\uc544\ubcfc\uac8c!",
        "\ud604\uc11c, \uc9c0\uae08\ubd80\ud130\ub294 \uc21c\uac04 \ubc18\uc751\uc774\uc57c."
      ]
    }
  },
  "ghostface": {
    "kicker": "Final Boss",
    "intro": "\uace0\uc2a4\ud2b8\ud398\uc774\uc2a4\uac00 \uc870\uc6a9\ud788 \ub5a0\uc624\ub974\uba70 \ub9c8\uc9c0\ub9c9 \ubcf4\uc2a4\uc804 \uc804\uccb4\ub97c \uacf5\ud3ec\uac10\uc73c\ub85c \ub36e\uace0 \uc788\uc5b4\uc694.",
    "ability": "\uadf8\ub9bc\uc790 \uc794\uc0c1\uacfc \ube44\uba85 \ud30c\ub3d9\uc73c\ub85c \ub9c8\uc9c0\ub9c9 \ubc30\uce58\ub97c \uacc4\uc18d \ub4a4\ud2c0\uc5b4\ub193\uc2b5\ub2c8\ub2e4.",
    "entryStatus": "\ud604\uc11c, \ub9c8\uc9c0\ub9c9\uae4c\uc9c0 \uce68\ucc29\ud558\uba74 \uace0\uc2a4\ud2b8\ud398\uc774\uc2a4\uc758 \uacf5\ud3ec \uc5f0\ucd9c\ub3c4 \ubc84\ud2f8 \uc218 \uc788\uc5b4\uc694.",
    "clear": "\uace0\uc2a4\ud2b8\ud398\uc774\uc2a4\uc758 \uacf5\ud3ec \uc5f0\ucd9c\uc744 \ub6ab\uace0 \ud604\uc11c\uac00 \ucd5c\uc885 \ubcf4\uc2a4\ub97c \uc81c\uc555\ud588\uc5b4\uc694.",
    "enterPopup": "SCREAM",
    "taunts": {
      "recolor": [
        "\ub2e4\uc74c \uc0c9\uc744 \ubbff\uc740 \uc21c\uac04 \ud2c0\ub838\uc5b4.",
        "\ud604\uc11c, \uc815\ub2f5\uc774\uc5c8\ub358 \uc0c9\uc740 \uc774\ubbf8 \uc0ac\ub77c\uc84c\uc5b4."
      ],
      "add": [
        "\ube44\uc5b4 \uc788\ub358 \uc790\ub9ac\ub3c4 \uc548\uc804\ud558\uc9c0 \uc54a\uc544.",
        "\uc870\uc6a9\ud788 \ud558\ub098 \ub354 \ub0a8\uaca8\ub450\uc9c0."
      ],
      "shuffle": [
        "\uc5b4\ub290 \uc704\uce58\uac00 \uc9c4\uc9dc\uc778\uc9c0 \ub9de\ud600\ubd10.",
        "\ud604\uc11c, \ubc29\uae08 \ubcf8 \ubc30\uce58\ub294 \uc774\ubbf8 \ub2e4\ub978 \ubaa8\uc2b5\uc774\uc57c."
      ]
    }
  }
};
  const MISS_LINES = [
    "\uC774\uBC88 \uC0F7\uC740 \uC544\uC27D\uC9C0\uB9CC \uC544\uC9C1 \uD750\uB984\uC740 \uC0B4\uC544 \uC788\uC5B4\uC694.",
    "\uAC01\uB3C4\uB97C \uC870\uAE08\uB9CC \uB354 \uB2E4\uB4EC\uC73C\uBA74 \uBC14\uB85C \uD130\uC9C8 \uAC83 \uAC19\uC544\uC694.",
    "\uB2E4\uC74C \uD55C \uBC1C\uC774 \uD604\uC11C\uC758 \uD558\uC774\uB77C\uC774\uD2B8\uAC00 \uB420 \uC218\uB3C4 \uC788\uC5B4\uC694.",
  ];


  let responsiveLayoutFrame = 0;
  let audioContext = null;
  let noiseBuffer = null;

  const state = {
    mode: "title",
    stage: 1,
    score: 0,
    combo: 0,
    missStreak: 0,
    boardOffsetY: 0,
    descendElapsed: 0,
    descendIntervalMs: CONFIG.descendIntervalMs,
    board: [],
    currentBubble: null,
    nextBubble: null,
    projectile: null,
    aiming: false,
    aimAngle: -Math.PI / 2,
    particles: [],
    popups: [],
    boss: null,
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

  function readPx(styles, propertyName) {
    return parseFloat(styles[propertyName]) || 0;
  }

  function getViewportSize() {
    const viewport = window.visualViewport;
    return {
      width: Math.round(viewport ? viewport.width : window.innerWidth),
      height: Math.round(viewport ? viewport.height : window.innerHeight),
    };
  }

  function syncResponsiveLayout() {
    if (!appShell || !gameCard || !hud || !boardHeader || !canvasFrame || !launcherPanel) {
      return;
    }

    const viewportSize = getViewportSize();
    const isPhonePortrait = viewportSize.width <= 640 && viewportSize.height >= viewportSize.width;
    const isWideDesktop = !isPhonePortrait && viewportSize.width >= 960;
    const layoutMode = isPhonePortrait ? "phone-portrait" : isWideDesktop ? "desktop-wide" : "desktop-compact";

    document.body.dataset.layout = layoutMode;
    canvas.style.width = "";
    canvas.style.height = "";

    const frameStyles = getComputedStyle(canvasFrame);
    const frameInnerWidth =
      canvasFrame.clientWidth - readPx(frameStyles, "paddingLeft") - readPx(frameStyles, "paddingRight");
    const frameInnerHeight =
      canvasFrame.clientHeight - readPx(frameStyles, "paddingTop") - readPx(frameStyles, "paddingBottom");

    if (frameInnerWidth <= 0 || frameInnerHeight <= 0) {
      return;
    }

    const naturalAspect = CONFIG.viewHeight / CONFIG.viewWidth;
    const targetWidth = Math.min(frameInnerWidth, frameInnerHeight / naturalAspect);
    const targetHeight = targetWidth * naturalAspect;

    canvas.style.width = `${Math.floor(targetWidth)}px`;
    canvas.style.height = `${Math.floor(targetHeight)}px`;
  }

  function requestResponsiveLayout() {
    if (responsiveLayoutFrame) {
      return;
    }
    responsiveLayoutFrame = window.requestAnimationFrame(() => {
      responsiveLayoutFrame = 0;
      syncResponsiveLayout();
    });
  }

  function getAudioContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }
    if (!audioContext) {
      audioContext = new AudioCtor();
    }
    return audioContext;
  }

  function unlockAudio() {
    const ctx = getAudioContext();
    if (!ctx) {
      return null;
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function getNoiseBuffer(ctx) {
    if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
      return noiseBuffer;
    }
    const duration = 0.2;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }
    noiseBuffer = buffer;
    return buffer;
  }

  function scheduleTone(ctx, options) {
    const start = Math.max(ctx.currentTime, options.start ?? ctx.currentTime);
    const duration = options.duration ?? 0.12;
    const frequency = Math.max(50, options.frequency ?? 440);
    const frequencyEnd = Math.max(50, options.frequencyEnd ?? frequency);
    const peakGain = Math.max(0.0001, options.gain ?? 0.04);
    const endGain = Math.max(0.0001, options.gainEnd ?? 0.0001);
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = options.type ?? "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (frequencyEnd !== frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(frequencyEnd, start + duration);
    }

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, start + Math.min(0.02, duration * 0.35));
    gainNode.gain.exponentialRampToValueAtTime(endGain, start + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function scheduleNoise(ctx, options) {
    const start = Math.max(ctx.currentTime, options.start ?? ctx.currentTime);
    const duration = options.duration ?? 0.08;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    source.buffer = getNoiseBuffer(ctx);
    filter.type = options.filterType ?? "bandpass";
    filter.frequency.setValueAtTime(options.filterFrequency ?? 900, start);
    if (options.filterFrequencyEnd) {
      filter.frequency.exponentialRampToValueAtTime(options.filterFrequencyEnd, start + duration);
    }
    if (options.q) {
      filter.Q.setValueAtTime(options.q, start);
    }

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(options.gain ?? 0.025, start + Math.min(0.015, duration * 0.4));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(start);
    source.stop(start + duration + 0.03);
  }

  function playShotSound() {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: "triangle",
      start,
      duration: 0.11,
      frequency: 760,
      frequencyEnd: 300,
      gain: 0.05,
    });
    scheduleTone(ctx, {
      type: "sine",
      start: start + 0.015,
      duration: 0.08,
      frequency: 520,
      frequencyEnd: 210,
      gain: 0.022,
    });
  }

  function playMatchSound(matchCount, combo) {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    const hitCount = Math.min(4, Math.max(2, Math.floor(matchCount / 2) + 1));
    for (let index = 0; index < hitCount; index += 1) {
      const frequency = 360 + index * 110 + Math.min(combo, 4) * 22;
      scheduleTone(ctx, {
        type: "sine",
        start: start + index * 0.032,
        duration: 0.1,
        frequency,
        frequencyEnd: frequency * 1.18,
        gain: 0.036,
      });
    }
    if (combo > 1) {
      scheduleTone(ctx, {
        type: "triangle",
        start: start + 0.05,
        duration: 0.16,
        frequency: 680,
        frequencyEnd: 980,
        gain: 0.02,
      });
    }
  }

  function playDropSound(dropCount) {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: "triangle",
      start,
      duration: 0.16,
      frequency: 260,
      frequencyEnd: 120,
      gain: 0.038,
    });
    scheduleNoise(ctx, {
      start: start + 0.01,
      duration: 0.11,
      gain: Math.min(0.05, 0.018 + dropCount * 0.0025),
      filterFrequency: 520,
      filterFrequencyEnd: 240,
      q: 0.8,
    });
  }

  function playDescendSound(fromPenalty) {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: fromPenalty ? "sawtooth" : "triangle",
      start,
      duration: fromPenalty ? 0.22 : 0.16,
      frequency: fromPenalty ? 180 : 210,
      frequencyEnd: 90,
      gain: fromPenalty ? 0.05 : 0.03,
    });
    scheduleNoise(ctx, {
      start: start + 0.01,
      duration: fromPenalty ? 0.14 : 0.09,
      gain: fromPenalty ? 0.03 : 0.018,
      filterType: "lowpass",
      filterFrequency: fromPenalty ? 700 : 520,
      filterFrequencyEnd: 180,
    });
  }

  function playStageClearSound() {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((frequency, index) => {
      scheduleTone(ctx, {
        type: "triangle",
        start: start + index * 0.08,
        duration: 0.18,
        frequency,
        frequencyEnd: frequency * 1.04,
        gain: 0.03,
      });
    });
  }

  function playGameOverSound() {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: "sawtooth",
      start,
      duration: 0.24,
      frequency: 320,
      frequencyEnd: 150,
      gain: 0.036,
    });
    scheduleTone(ctx, {
      type: "triangle",
      start: start + 0.12,
      duration: 0.28,
      frequency: 180,
      frequencyEnd: 90,
      gain: 0.03,
    });
  }

  function getBossScript(boss = state.boss) {
    if (!boss) {
      return BOSS_DIALOGUES.creeper;
    }
    return BOSS_DIALOGUES[boss.kind] || BOSS_DIALOGUES.creeper;
  }

  function getBossActionLine(actionKey, boss = state.boss) {
    const script = getBossScript(boss);
    const pool = script.taunts[actionKey] || [];
    return pool.length > 0 ? randomFrom(pool) : `${boss ? boss.name : "\uBCF4\uC2A4"}\uAC00 \uD310\uC744 \uD754\uB4E4\uACE0 \uC788\uC5B4\uC694.`;
  }

  function playBossIntroSound(boss = state.boss) {
    const ctx = unlockAudio();
    if (!ctx || !boss) {
      return;
    }
    const start = ctx.currentTime;
    if (boss.kind === "creeper") {
      scheduleTone(ctx, { type: "square", start, duration: 0.16, frequency: 196, frequencyEnd: 156, gain: 0.05 });
      scheduleTone(ctx, { type: "square", start: start + 0.14, duration: 0.18, frequency: 156, frequencyEnd: 110, gain: 0.04 });
      scheduleNoise(ctx, { start: start + 0.03, duration: 0.2, gain: 0.022, filterFrequency: 1600, filterFrequencyEnd: 520, q: 0.9 });
      return;
    }
    if (boss.kind === "hannibal") {
      scheduleTone(ctx, { type: "triangle", start, duration: 0.26, frequency: 220, frequencyEnd: 170, gain: 0.042 });
      scheduleTone(ctx, { type: "sine", start: start + 0.07, duration: 0.16, frequency: 760, frequencyEnd: 540, gain: 0.015 });
      scheduleNoise(ctx, { start: start + 0.03, duration: 0.16, gain: 0.012, filterType: "bandpass", filterFrequency: 1320, filterFrequencyEnd: 900, q: 6 });
      return;
    }
    if (boss.kind === "winter") {
      [698, 932, 1244].forEach((frequency, index) => {
        scheduleTone(ctx, {
          type: index === 2 ? "sine" : "triangle",
          start: start + index * 0.06,
          duration: 0.16,
          frequency,
          frequencyEnd: frequency * 1.06,
          gain: 0.025,
        });
      });
      scheduleNoise(ctx, { start: start + 0.01, duration: 0.08, gain: 0.008, filterType: "highpass", filterFrequency: 2400, filterFrequencyEnd: 3400, q: 0.7 });
      return;
    }
    scheduleTone(ctx, { type: "sawtooth", start, duration: 0.28, frequency: 520, frequencyEnd: 110, gain: 0.028 });
    scheduleNoise(ctx, { start: start + 0.02, duration: 0.28, gain: 0.024, filterType: "bandpass", filterFrequency: 980, filterFrequencyEnd: 340, q: 0.8 });
    scheduleTone(ctx, { type: "sine", start: start + 0.15, duration: 0.22, frequency: 170, frequencyEnd: 82, gain: 0.016 });
  }

  function playBossActionSound(actionKey, boss = state.boss) {
    const ctx = unlockAudio();
    if (!ctx || !boss) {
      return;
    }
    const start = ctx.currentTime;
    const offset = actionKey === "recolor" ? 0 : actionKey === "add" ? 60 : 120;
    if (boss.kind === "creeper") {
      scheduleTone(ctx, { type: "square", start, duration: 0.11, frequency: 180 + offset, frequencyEnd: 120 + offset * 0.2, gain: 0.038 });
      scheduleNoise(ctx, { start: start + 0.01, duration: 0.09, gain: 0.018, filterFrequency: 1700, filterFrequencyEnd: 600, q: 1 });
      return;
    }
    if (boss.kind === "hannibal") {
      scheduleTone(ctx, { type: "triangle", start, duration: 0.12, frequency: 260 + offset * 0.35, frequencyEnd: 210, gain: 0.03 });
      scheduleTone(ctx, { type: "sine", start: start + 0.04, duration: 0.08, frequency: 720, frequencyEnd: 560, gain: 0.012 });
      return;
    }
    if (boss.kind === "winter") {
      scheduleTone(ctx, { type: "sine", start, duration: 0.1, frequency: 720 + offset, frequencyEnd: 980 + offset * 0.3, gain: 0.022 });
      scheduleTone(ctx, { type: "triangle", start: start + 0.03, duration: 0.08, frequency: 980 + offset * 0.4, frequencyEnd: 1180 + offset * 0.45, gain: 0.014 });
      return;
    }
    scheduleNoise(ctx, { start, duration: 0.12, gain: 0.02, filterType: "bandpass", filterFrequency: 860 - offset * 1.2, filterFrequencyEnd: 300, q: 0.75 });
    scheduleTone(ctx, { type: "sawtooth", start: start + 0.01, duration: 0.16, frequency: 360 - offset * 0.4, frequencyEnd: 130, gain: 0.018 });
  }

  function playBossDefeatSound(boss = state.boss) {
    const ctx = unlockAudio();
    if (!ctx || !boss) {
      return;
    }
    const start = ctx.currentTime + 0.12;
    if (boss.kind === "creeper") {
      scheduleTone(ctx, { type: "square", start, duration: 0.16, frequency: 130, frequencyEnd: 240, gain: 0.024 });
      scheduleNoise(ctx, { start: start + 0.02, duration: 0.1, gain: 0.014, filterFrequency: 900, filterFrequencyEnd: 2200, q: 0.6 });
      return;
    }
    if (boss.kind === "hannibal") {
      scheduleTone(ctx, { type: "triangle", start, duration: 0.18, frequency: 220, frequencyEnd: 330, gain: 0.024 });
      scheduleTone(ctx, { type: "sine", start: start + 0.1, duration: 0.14, frequency: 440, frequencyEnd: 554, gain: 0.014 });
      return;
    }
    if (boss.kind === "winter") {
      [660, 880, 1320].forEach((frequency, index) => {
        scheduleTone(ctx, { type: "sine", start: start + index * 0.05, duration: 0.12, frequency, frequencyEnd: frequency * 1.05, gain: 0.018 });
      });
      return;
    }
    scheduleTone(ctx, { type: "sawtooth", start, duration: 0.18, frequency: 180, frequencyEnd: 90, gain: 0.02 });
    scheduleTone(ctx, { type: "triangle", start: start + 0.14, duration: 0.14, frequency: 330, frequencyEnd: 420, gain: 0.016 });
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

  function isBossStage(stage) {
    return stage % 5 === 0;
  }

  function getBossLevel(stage) {
    return Math.floor(stage / 5);
  }

  function getSpeedTier(stage) {
    return Math.floor((stage - 1) / 5);
  }

  function getStageNumberLabel(stage) {
    return `${stage} / ${TOTAL_STAGES}`;
  }

  function getStageDescendInterval(stage) {
    return Math.max(7500, CONFIG.descendIntervalMs - getSpeedTier(stage) * 1500);
  }

  function getStageTheme(stage) {
    const chapterTheme = CHAPTER_THEMES[getSpeedTier(stage)] || CHAPTER_THEMES[CHAPTER_THEMES.length - 1];
    if (isBossStage(stage)) {
      return `\uBCF4\uC2A4 ${getBossLevel(stage)} - ${BOSS_NAMES[getBossLevel(stage) - 1]}`;
    }
    return `${chapterTheme} ${(stage - 1) % 5 + 1}`;
  }

  function isFinalStage(stage) {
    return stage >= TOTAL_STAGES;
  }

  function getStageLabel(stage) {
    return `Stage ${getStageNumberLabel(stage)} - ${getStageTheme(stage)}`;
  }

  function getStageStartMessage(stage) {
    if (isBossStage(stage)) {
      return `${PLAYER_NAME}, ${BOSS_NAMES[getBossLevel(stage) - 1]} \uBCF4\uC2A4\uAC00 \uB4F1\uC7A5\uD588\uC5B4\uC694. \uC0C9 \uAD50\uB780\uACFC \uBC30\uCE58 \uAD50\uB780\uC744 \uBC84\uD2F0\uBA70 \uBC84\uD2F0\uC5B4\uBCF4\uC138\uC694.`;
    }
    if ((stage + 1) % 5 === 0) {
      return `${PLAYER_NAME}, \uC774 \uB77C\uC6B4\uB4DC\uB97C \uB118\uAE30\uBA74 \uBC14\uB85C \uBCF4\uC2A4 \uC2A4\uD14C\uC774\uC9C0\uC608\uC694. \uAC01\uB3C4\uB97C \uB354 \uC815\uAD50\uD558\uAC8C \uB2E4\uB4EC\uC5B4\uBD10\uC694.`;
    }
    return `${PLAYER_NAME}, ${getStageTheme(stage)} \uC2DC\uC791! \uB9AC\uB4EC\uC744 \uC720\uC9C0\uD558\uBA70 \uBC84\uBE14 \uBCBD\uC744 \uBC00\uC5B4\uB0B4\uBCF4\uC138\uC694.`;
  }

  function getUpcomingHint(stage) {
    if (isFinalStage(stage)) {
      return `\uB9C8\uC9C0\uB9C9 \uC2A4\uD14C\uC774\uC9C0\uC5D0\uC120 ${PLAYER_NAME}\uB97C \uC704\uD55C \uD2B9\uBCC4 \uC5D4\uB529\uC774 \uAE30\uB2E4\uB824\uC694.`;
    }
    if (isBossStage(stage + 1)) {
      return `\uB2E4\uC74C\uC740 \uBCF4\uC2A4 \uC2A4\uD14C\uC774\uC9C0\uC608\uC694. ${BOSS_NAMES[getBossLevel(stage + 1) - 1]}\uAC00 \uD604\uC11C\uB97C \uAE30\uB2E4\uB824\uC694.`;
    }
    return `\uD604\uC7AC \uAD6C\uAC04\uC740 \uBC84\uBE14 \uBCBD \uD558\uAC15 \uC18D\uB3C4 ${Math.round(getStageDescendInterval(stage) / 100) / 10}\uCD08 \uD398\uC774\uC2A4\uB85C \uC720\uC9C0\uB3FC\uC694.`;
  }

  function getBossProfile(level) {
    return BOSS_PROFILES[clamp(level - 1, 0, BOSS_PROFILES.length - 1)];
  }

  function getBossActionDelay(level) {
    const min = Math.max(3.4, 7.8 - (level - 1) * 1.2);
    const max = Math.max(min + 0.8, 8.9 - (level - 1) * 1.35);
    return min + Math.random() * (max - min);
  }

  function getBossExpressionDelay(boss) {
    if (!boss || !boss.expressions || boss.expressions.length === 0) {
      return 99;
    }
    return boss.kind === "winter" ? 1.4 + Math.random() * 1.9 : 1.8 + Math.random() * 2.4;
  }

  function pickBossExpression(boss, actionKey = "") {
    if (!boss || !boss.expressions || boss.expressions.length === 0) {
      return "neutral";
    }

    if (boss.kind === "hannibal") {
      const mapped = {
        recolor: "glare",
        add: "cold",
        shuffle: "smirk",
      };
      if (mapped[actionKey]) {
        return mapped[actionKey];
      }
    }

    if (boss.kind === "winter") {
      const mapped = {
        recolor: "focus",
        add: "smile",
        shuffle: "surprised",
      };
      if (mapped[actionKey]) {
        return mapped[actionKey];
      }
    }

    const candidates = boss.expressions.filter((expression) => expression !== boss.expression);
    return randomFrom(candidates.length > 0 ? candidates : boss.expressions);
  }

  function createBossForStage(stage) {
    if (!isBossStage(stage)) {
      return null;
    }
    const level = getBossLevel(stage);
    const profile = getBossProfile(level);
    const expressions = profile.expressions || [];
    return {
      level,
      name: profile.name,
      kind: profile.kind,
      accent: profile.accent,
      secondary: profile.secondary,
      auraColor: profile.aura,
      expressions,
      expression: expressions.length > 0 ? randomFrom(expressions) : "neutral",
      expressionElapsed: 0,
      nextExpressionDelay: expressions.length > 0 ? getBossExpressionDelay({ kind: profile.kind, expressions }) : 99,
      effectAction: "",
      effectTimer: 0,
      pulse: 0,
      x: CONFIG.launcherX,
      direction: level % 2 === 0 ? -1 : 1,
      speed: 28 + level * 7,
      floatTime: Math.random() * Math.PI * 2,
      actionElapsed: 0,
      nextActionDelay: getBossActionDelay(level),
    };
  }

  function getStageFlavorLabel(stage) {
    return isBossStage(stage)
      ? `Boss Stage ${getBossLevel(stage)} - ${BOSS_NAMES[getBossLevel(stage) - 1]}`
      : `Normal Stage - ${getStageTheme(stage)}`;
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
    requestResponsiveLayout();
  }

  function updateLauncherPreview() {
    paintPreview(currentBubblePreview, state.currentBubble ? state.currentBubble.color : "#68708c");
    paintPreview(nextBubblePreview, state.nextBubble ? state.nextBubble.color : "#68708c");
  }

  function updateHud() {
    scoreValue.textContent = state.score.toLocaleString("ko-KR");
    comboValue.textContent = `${state.combo}`;
    stageValue.textContent = getStageNumberLabel(state.stage);
    pauseButton.disabled = state.mode === "title";
    pauseButton.textContent = state.mode === "paused" ? "\uACC4\uC18D\uD558\uAE30" : "\uC77C\uC2DC\uC815\uC9C0";

    if (stageFlavorText) {
      stageFlavorText.textContent = state.mode === "title"
        ? `20\uAC1C \uC2A4\uD14C\uC774\uC9C0 \uCC4C\uB9B0\uC9C0\uAC00 \uC900\uBE44 \uC911\uC774\uC5D0\uC694.`
        : getStageFlavorLabel(state.stage);
    }

    const descentProgress = state.mode === "title"
      ? 0
      : Math.min(state.descendElapsed / state.descendIntervalMs, 1);
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

  function showBossIntroCutscene(stage) {
    if (!state.boss) {
      return;
    }
    const boss = state.boss;
    const script = getBossScript(boss);
    state.mode = "bossIntro";
    addPopup(script.enterPopup || boss.name.toUpperCase(), CONFIG.launcherX, 152, boss.accent || "#ffd166");
    updateStatus(`${boss.name} \uB4F1\uC7A5! ${script.ability}`);
    showOverlay({
      kicker: script.kicker,
      title: `Stage ${getStageNumberLabel(stage)} - ${boss.name}`,
      message: `${script.intro} ${script.ability}`,
      primaryLabel: "\uBCF4\uC2A4\uC804 \uC2DC\uC791",
      primaryAction: "bossIntro",
      secondaryLabel: "",
      secondaryAction: "restart",
      showHome: false,
    });
    playBossIntroSound(boss);
  }

  function buildStage(stage) {
    const random = createSeededRandom(stage * 99173 + 17);
    const speedTier = getSpeedTier(stage);
    const bossStage = isBossStage(stage);
    const rows = bossStage ? 7 + speedTier : 6 + speedTier;
    const gapRate = bossStage ? 0.08 + speedTier * 0.012 : 0.12 + speedTier * 0.01;
    const patternMode = (stage - 1) % 4;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        let shouldFill = row < 2 || random() > gapRate;
        if (bossStage && row < 3) {
          shouldFill = true;
        }
        if (!shouldFill && row === rows - 1 && col % 2 === 0) {
          shouldFill = true;
        }
        if (!shouldFill) {
          continue;
        }

        let colorIndex;
        if (patternMode === 0) {
          colorIndex = (row + col + speedTier) % CONFIG.colors.length;
        } else if (patternMode === 1) {
          colorIndex = (row * 2 + Math.floor(col / 2) + speedTier) % CONFIG.colors.length;
        } else if (patternMode === 2) {
          colorIndex = Math.floor(random() * CONFIG.colors.length);
          if (col > 0 && random() < 0.42) {
            const leftBubble = getBubble(row, col - 1);
            if (leftBubble) {
              colorIndex = CONFIG.colors.indexOf(leftBubble.color);
            }
          }
        } else {
          const mirroredCol = CONFIG.columns - col - 1;
          colorIndex = (row + mirroredCol + Math.floor(random() * 2) + speedTier) % CONFIG.colors.length;
        }

        if (bossStage && row >= 3 && random() < 0.18) {
          colorIndex = (colorIndex + 1 + Math.floor(random() * 2)) % CONFIG.colors.length;
        }

        setBubble(row, col, createBubble(CONFIG.colors[colorIndex]));
      }
    }
  }

  function resetRun(stage = 1, preserveScore = false) {
    const boundedStage = clamp(stage, 1, TOTAL_STAGES);
    state.stage = boundedStage;
    state.score = preserveScore ? state.score : 0;
    state.combo = 0;
    state.missStreak = 0;
    state.boardOffsetY = 0;
    state.descendElapsed = 0;
    state.descendIntervalMs = getStageDescendInterval(boundedStage);
    state.projectile = null;
    state.aiming = false;
    state.flashLevel = 0;
    state.popups = [];
    state.particles = [];
    state.boss = createBossForStage(boundedStage);
    state.stageClearQueued = false;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.board = createEmptyBoard();
    buildStage(boundedStage);
    state.currentBubble = createBubble(pickBubbleColor());
    state.nextBubble = createBubble(pickBubbleColor());
    state.mode = "playing";
    hideOverlay(titleScreen);
    hideOverlay(stateScreen);
    boardStage.classList.remove("warning", "shake");
    checkDangerState();
    updateHud();
    updateLauncherPreview();
    addPopup(`STAGE ${getStageNumberLabel(boundedStage)}`, CONFIG.launcherX, 126, isBossStage(boundedStage) ? "#ff8fab" : "#ffd166");

    if (isBossStage(boundedStage) && state.boss) {
      showBossIntroCutscene(boundedStage);
      return;
    }

    updateStatus(getStageStartMessage(boundedStage));
  }

  function togglePause() {
    if (state.mode === "title" || state.mode === "gameover" || state.mode === "clear" || state.mode === "bossIntro") {
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


  function getOccupiedCells(maxRow = state.board.length - 1) {
    const occupied = [];
    const rowLimit = Math.min(maxRow, state.board.length - 1);
    for (let row = 0; row <= rowLimit; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = getBubble(row, col);
        if (bubble) {
          occupied.push({ row, col, bubble });
        }
      }
    }
    return occupied;
  }

  function getAttachableEmptyCells(maxRow) {
    const candidates = [];
    const rowLimit = Math.min(maxRow, state.board.length - 1);
    for (let row = 0; row <= rowLimit; row += 1) {
      ensureRowExists(row);
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          continue;
        }
        const valid = row === 0 || getNeighbors(row, col).some(([nRow, nCol]) => Boolean(getBubble(nRow, nCol)));
        if (valid) {
          candidates.push({ row, col });
        }
      }
    }
    return candidates;
  }

  function getBossDrawPosition() {
    if (!state.boss) {
      return null;
    }
    const boss = state.boss;
    const phase = boss.floatTime;
    let x = boss.x;
    let y = Math.max(34, CONFIG.topPadding + state.boardOffsetY - 34) + Math.sin(phase) * 5;

    if (boss.kind === "creeper") {
      x += Math.sign(Math.sin(phase * 2.7)) * 2.2;
      y += Math.sign(Math.cos(phase * 3.1)) * 1.6;
    } else if (boss.kind === "hannibal") {
      y += Math.sin(phase * 0.7) * 2;
    } else if (boss.kind === "winter") {
      x += Math.sin(phase * 0.8) * 3;
      y += Math.cos(phase * 1.6) * 2.4;
    } else if (boss.kind === "ghostface") {
      x += Math.sin(phase * 1.1) * 4.5;
      y += Math.cos(phase * 1.8) * 3.2;
    }

    return { x, y };
  }

  function triggerBossPersonaEffect(actionKey) {
    if (!state.boss) {
      return;
    }
    const boss = state.boss;
    boss.effectAction = actionKey;
    boss.effectTimer = boss.kind === "ghostface" ? 1.15 : 0.95;
    boss.pulse = 1;
    playBossActionSound(actionKey, boss);

    if (boss.expressions && boss.expressions.length > 0) {
      boss.expression = pickBossExpression(boss, actionKey);
      boss.expressionElapsed = 0;
      boss.nextExpressionDelay = getBossExpressionDelay(boss);
    }

    const bossPosition = getBossDrawPosition();
    if (!bossPosition) {
      return;
    }

    if (boss.kind === "creeper") {
      addPopup("SSSS...", bossPosition.x, bossPosition.y - 48, boss.accent);
    } else if (boss.kind === "hannibal") {
      addPopup("CHECKMATE", bossPosition.x, bossPosition.y - 48, boss.accent);
    } else if (boss.kind === "winter") {
      addPopup("SPARK", bossPosition.x, bossPosition.y - 48, boss.accent);
    } else if (boss.kind === "ghostface") {
      addPopup("SCREAM", bossPosition.x, bossPosition.y - 52, "#f2f3ff");
    }
  }

  function bossRecolorBubble() {
    const occupied = getOccupiedCells(7 + getSpeedTier(state.stage));
    if (occupied.length === 0) {
      return false;
    }
    const target = randomFrom(occupied);
    const nextColors = CONFIG.colors.filter((color) => color !== target.bubble.color);
    target.bubble.color = randomFrom(nextColors);
    const center = getCellCenter(target.row, target.col);
    addParticles(center.x, center.y, target.bubble.color, 10);
    addPopup(BOSS_ACTION_TEXT.recolor, center.x, center.y - 18, "#ffd166");
    triggerBossPersonaEffect("recolor");
    updateStatus(`${state.boss.name}: ${getBossActionLine("recolor")}`);
    return true;
  }

  function bossAddBubble() {
    const candidates = getAttachableEmptyCells(7 + getSpeedTier(state.stage));
    if (candidates.length === 0) {
      return false;
    }
    const cell = randomFrom(candidates);
    const color = randomFrom(CONFIG.colors);
    setBubble(cell.row, cell.col, createBubble(color));
    const center = getCellCenter(cell.row, cell.col);
    addParticles(center.x, center.y, color, 10);
    addPopup(BOSS_ACTION_TEXT.add, center.x, center.y - 16, "#ff8fab");
    triggerBossPersonaEffect("add");
    updateStatus(`${state.boss.name}: ${getBossActionLine("add")}`);
    checkDangerState();
    return true;
  }

  function bossShuffleBubbles() {
    const occupied = getOccupiedCells(8 + getSpeedTier(state.stage));
    if (occupied.length < 2) {
      return false;
    }
    const first = randomFrom(occupied);
    let alternatives = occupied.filter((cell) => cell.row !== first.row || cell.col !== first.col);
    const differentColor = alternatives.filter((cell) => cell.bubble.color !== first.bubble.color);
    if (differentColor.length > 0) {
      alternatives = differentColor;
    }
    const second = randomFrom(alternatives);
    const firstBubble = getBubble(first.row, first.col);
    const secondBubble = getBubble(second.row, second.col);
    setBubble(first.row, first.col, secondBubble);
    setBubble(second.row, second.col, firstBubble);
    const firstCenter = getCellCenter(first.row, first.col);
    const secondCenter = getCellCenter(second.row, second.col);
    addParticles(firstCenter.x, firstCenter.y, secondBubble.color, 8);
    addParticles(secondCenter.x, secondCenter.y, firstBubble.color, 8);
    addPopup(BOSS_ACTION_TEXT.shuffle, (firstCenter.x + secondCenter.x) / 2, (firstCenter.y + secondCenter.y) / 2 - 18, "#7cf5d6");
    triggerBossPersonaEffect("shuffle");
    updateStatus(`${state.boss.name}: ${getBossActionLine("shuffle")}`);
    return true;
  }

  function triggerBossAction() {
    if (!state.boss) {
      return;
    }
    const actionPool = [bossRecolorBubble, bossAddBubble, bossShuffleBubbles];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const action = actionPool.splice(Math.floor(Math.random() * actionPool.length), 1)[0];
      if (action()) {
        state.flashLevel = Math.max(state.flashLevel, 0.22);
        return;
      }
    }
  }

  function updateBossStage(dt) {
    if (!state.boss) {
      return;
    }
    const boss = state.boss;
    const leftBound = CONFIG.fieldLeft + 38;
    const rightBound = CONFIG.fieldRight - 38;
    const speedScale = boss.kind === "ghostface" ? 1.06 : boss.kind === "creeper" ? 0.96 : 1;
    boss.floatTime += dt * (1.8 + boss.level * 0.22);
    boss.x += boss.direction * boss.speed * speedScale * dt;
    if (boss.x <= leftBound) {
      boss.x = leftBound;
      boss.direction = 1;
    } else if (boss.x >= rightBound) {
      boss.x = rightBound;
      boss.direction = -1;
    }

    boss.pulse = Math.max(0, boss.pulse - dt * 1.45);
    boss.effectTimer = Math.max(0, boss.effectTimer - dt);

    if (boss.expressions && boss.expressions.length > 0) {
      boss.expressionElapsed += dt;
      if (boss.expressionElapsed >= boss.nextExpressionDelay) {
        boss.expression = pickBossExpression(boss);
        boss.expressionElapsed = 0;
        boss.nextExpressionDelay = getBossExpressionDelay(boss);
      }
    }

    boss.actionElapsed += dt;
    if (boss.actionElapsed >= boss.nextActionDelay) {
      boss.actionElapsed = 0;
      boss.nextActionDelay = getBossActionDelay(boss.level);
      triggerBossAction();
    }
  }
  function launchFinalEndingCelebration() {
    const burstPoints = [
      { x: 92, y: 146, color: "#ffd166", amount: 28 },
      { x: 210, y: 182, color: "#7cf5d6", amount: 32 },
      { x: 328, y: 146, color: "#ff8fab", amount: 28 },
      { x: 130, y: 286, color: "#5f7bff", amount: 24 },
      { x: 290, y: 286, color: "#c77dff", amount: 24 },
    ];

    for (const burst of burstPoints) {
      addParticles(burst.x, burst.y, burst.color, burst.amount);
    }

    addPopup(`${PLAYER_NAME} \uBC84\uBE14 \uB9C8\uC2A4\uD130!`, CONFIG.launcherX, 210, "#ffd166");
    addPopup("\uBC84\uBE14 \uC288\uD130 \uACE0\uC218 \uC778\uC815!", CONFIG.launcherX, 254, "#7cf5d6");
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
    playShotSound();
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
      playStageClearSound();
      const bossScript = state.boss ? getBossScript(state.boss) : null;

      if (isFinalStage(state.stage)) {
        if (state.boss) {
          playBossDefeatSound(state.boss);
        }
        launchFinalEndingCelebration();
        showOverlay({
          kicker: `${PLAYER_NAME} Final Ending`,
          title: `${PLAYER_NAME}, 20스테이지 정복 완료!`,
          message: `${bossScript ? bossScript.clear + " " : ""}${BOSS_NAMES[BOSS_NAMES.length - 1]}까지 물리치며 20개 스테이지를 모두 끝냈어요. 최종 점수는 ${state.score.toLocaleString("ko-KR")}점. 이제 ${PLAYER_NAME}는 Bubble Pop 세계에서 정식 버블 슈터 마스터예요.`,
          primaryLabel: "처음부터 다시",
          primaryAction: "newGame",
          secondaryLabel: "20스테이지 다시",
          secondaryAction: "restart",
        });
        updateStatus(`${PLAYER_NAME}, 마지막 보스까지 클리어했어요! 현서 전용 엔딩이 열렸습니다.`);
      } else if (isBossStage(state.stage)) {
        const nextInterval = getStageDescendInterval(state.stage + 1);
        if (state.boss) {
          playBossDefeatSound(state.boss);
        }
        showOverlay({
          kicker: `${PLAYER_NAME} Boss Down`,
          title: `${state.boss ? state.boss.name : BOSS_NAMES[getBossLevel(state.stage) - 1]} 격파`,
          message: `${bossScript ? bossScript.clear + " " : ""}${PLAYER_NAME}, 보스 스테이지를 넘겼어요. 다음 4개 스테이지부터는 버블 벽이 더 빠른 ${Math.round(nextInterval / 100) / 10}초 페이스로 내려옵니다. 이제 리듬도 더 빠르게 잡아야 해요.`,
          primaryLabel: "다음 스테이지",
          primaryAction: "nextStage",
          secondaryLabel: "다시하기",
          secondaryAction: "restart",
        });
        updateStatus(`${state.boss ? state.boss.name : "보스"}: ${bossScript ? bossScript.clear : "다음 구간부터 하강 속도가 더 빠르게 올라갑니다."}`);
      } else {
        const nextMessage = (state.stage + 1) % 5 === 0
          ? `\uB2E4\uC74C\uC740 \uBCF4\uC2A4 \uC2A4\uD14C\uC774\uC9C0\uC608\uC694. ${BOSS_NAMES[getBossLevel(state.stage + 1) - 1]}\uAC00 \uD604\uC11C\uB97C \uAE30\uB2E4\uB824\uC694.`
          : `\uD604\uC7AC \uD558\uAC15 \uC18D\uB3C4\uB294 ${Math.round(state.descendIntervalMs / 100) / 10}\uCD08 \uD398\uC774\uC2A4\uB97C \uC720\uC9C0\uD574\uC694.`;
        showOverlay({
          kicker: `${PLAYER_NAME} Clear`,
          title: `Stage ${getStageNumberLabel(state.stage)} \uD074\uB9AC\uC5B4`,
          message: `${PLAYER_NAME}, \uC774\uBC88 \uC2A4\uD14C\uC774\uC9C0\uB97C ${state.score.toLocaleString("ko-KR")}\uC810\uC73C\uB85C \uB05D\uB0C8\uC5B4\uC694. ${nextMessage}`,
          primaryLabel: "\uB2E4\uC74C \uC2A4\uD14C\uC774\uC9C0",
          primaryAction: "nextStage",
          secondaryLabel: "\uB2E4\uC2DC\uD558\uAE30",
          secondaryAction: "restart",
        });
        updateStatus(`${PLAYER_NAME}, Stage ${getStageNumberLabel(state.stage)} \uD074\uB9AC\uC5B4! ${getUpcomingHint(state.stage)}`);
      }
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
    playGameOverSound();
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
    playDescendSound(fromPenalty);
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
      playMatchSound(matchedCount, state.combo);
      if (floatingCount > 0) {
        playDropSound(floatingCount);
      }
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

    if (state.stageClearQueued) {
      updateParticles(dt);
      return;
    }

    state.descendElapsed += dt * 1000;
    if (state.descendElapsed >= state.descendIntervalMs) {
      descendBoard(CONFIG.descendHalfStep);
      updateStatus(`${PLAYER_NAME}, \uBC84\uBE14 \uBCBD\uC774 \uB2E4\uC2DC \uB0B4\uB824\uC654\uC5B4\uC694. \uD398\uC774\uC2A4\uB97C \uB193\uCE58\uC9C0 \uB9D0\uC544\uBD10\uC694.`);
    }

    updateBossStage(dt);
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
    ctx.font = "700 16px Trebuchet MS";
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
    roundRect(ctx, CONFIG.fieldLeft + 12, 28, 192, 50, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(124, 245, 214, 0.34)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "rgba(124, 245, 214, 0.94)";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText(`STAGE ${getStageNumberLabel(state.stage)}`, CONFIG.fieldLeft + 26, 49);
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.font = "700 11px Trebuchet MS";
    ctx.fillText(getStageTheme(state.stage), CONFIG.fieldLeft + 26, 68);
    ctx.restore();
  }

  function drawSparkle(x, y, size, color, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.restore();
  }

  function drawBossAura(x, y, boss) {
    const radius = 34 + boss.pulse * 8;
    const aura = ctx.createRadialGradient(x, y, 8, x, y, radius);
    aura.addColorStop(0, boss.auraColor || "rgba(255, 132, 132, 0.32)");
    aura.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBossNameplate(x, y, boss) {
    ctx.save();
    ctx.fillStyle = "rgba(11, 16, 28, 0.68)";
    ctx.fillRect(x - 54, y - 52, 108, 19);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 54, y - 52, 108, 19);
    ctx.fillStyle = mixColor(boss.accent || "#ffffff", 0.25);
    ctx.font = "700 11px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(boss.name, x, y - 39);
    ctx.restore();
  }

  function drawCreeperBoss(x, y, boss) {
    ctx.save();
    ctx.translate(x, y);
    const pulse = 1 + boss.pulse * 0.08;
    ctx.scale(pulse, pulse);

    for (let index = 0; index < 3; index += 1) {
      ctx.fillStyle = `rgba(82, 255, 119, ${0.16 - index * 0.04})`;
      ctx.fillRect(-28 - boss.direction * index * 5, -22 + index * 3, 14, 40 - index * 4);
    }

    if (boss.effectTimer > 0) {
      const energy = 1 - boss.effectTimer / 0.95;
      for (let ring = 0; ring < 3; ring += 1) {
        const size = 52 + ring * 10 + energy * 8;
        ctx.strokeStyle = `rgba(123, 255, 111, ${0.34 - ring * 0.08})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
      }
      for (let spark = 0; spark < 6; spark += 1) {
        ctx.fillStyle = spark % 2 === 0 ? "#d8ff8f" : "#62ff89";
        const phase = boss.floatTime * 3.2 + spark;
        ctx.fillRect(Math.cos(phase) * 30 - 3, Math.sin(phase * 1.2) * 22 - 3, 6, 6);
      }
    }

    const gradient = ctx.createLinearGradient(-24, -24, 24, 24);
    gradient.addColorStop(0, "#9cfb7f");
    gradient.addColorStop(0.55, "#4fbf50");
    gradient.addColorStop(1, "#245f2d");
    ctx.fillStyle = gradient;
    ctx.fillRect(-24, -24, 48, 48);
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(-18, -20, 12, 12);
    ctx.fillStyle = boss.secondary || "#234b28";
    ctx.fillRect(-14, -10, 9, 11);
    ctx.fillRect(5, -10, 9, 11);
    ctx.fillRect(-5, 1, 10, 16);
    ctx.fillRect(-14, 10, 9, 7);
    ctx.fillRect(5, 10, 9, 7);
    ctx.strokeStyle = "rgba(18, 41, 17, 0.75)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-24, -24, 48, 48);
    ctx.restore();
  }

  function drawHannibalBoss(x, y, boss) {
    const expression = boss.expression || "cold";
    ctx.save();
    ctx.translate(x, y + 2);

    const face = ctx.createRadialGradient(-5, -12, 4, 0, 0, 26);
    face.addColorStop(0, "#ffd8bf");
    face.addColorStop(0.75, "#e7ad8e");
    face.addColorStop(1, "#9f6753");

    ctx.fillStyle = "rgba(36, 12, 12, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4b1c1b";
    ctx.beginPath();
    ctx.moveTo(-18, -5);
    ctx.quadraticCurveTo(-15, -28, 0, -30);
    ctx.quadraticCurveTo(15, -28, 18, -5);
    ctx.lineTo(14, 6);
    ctx.quadraticCurveTo(0, 11, -14, 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f1bc9e";
    ctx.beginPath();
    ctx.ellipse(-17, -1, 3, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(17, -1, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    let browLeftY = -10;
    let browRightY = -10;
    let browTilt = 0.8;
    let eyeScale = 1;
    let mouthLift = 0;
    if (expression === "glare") {
      browLeftY = -12;
      browRightY = -12;
      browTilt = 2.2;
      eyeScale = 0.72;
    } else if (expression === "smirk") {
      browLeftY = -11;
      browRightY = -9;
      browTilt = 1.1;
      mouthLift = 2.5;
    } else if (expression === "amused") {
      browLeftY = -8;
      browRightY = -8;
      eyeScale = 1.1;
      mouthLift = 1;
    }

    ctx.strokeStyle = "#341514";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12, browLeftY + browTilt);
    ctx.lineTo(-4, browLeftY - browTilt);
    ctx.moveTo(4, browRightY - browTilt);
    ctx.lineTo(12, browRightY + browTilt);
    ctx.stroke();

    ctx.fillStyle = "#fffdf9";
    ctx.beginPath();
    ctx.ellipse(-8, -4, 4.6, 3.2 * eyeScale, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -4, 4.6, 3.2 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#151827";
    ctx.beginPath();
    ctx.arc(-8, -4, 1.8, 0, Math.PI * 2);
    ctx.arc(8, -4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(90, 47, 33, 0.52)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(-1, 7);
    ctx.stroke();

    ctx.fillStyle = "#a7adb8";
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.lineTo(14, 4);
    ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#707887";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = "#58606d";
    ctx.beginPath();
    ctx.moveTo(-9, 7);
    ctx.lineTo(-9, 16);
    ctx.moveTo(-3, 7);
    ctx.lineTo(-3, 16);
    ctx.moveTo(3, 7);
    ctx.lineTo(3, 16);
    ctx.moveTo(9, 7);
    ctx.lineTo(9, 16);
    ctx.stroke();
    ctx.strokeStyle = "#8790a1";
    ctx.beginPath();
    ctx.moveTo(-14, 11);
    ctx.lineTo(14, 11);
    ctx.stroke();
    ctx.strokeStyle = "#6f7481";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-17, 6);
    ctx.lineTo(-24, 2);
    ctx.moveTo(17, 6);
    ctx.lineTo(24, 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 214, 182, ${0.5 + mouthLift * 0.08})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 16 - mouthLift * 0.2, 4.8, 0.15, Math.PI - 0.15);
    ctx.stroke();

    if (boss.effectTimer > 0) {
      const gleam = 1 - boss.effectTimer / 0.95;
      ctx.strokeStyle = `rgba(255, 242, 222, ${0.48 - gleam * 0.24})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-8 + gleam * 8, 6);
      ctx.lineTo(-1 + gleam * 8, 16);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawWinterBoss(x, y, boss) {
    const expression = boss.expression || "smile";
    ctx.save();
    ctx.translate(x, y + 1);

    ctx.fillStyle = "rgba(140, 196, 255, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const hair = ctx.createLinearGradient(-22, -28, 18, 18);
    hair.addColorStop(0, "#f8fbff");
    hair.addColorStop(0.45, "#d7e9ff");
    hair.addColorStop(1, "#8eabd6");
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.quadraticCurveTo(-22, -30, 0, -30);
    ctx.quadraticCurveTo(22, -30, 19, -4);
    ctx.quadraticCurveTo(17, 22, 0, 24);
    ctx.quadraticCurveTo(-17, 22, -18, -4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff2ee";
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 182, 198, 0.45)";
    ctx.beginPath();
    ctx.ellipse(-11, 5, 4.2, 2.8, 0, 0, Math.PI * 2);
    ctx.ellipse(11, 5, 4.2, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-17, -7);
    ctx.quadraticCurveTo(-12, -20, -4, -18);
    ctx.quadraticCurveTo(-1, -6, -3, 10);
    ctx.lineTo(-17, 12);
    ctx.closePath();
    ctx.moveTo(17, -7);
    ctx.quadraticCurveTo(12, -20, 4, -18);
    ctx.quadraticCurveTo(1, -6, 3, 10);
    ctx.lineTo(17, 12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(120, 148, 193, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.quadraticCurveTo(-8, -17, -1, -18);
    ctx.moveTo(12, -10);
    ctx.quadraticCurveTo(8, -17, 1, -18);
    ctx.stroke();

    function drawOpenEye(centerX, irisColor, tall = 1) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(centerX, -2, 5.2, 6.2 * tall, 0, 0, Math.PI * 2);
      ctx.fill();
      const iris = ctx.createRadialGradient(centerX - 1, -3, 1, centerX, -1, 5.5);
      iris.addColorStop(0, "#f8fbff");
      iris.addColorStop(0.45, irisColor);
      iris.addColorStop(1, "#326db6");
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.ellipse(centerX, -1, 3.6, 4.4 * tall, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#15213b";
      ctx.beginPath();
      ctx.arc(centerX, -1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.beginPath();
      ctx.arc(centerX - 1.2, -3.4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    if (expression === "wink") {
      ctx.strokeStyle = "#51658e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.quadraticCurveTo(-9, -6, -5, -2);
      ctx.stroke();
      drawOpenEye(8, "#7ed4ff");
    } else if (expression === "focus") {
      drawOpenEye(-8, "#6bbef3", 0.82);
      drawOpenEye(8, "#6bbef3", 0.82);
      ctx.strokeStyle = "#53698e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-13, -10);
      ctx.lineTo(-4, -12);
      ctx.moveTo(4, -12);
      ctx.lineTo(13, -10);
      ctx.stroke();
    } else if (expression === "surprised") {
      drawOpenEye(-8, "#88dcff", 1.18);
      drawOpenEye(8, "#88dcff", 1.18);
    } else {
      drawOpenEye(-8, "#7ed4ff");
      drawOpenEye(8, "#7ed4ff");
    }

    ctx.strokeStyle = "rgba(92, 104, 145, 0.9)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-13, -10);
    ctx.quadraticCurveTo(-8, -13, -4, -11);
    ctx.moveTo(4, -11);
    ctx.quadraticCurveTo(8, -13, 13, -10);
    ctx.stroke();

    ctx.strokeStyle = "#d987a8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (expression === "surprised") {
      ctx.arc(0, 10, 2.8, 0, Math.PI * 2);
    } else if (expression === "focus") {
      ctx.moveTo(-4, 11);
      ctx.lineTo(4, 11);
    } else {
      ctx.arc(0, 9, 4.4, 0.15, Math.PI - 0.15);
    }
    ctx.stroke();

    drawSparkle(-21, -18, 4, "rgba(214, 241, 255, 0.82)", boss.floatTime * 0.5);
    drawSparkle(21, -12, 3.2, "rgba(214, 241, 255, 0.76)", -boss.floatTime * 0.6);
    if (boss.effectTimer > 0) {
      const alpha = 0.24 + boss.effectTimer * 0.12;
      drawSparkle(-26, 4, 5, `rgba(173, 231, 255, ${alpha})`, boss.floatTime);
      drawSparkle(26, 1, 4.6, `rgba(173, 231, 255, ${alpha})`, -boss.floatTime * 1.2);
    }

    ctx.restore();
  }

  function drawGhostfaceBoss(x, y, boss) {
    ctx.save();
    ctx.translate(x, y + 2);

    for (let trail = 0; trail < 3; trail += 1) {
      const alpha = 0.16 - trail * 0.04;
      ctx.fillStyle = `rgba(34, 39, 63, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(-22 - boss.direction * trail * 4, -10 + trail * 3);
      ctx.quadraticCurveTo(-34, 18, -14, 30 - trail * 2);
      ctx.lineTo(14, 30 - trail * 2);
      ctx.quadraticCurveTo(34, 18, 22 - boss.direction * trail * 4, -10 + trail * 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#0f1324";
    ctx.beginPath();
    ctx.moveTo(-24, -6);
    ctx.quadraticCurveTo(-20, -30, 0, -32);
    ctx.quadraticCurveTo(20, -30, 24, -6);
    ctx.quadraticCurveTo(28, 22, 0, 34);
    ctx.quadraticCurveTo(-28, 22, -24, -6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fbfbff";
    ctx.beginPath();
    ctx.ellipse(0, -1, 14, 21, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#10131f";
    ctx.beginPath();
    ctx.ellipse(-5, -7, 3.8, 5.8, 0.22, 0, Math.PI * 2);
    ctx.ellipse(5, -7, 3.8, 5.8, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 10, 4.2, 8.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(220, 224, 255, 0.3)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-14, -1);
    ctx.quadraticCurveTo(0, 3, 14, -1);
    ctx.stroke();

    if (boss.effectTimer > 0) {
      const pulse = 1 - boss.effectTimer / 1.15;
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.strokeStyle = `rgba(214, 219, 255, ${0.3 - ring * 0.07})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 12, 8 + ring * 7 + pulse * 10, 5 + ring * 3 + pulse * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let wisp = 0; wisp < 4; wisp += 1) {
        const phase = boss.floatTime * 1.7 + wisp * 0.9;
        ctx.strokeStyle = `rgba(160, 170, 255, ${0.22 - wisp * 0.03})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(phase) * 16, -4 + wisp * 3);
        ctx.quadraticCurveTo(Math.sin(phase) * 30, 8 + wisp * 4, Math.cos(phase * 1.1) * 20, 24 + wisp * 3);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawBoss() {
    if (!state.boss) {
      return;
    }
    const bossPosition = getBossDrawPosition();
    if (!bossPosition) {
      return;
    }

    const { x, y } = bossPosition;
    const boss = state.boss;
    ctx.save();
    ctx.globalAlpha = 0.97;
    drawBossAura(x, y, boss);

    if (boss.kind === "creeper") {
      drawCreeperBoss(x, y, boss);
    } else if (boss.kind === "hannibal") {
      drawHannibalBoss(x, y, boss);
    } else if (boss.kind === "winter") {
      drawWinterBoss(x, y, boss);
    } else {
      drawGhostfaceBoss(x, y, boss);
    }

    drawBossNameplate(x, y, boss);
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
      ctx.font = "700 14px Trebuchet MS";
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
      ctx.font = "700 26px Trebuchet MS";
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
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText(`${PLAYER_NAME}\uC758 \uC2E4\uC218 ${state.missStreak}/${CONFIG.missLimit}`, CONFIG.fieldLeft + 18, CONFIG.launcherY - 30);
    ctx.restore();
  }

  function render() {
    drawBackground();
    drawDedicationStamp();
    drawAimGuide();
    drawBoardBubbles();
    drawBoss();
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
      case "bossIntro": {
        hideOverlay(stateScreen);
        state.mode = "playing";
        if (state.boss) {
          const script = getBossScript(state.boss);
          updateStatus(script.entryStatus);
          addPopup(state.boss.name, CONFIG.launcherX, 156, state.boss.accent || "#ffd166");
          state.flashLevel = Math.max(state.flashLevel, 0.18);
        }
        break;
      }
      case "restart":
        resetRun(state.stage);
        break;
      case "nextStage":
        if (isFinalStage(state.stage)) {
          resetRun(1);
          break;
        }
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
    state.descendIntervalMs = CONFIG.descendIntervalMs;
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
    state.boss = null;
    boardStage.classList.remove("warning", "shake");
    showElement(titleScreen);
    hideOverlay(stateScreen);
    updateStatus(`${PLAYER_NAME}, \uC2DC\uC791 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 20\uAC1C \uC2A4\uD14C\uC774\uC9C0 \uCC4C\uB9B0\uC9C0\uAC00 \uC5F4\uB824\uC694.`);
    updateHud();
    updateLauncherPreview();
  }

  pauseButton.addEventListener("click", togglePause);
  startGameButton.addEventListener("click", () => {
    unlockAudio();
    resetRun(1);
  });
  primaryActionButton.addEventListener("click", handlePrimaryAction);
  secondaryActionButton.addEventListener("click", handleSecondaryAction);
  homeActionButton.addEventListener("click", goHome);

  canvas.addEventListener("pointerdown", (event) => {
    unlockAudio();
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

  window.addEventListener("resize", requestResponsiveLayout);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(requestResponsiveLayout, 120);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", requestResponsiveLayout);
    window.visualViewport.addEventListener("scroll", requestResponsiveLayout);
  }

  if (window.ResizeObserver) {
    const layoutObserver = new ResizeObserver(() => {
      requestResponsiveLayout();
    });
    [appShell, gameCard, boardStage, canvasFrame, launcherPanel, hud].forEach((element) => {
      if (element) {
        layoutObserver.observe(element);
      }
    });
  }

  window.addEventListener("load", requestResponsiveLayout);
  window.setTimeout(requestResponsiveLayout, 0);

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
  updateStatus("시작 버튼을 누르면 20개 스테이지 챌린지가 시작돼요.");
  updateLauncherPreview();
  render();
  state.animationFrameId = window.requestAnimationFrame(gameLoop);
})();

