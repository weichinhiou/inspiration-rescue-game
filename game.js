(() => {
  const ROUND_SECONDS = 60;
  const RARE_IDEA_CHANCE = 0.07;
  const POWER_ITEM_CHANCE = 0.2;
  const BONUS_SECONDS_PER_PICKUP = 5;
  const TEAMWORK_BONUS_POINTS = 3;
  const TEAMWORK_BONUS_SECONDS = 3;
  const TIME_TRAP_PENALTY = 5;
  const SLOW_SPAWN_DURATION_MS = 3000;
  const SLOW_SPAWN_FACTOR = 1.7;
  const MAX_IDEAS_ON_BOARD = 4;
  const MAX_WRONG_ON_BOARD = 3;
  const NOTEBOOK_CATEGORIES = 5;
  const ideas = ["新點子！", "研究候診？", "教學回饋", "資料有線索", "想追這題"];
  const distractions = [
    { kind: "phone", name: "電話", label: "電話響了" },
    { kind: "meeting", name: "會議", label: "臨時會議" },
    { kind: "todo", name: "待辦", label: "待辦山" },
    { kind: "operating-room", name: "刀房通知", label: "刀房通知" },
    { kind: "deliverable", name: "交資料", label: "交資料" }
  ];
  const timeTrapLabels = ["臨時約診", "臨床案件", "緊急交班"];
  const powerItems = {
    double: { label: "下次 ×2", art: "double-score-powerup-fast.webp", aria: "加倍便條，下次分數加減乘以二" },
    timeBonus: { label: "+5 秒", art: "time-bonus-notebook-fast.webp", aria: "筆記本道具，加 5 秒" },
    slowSpawn: { label: "慢速 3 秒", art: "slow-spawn-pocketwatch-fast.webp", aria: "懷錶道具，生成速度放慢 3 秒" },
    teamwork: { label: "同仁一起討論", art: "teamwork-idea-powerup-fast.webp", aria: "同仁一起討論，增加 3 分、目前缺的名句字母 1 個與 3 秒" }
  };
  const quoteTexts = [
    "The noblest question in the world is what good may I do in it?",
    "The masterpiece of man is to live to the purpose.",
    "Well done is better than well said.",
    "Search others for their virtues, thyself for thy vices.",
    "He that can have patience, can have what he will.",
    "After crosses and losses men grow humbler and wiser.",
    "In a discreet man's mouth a public thing is private.",
    "Wealth is not his that has it, but his that enjoys it.",
    "No better relation than a prudent and faithful friend.",
    "He that can take rest is greater than he that can take cities.",
    "None preaches better than the ant, and she says nothing.",
    "The worst wheel of the cart makes the most noise.",
    "Don't misinform your doctor or your lawyer.",
    "Read much, but not too many books.",
    "There are no gains without pains."
  ];
  const quoteMeanings = [
    "把注意力放在能為世界帶來什麼，而不只是在意自己能得到什麼。好問題會把好奇心帶向行動。",
    "真正的成就，是讓生活朝著自己認同的目標前進，而不是只把目標說得漂亮。",
    "說得再好，不如踏實完成一件事。行動會讓想法成為看得見的改變。",
    "看見別人的長處，也誠實看待自己的不足；這樣的眼光能讓人持續學習。",
    "耐心讓人不被眼前的挫折帶走，也更有機會走到自己真正想去的地方。",
    "經歷阻礙與失落之後，人常會少一點自滿，多一點理解與判斷。",
    "公開的事一旦說出口，就可能被傳得更遠；說話之前先想想對方是否準備好。",
    "擁有多少不等於富足；能否享受、珍惜手上的生活，才是另一種財富。",
    "謹慎而忠誠的朋友難得，因為可靠的陪伴比表面的熱鬧更長久。",
    "懂得休息也是力量；能停下來恢復心神，才有餘裕繼續走遠路。",
    "有時候，安靜而持續的示範，比長篇說教更能讓人明白一件事。",
    "最吵的聲音未必代表最重要的事；別讓噪音搶走了真正值得處理的注意力。",
    "就醫或尋求專業協助時，完整坦白的資訊能幫助對方做出更好的判斷。",
    "閱讀重在消化與思考；讀得多不如讀到能真正理解、記住並運用。",
    "有價值的成果通常需要投入與努力；辛苦本身不是目的，但常是過程的一部分。"
  ];
  const quotes = quoteTexts.map((text, index) => ({
    text,
    author: "Poor Richard's Almanack 格言選",
    explanation: quoteMeanings[index]
  }));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const slots = [...document.querySelectorAll(".slot")];
  const gridWrapEl = document.querySelector(".grid-wrap");
  const countdownOverlay = document.querySelector("#countdown-overlay");
  const countdownNumber = document.querySelector("#countdown-number");
  const gameMalletEl = document.querySelector("#game-mallet");
  const timerEl = document.querySelector("#timer");
  const scoreEl = document.querySelector("#score");
  const comboEl = document.querySelector("#combo");
  const powerStatusEl = document.querySelector("#power-status");
  const savedCountEl = document.querySelector("#saved-count");
  const roundStateEl = document.querySelector("#round-state");
  const startButton = document.querySelector("#start-button");
  const eventBanner = document.querySelector("#event-banner");
  const eventText = document.querySelector("#event-text");
  const notebook = document.querySelector("#notebook");
  const notebookPaper = document.querySelector("#notebook-paper");
  const wordSlotsEl = document.querySelector("#word-slots");
  const wordBonusEl = document.querySelector("#word-bonus");
  const wordHintEl = document.querySelector("#word-hint");
  const quoteAuthorEl = document.querySelector("#quote-author");
  const quoteProgressEl = document.querySelector("#quote-progress");
  const quoteRevealEl = document.querySelector("#quote-reveal");
  const quoteRevealedTextEl = document.querySelector("#quote-revealed-text");
  const quoteMeaningEl = document.querySelector("#quote-meaning");
  const soundToggleEl = document.querySelector("#sound-toggle");
  const rulesBackdrop = document.querySelector("#rules-backdrop");
  const rulesDialog = document.querySelector("#rules-dialog");
  const rulesStartButton = document.querySelector("#rules-start-button");
  const rulesCancelButton = document.querySelector("#rules-cancel-button");
  const pauseButton = document.querySelector("#pause-button");
  const resultBackdrop = document.querySelector("#result-backdrop");
  const finalScoreEl = document.querySelector("#final-score");
  const toast = document.querySelector("#toast");
  const closeResultButton = document.querySelector("#close-result");

  let running = false;
  let remaining = ROUND_SECONDS;
  let score = 0;
  let combo = 0;
  let captured = 0;
  let currentQuote = quotes[0];
  let wordComplete = false;
  let quoteRewardClaimed = false;
  let doubleNextScore = false;
  let slowSpawnUntil = 0;
  let teamworkCollected = false;
  let lastTeamworkSpawnWave = 0;
  let soundEnabled = true;
  let audioContext = null;
  let waveNumber = 0;
  let timerId = 0;
  let countdownId = 0;
  let countdownActive = false;
  let rulesActive = false;
  let paused = false;
  let pauseStartedAt = 0;
  let pendingWaveDelay = 0;
  let pauseMode = false;
  let spawnId = 0;
  let toastId = 0;
  let bannerId = 0;
  let closeGuardId = 0;
  let hammerHideId = 0;
  let boardThudId = 0;
  const slotTimers = new Map();
  const slotDeadlines = new Map();
  const collectedLetters = new Map();
  const capturedStacks = new Map();

  const random = (n) => Math.floor(Math.random() * n);
  const timeString = (seconds) => {
    const total = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };
  const quoteLetters = () => [...currentQuote.text.toUpperCase()].filter((char) => /[A-Z]/.test(char));
  const quoteReward = () => quoteLetters().length * 3;
  const countCollectedLetters = () => [...collectedLetters.values()].reduce((sum, count) => sum + count, 0);

  function unlockAudio() {
    if (!soundEnabled) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      audioContext ||= new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return audioContext;
    } catch {
      return null;
    }
  }

  function playTone(context, { frequency, endFrequency = frequency, at = 0, duration = 0.1, type = "triangle", volume = 0.04 }) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + at;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.min(0.1, volume * 1.7), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }

  function playGameSound(kind, delay = 0) {
    const context = unlockAudio();
    if (!context) return;
    const cues = {
      correct: [
        { frequency: 660, at: delay, duration: 0.075, volume: 0.035 },
        { frequency: 880, at: delay + 0.065, duration: 0.105, volume: 0.035 }
      ],
      wrong: [
        { frequency: 235, endFrequency: 165, at: delay, duration: 0.13, type: "triangle", volume: 0.05 },
        { frequency: 155, endFrequency: 125, at: delay + 0.075, duration: 0.13, type: "sine", volume: 0.035 }
      ],
      double: [
        { frequency: 740, at: delay, duration: 0.12, type: "sine", volume: 0.035 },
        { frequency: 990, at: delay + 0.075, duration: 0.13, type: "sine", volume: 0.035 },
        { frequency: 1320, at: delay + 0.15, duration: 0.17, type: "sine", volume: 0.03 }
      ],
      timeBonus: [
        { frequency: 520, at: delay, duration: 0.09, type: "sine", volume: 0.03 },
        { frequency: 780, at: delay + 0.08, duration: 0.13, type: "sine", volume: 0.035 }
      ],
      slow: [
        { frequency: 650, endFrequency: 480, at: delay, duration: 0.2, type: "sine", volume: 0.03 },
        { frequency: 420, endFrequency: 330, at: delay + 0.12, duration: 0.22, type: "sine", volume: 0.025 }
      ]
    };
    cues[kind]?.forEach((tone) => playTone(context, tone));
  }

  function updateSoundToggle() {
    soundToggleEl.textContent = soundEnabled ? "音效 開" : "音效 關";
    soundToggleEl.setAttribute("aria-pressed", String(soundEnabled));
    soundToggleEl.setAttribute("aria-label", soundEnabled ? "關閉遊戲音效" : "開啟遊戲音效");
  }

  function positionGameMallet(event, striking = false) {
    gameMalletEl.style.left = `${event.clientX}px`;
    gameMalletEl.style.top = `${event.clientY}px`;
    gameMalletEl.classList.add("is-visible");
    gameMalletEl.classList.toggle("is-striking", striking);
    gridWrapEl.classList.add("hammer-active");
  }

  function hideGameMallet() {
    clearTimeout(hammerHideId);
    hammerHideId = 0;
    gameMalletEl.classList.remove("is-visible", "is-striking");
    gridWrapEl.classList.remove("hammer-active");
  }

  function onGridPointerMove(event) {
    if (event.pointerType !== "mouse") return;
    if (!running || !event.target.closest(".slot")) {
      hideGameMallet();
      return;
    }
    if (gameMalletEl.classList.contains("is-striking")) {
      positionGameMallet(event, true);
      return;
    }
    clearTimeout(hammerHideId);
    positionGameMallet(event);
  }

  function onGridPointerDown(event) {
    if (!running || !event.target.closest(".slot")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearTimeout(hammerHideId);
    positionGameMallet(event, true);
    showBoardThud();
    const touchInput = event.pointerType === "touch" || event.pointerType === "pen";
    hammerHideId = window.setTimeout(() => {
      gameMalletEl.classList.remove("is-striking");
      if (touchInput) hideGameMallet();
    }, touchInput ? 430 : 400);
  }

  function onGridPointerUp(event) {
    if (event.pointerType !== "mouse") return;
    clearTimeout(hammerHideId);
    hammerHideId = window.setTimeout(() => gameMalletEl.classList.remove("is-striking"), 400);
  }

  function showBoardThud() {
    clearTimeout(boardThudId);
    gridWrapEl.classList.remove("is-impacting");
    void gridWrapEl.offsetWidth;
    gridWrapEl.classList.add("is-impacting");
    boardThudId = window.setTimeout(() => {
      gridWrapEl.classList.remove("is-impacting");
      boardThudId = 0;
    }, 280);
  }

  function countLetters(letters) {
    const counts = new Map();
    letters.forEach((letter) => counts.set(letter, (counts.get(letter) || 0) + 1));
    return counts;
  }

  function clearSlot(slot) {
    const index = Number(slot.dataset.slot) + 1;
    clearTimeout(slotTimers.get(slot));
    slotTimers.delete(slot);
    slotDeadlines.delete(slot);
    slot.className = "slot";
    slot.disabled = true;
    slot.removeAttribute("data-idea");
    slot.removeAttribute("data-distraction");
    slot.removeAttribute("data-distraction-label");
    slot.removeAttribute("data-power");
    slot.removeAttribute("data-letter");
    slot.removeAttribute("data-rare");
    slot.setAttribute("aria-label", `靈感洞口 ${index}`);
    slot.innerHTML = `<span class="slot-id">${String(index).padStart(2, "0")}</span><span class="slot-empty">···</span>`;
  }

  function clearTimers() {
    clearInterval(timerId);
    clearInterval(countdownId);
    countdownId = 0;
    countdownActive = false;
    countdownOverlay.hidden = true;
    clearTimeout(spawnId);
    clearTimeout(toastId);
    clearTimeout(bannerId);
    clearInterval(closeGuardId);
    clearTimeout(hammerHideId);
    clearTimeout(boardThudId);
    hideGameMallet();
    slotTimers.forEach(clearTimeout);
    slotTimers.clear();
    slotDeadlines.clear();
    paused = false;
    pauseMode = false;
    pauseButton.hidden = true;
    pauseButton.disabled = true;
  }

  function updatePowerStatus() {
    powerStatusEl.hidden = !doubleNextScore;
  }

  function updateWordProgress() {
    wordSlotsEl.replaceChildren();
    const foundSoFar = new Map();
    const parts = currentQuote.text.match(/[A-Za-z]+|[^A-Za-z]+/g) || [];
    parts.forEach((part) => {
      if (!/[A-Za-z]/.test(part)) {
        const separator = document.createElement("span");
        separator.className = "quote-separator";
        separator.textContent = part;
        wordSlotsEl.append(separator);
        return;
      }
      const word = document.createElement("span");
      word.className = "quote-word";
      [...part.toUpperCase()].forEach((letter) => {
        const cell = document.createElement("span");
        const seen = (foundSoFar.get(letter) || 0) + 1;
        foundSoFar.set(letter, seen);
        const found = seen <= (collectedLetters.get(letter) || 0);
        cell.className = found ? "quote-letter is-found" : "quote-letter";
        cell.textContent = found ? letter : "";
        word.append(cell);
      });
      wordSlotsEl.append(word);
    });
    const total = quoteLetters().length;
    const found = countCollectedLetters();
    quoteAuthorEl.textContent = `${currentQuote.author}・${total} 個字母`;
    quoteProgressEl.textContent = `${Math.min(found, total)} / ${total} 個字母`;
    wordBonusEl.textContent = wordComplete ? "已拼成" : quoteRewardClaimed ? "需重新拼回" : `整句 +${quoteReward()}`;
    wordHintEl.textContent = wordComplete
      ? "名句拼成！新靈感已解鎖。"
      : "字母順序不限；重複字母也要逐張收齊。";
    quoteRevealEl.hidden = !wordComplete;
    if (wordComplete) {
      quoteRevealedTextEl.textContent = `“${currentQuote.text}”`;
      quoteMeaningEl.textContent = currentQuote.explanation;
    } else {
      quoteRevealedTextEl.textContent = "";
      quoteMeaningEl.textContent = "";
    }
  }

  function renderNotebook() {
    notebookPaper.replaceChildren();
    const groups = [...capturedStacks.entries()];
    if (!groups.length) {
      const placeholder = document.createElement("span");
      placeholder.className = "notebook-placeholder";
      placeholder.textContent = "同類靈感會疊成一疊\n字母也會一起收集";
      notebookPaper.append(placeholder);
      return;
    }

    groups.slice(0, NOTEBOOK_CATEGORIES).forEach(([label, stack]) => {
      const card = document.createElement("div");
      card.className = `captured-stack stack-depth-${Math.min(stack.count, 4)}`;
      card.setAttribute("aria-label", `${label}，累積 ${stack.count} 張，字母 ${stack.letters.join("")}`);
      const name = document.createElement("span");
      name.className = "captured-stack-label";
      name.textContent = label;
      const count = document.createElement("span");
      count.className = "captured-stack-count";
      count.textContent = `×${stack.count}`;
      const letterRow = document.createElement("span");
      letterRow.className = "captured-stack-letters";
      const letters = stack.letters.slice(-5).join(" · ");
      letterRow.textContent = stack.letters.length > 5 ? `字母 ${letters} …` : `字母 ${letters}`;
      card.append(name, count, letterRow);
      notebookPaper.append(card);
    });
    if (groups.length > NOTEBOOK_CATEGORIES) {
      const extra = document.createElement("span");
      extra.className = "captured-stack stack-overflow";
      extra.textContent = `+${groups.length - NOTEBOOK_CATEGORIES} 類`;
      notebookPaper.append(extra);
    }
  }

  function resetState() {
    clearTimers();
    remaining = ROUND_SECONDS;
    score = 0;
    combo = 0;
    captured = 0;
    currentQuote = quotes[random(quotes.length)];
    wordComplete = false;
    quoteRewardClaimed = false;
    doubleNextScore = false;
    slowSpawnUntil = 0;
    teamworkCollected = false;
    lastTeamworkSpawnWave = 0;
    waveNumber = 0;
    running = false;
    paused = false;
    pauseMode = false;
    collectedLetters.clear();
    capturedStacks.clear();
    timerEl.textContent = timeString(remaining);
    scoreEl.textContent = "0";
    comboEl.textContent = "×0";
    savedCountEl.textContent = "0";
    updatePowerStatus();
    updateWordProgress();
    roundStateEl.textContent = "準備開始";
    startButton.textContent = "開始搶救";
    startButton.disabled = false;
    eventBanner.className = "event-banner idle";
    eventBanner.querySelector(".event-icon").textContent = "規則";
    eventText.textContent = "靈感 +1／罕見 +3；筆記本 +5 秒；同仁討論 +3 分、補字母並加 3 秒；臨床急件誤點 −5 秒。";
    renderNotebook();
    setIdleGrid();
  }

  function setIdleGrid(label = "等待靈感") {
    slots.forEach((slot, i) => {
      clearTimeout(slotTimers.get(slot));
      slotTimers.delete(slot);
      slot.className = "slot";
      slot.disabled = true;
      slot.removeAttribute("data-idea");
      slot.removeAttribute("data-distraction");
      slot.removeAttribute("data-distraction-label");
      slot.removeAttribute("data-power");
      slot.removeAttribute("data-letter");
      slot.removeAttribute("data-rare");
      slot.setAttribute("aria-label", `靈感洞口 ${i + 1}`);
      slot.innerHTML = `<span class="slot-id">${String(i + 1).padStart(2, "0")}</span><span class="slot-empty">${label === "等待靈感" ? "···" : label}</span>`;
    });
  }

  function startGame() {
    if (running || countdownActive || rulesActive) return;
    unlockAudio();
    resultBackdrop.hidden = true;
    resetState();
    rulesActive = true;
    pauseMode = false;
    setRulesMode(false);
    rulesBackdrop.hidden = false;
    roundStateEl.textContent = "遊戲說明";
    startButton.textContent = "請先看圖例";
    startButton.disabled = true;
    rulesDialog.focus();
  }

  function closeRules() {
    if (pauseMode) {
      resumeGame();
      return;
    }
    if (!rulesActive) return;
    rulesActive = false;
    rulesBackdrop.hidden = true;
    roundStateEl.textContent = "準備開始";
    startButton.textContent = "開始搶救";
    startButton.disabled = false;
    startButton.focus();
  }

  function setRulesMode(isPause) {
    pauseMode = isPause;
    document.querySelector("#rules-kicker").textContent = isPause ? "遊戲已暫停" : "開局前看一眼";
    document.querySelector("#rules-title").textContent = isPause ? "搶救圖例" : "搶救圖例";
    document.querySelector("#rules-duration").textContent = isPause ? "計時暫停中" : "60 秒挑戰";
    rulesStartButton.textContent = isPause ? "繼續遊戲" : "知道了，開始倒數";
    rulesCancelButton.hidden = isPause;
  }

  function pauseGame() {
    if (!running || paused) return;
    paused = true;
    pauseStartedAt = performance.now();
    clearInterval(timerId);
    timerId = 0;
    clearTimeout(spawnId);
    spawnId = 0;
    pendingWaveDelay = Math.max(0, pendingWaveDelay - (pauseStartedAt - (lastWaveScheduledAt || pauseStartedAt)));
    slotDeadlines.forEach((entry, slot) => {
      clearTimeout(slotTimers.get(slot));
      slotTimers.set(slot, 0);
      entry.remaining = Math.max(0, entry.deadline - pauseStartedAt);
    });
    setRulesMode(true);
    rulesBackdrop.hidden = false;
    rulesDialog.focus();
  }

  function resumeGame() {
    if (!paused) return;
    const pauseDuration = performance.now() - pauseStartedAt;
    paused = false;
    if (slowSpawnUntil > pauseStartedAt) slowSpawnUntil += pauseDuration;
    rulesBackdrop.hidden = true;
    pauseButton.textContent = "暫停";
    timerId = window.setInterval(() => {
      remaining -= 1;
      timerEl.textContent = timeString(remaining);
      if (remaining <= 0) finishGame();
    }, 1000);
    slotDeadlines.forEach((entry, slot) => {
      const delay = Math.max(0, entry.remaining || 0);
      entry.deadline = performance.now() + delay;
      const timeout = window.setTimeout(() => {
        slotTimers.delete(slot);
        slotDeadlines.delete(slot);
        entry.callback();
      }, delay);
      slotTimers.set(slot, timeout);
    });
    scheduleWave(pendingWaveDelay || waveDelay(), false);
    pauseButton.focus();
  }

  let lastWaveScheduledAt = 0;

  function beginCountdown() {
    if (!rulesActive || countdownActive) return;
    rulesActive = false;
    rulesBackdrop.hidden = true;
    countdownActive = true;
    let count = 3;
    countdownNumber.textContent = String(count);
    countdownOverlay.hidden = false;
    roundStateEl.textContent = "準備中";
    startButton.textContent = "準備中…";
    startButton.disabled = true;

    countdownId = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        countdownNumber.textContent = String(count);
        countdownNumber.classList.remove("countdown-pop");
        void countdownNumber.offsetWidth;
        countdownNumber.classList.add("countdown-pop");
        return;
      }
      clearInterval(countdownId);
      countdownId = 0;
      countdownActive = false;
      countdownOverlay.hidden = true;
      beginRound();
    }, 1000);
  }

  function beginRound() {
    running = true;
    pauseButton.hidden = false;
    pauseButton.disabled = false;
    roundStateEl.textContent = "搶救中";
    startButton.textContent = "搶救中…";
    startButton.disabled = true;
    spawnWave();
    scheduleWave(900 + random(120));
    timerId = window.setInterval(() => {
      remaining -= 1;
      timerEl.textContent = timeString(remaining);
      if (remaining <= 0) finishGame();
    }, 1000);
  }

  function availableSlots() {
    return slots.filter((slot) => !slot.classList.contains("has-idea") && !slot.classList.contains("has-wrong") && !slot.classList.contains("has-power"));
  }

  function waveDelay() {
    const elapsed = ROUND_SECONDS - remaining;
    const base = elapsed < ROUND_SECONDS / 3 ? 900 : elapsed < (ROUND_SECONDS * 2) / 3 ? 700 : 520;
    return base + random(140);
  }

  function itemLifetime(isWrong = false, isPower = false) {
    const elapsed = ROUND_SECONDS - remaining;
    const phase = elapsed < ROUND_SECONDS / 3 ? 0 : elapsed < (ROUND_SECONDS * 2) / 3 ? 1 : 2;
    const ideaLifetime = [1400, 1120, 900][phase];
    const wrongLifetime = [1800, 1500, 1250][phase];
    return (isWrong ? wrongLifetime : ideaLifetime) + (isPower ? 300 : 0) + random(120);
  }

  function scheduleWave(delay = waveDelay(), applySlowdown = true) {
    if (!running || paused) return;
    if (applySlowdown && performance.now() < slowSpawnUntil) delay = Math.round(delay * SLOW_SPAWN_FACTOR);
    pendingWaveDelay = delay;
    lastWaveScheduledAt = performance.now();
    spawnId = window.setTimeout(() => {
      pendingWaveDelay = 0;
      spawnWave();
      scheduleWave(waveDelay());
    }, delay);
  }

  function scheduleSlotExpiry(slot, lifetime, callback) {
    const deadline = performance.now() + lifetime;
    slotDeadlines.set(slot, { deadline, callback });
    const timeout = window.setTimeout(() => {
      slotTimers.delete(slot);
      slotDeadlines.delete(slot);
      callback();
    }, lifetime);
    slotTimers.set(slot, timeout);
  }

  function drawLetter() {
    const required = countLetters(quoteLetters());
    const visible = countLetters(slots.filter((slot) => slot.classList.contains("has-idea")).map((slot) => slot.dataset.letter));
    const missing = [];
    required.forEach((needed, letter) => {
      const remaining = needed - (collectedLetters.get(letter) || 0) - (visible.get(letter) || 0);
      for (let i = 0; i < remaining; i += 1) missing.push(letter);
    });
    if (missing.length && Math.random() < 0.82) return missing[random(missing.length)];
    const decoys = [...alphabet].filter((letter) => !required.has(letter) || (collectedLetters.get(letter) || 0) >= required.get(letter));
    return decoys[random(decoys.length)];
  }

  function spawnWave() {
    if (!running) return;
    waveNumber += 1;
    let open = availableSlots();
    let liveIdeas = slots.filter((slot) => slot.classList.contains("has-idea")).length;
    let ideasToSpawn = Math.min(2, MAX_IDEAS_ON_BOARD - liveIdeas, open.length);
    while (ideasToSpawn > 0) {
      open = availableSlots();
      if (!open.length) break;
      showIdea(open[random(open.length)], ideas[random(ideas.length)], drawLetter(), itemLifetime(), false, Math.random() < RARE_IDEA_CHANCE);
      ideasToSpawn -= 1;
      liveIdeas += 1;
    }

    open = availableSlots();
    const liveWrong = slots.filter((slot) => slot.classList.contains("has-wrong")).length;
    const elapsed = ROUND_SECONDS - remaining;
    const wrongToSpawn = elapsed >= (ROUND_SECONDS * 2) / 3 ? 3 : 2;
    const distractionsToSpawn = Math.min(wrongToSpawn, MAX_WRONG_ON_BOARD - liveWrong, open.length);
    for (let i = 0; i < distractionsToSpawn; i += 1) {
      open = availableSlots();
      if (!open.length) break;
      const distraction = Math.random() < 0.1
        ? { kind: "time-trap", name: "臨床急件", label: timeTrapLabels[random(timeTrapLabels.length)] }
        : distractions[random(distractions.length)];
      showDistraction(open[random(open.length)], distraction, itemLifetime(true));
    }

    const powerAlreadyVisible = slots.some((slot) => slot.classList.contains("has-power"));
    open = availableSlots();
    if (!powerAlreadyVisible && open.length && waveNumber > 1) {
      const shouldOfferTeamwork = !wordComplete && !teamworkCollected
        && (!lastTeamworkSpawnWave || waveNumber - lastTeamworkSpawnWave >= 4);
      if (shouldOfferTeamwork) {
        const firstOffer = lastTeamworkSpawnWave === 0;
        lastTeamworkSpawnWave = waveNumber;
        showPower(open[random(open.length)], "teamwork", 3800);
        if (firstOffer) showBanner("同仁一起討論出現了！收下可加分、補名句字母並增加時間。", "time", 3200);
      } else if ((teamworkCollected || wordComplete) && Math.random() < POWER_ITEM_CHANCE) {
        const eligiblePowerKinds = ["double", "slowSpawn", "timeBonus", "timeBonus"];
        showPower(open[random(open.length)], eligiblePowerKinds[random(eligiblePowerKinds.length)]);
      }
    }
  }

  function showIdea(slot, label, letter, lifetime = itemLifetime(), relocated = false, rare = false) {
    const index = Number(slot.dataset.slot) + 1;
    slot.className = `slot has-idea${relocated ? " relocated" : ""}${rare ? " is-rare" : ""}`;
    slot.disabled = false;
    slot.dataset.idea = label;
    slot.dataset.letter = letter;
    slot.dataset.rare = String(rare);
    slot.setAttribute("aria-label", `${rare ? "罕見靈感 +3 分" : "靈感 +1 分"}：${label}，字母 ${letter}`);
    const art = rare ? "rare-inspiration-fast.webp" : "idea-mascot-fast.webp";
    const rareBadge = rare ? '<span class="rare-mark" aria-hidden="true">★ +3</span>' : "";
    slot.innerHTML = `<span class="slot-id">${String(index).padStart(2, "0")}</span><span class="letter-badge">${letter}</span>${rareBadge}<span class="idea-content"><img class="object-art idea-art" src="./assets/${art}" alt="" /><span class="idea-label">${label}</span></span>`;
    scheduleSlotExpiry(slot, lifetime, () => {
      if (slot.classList.contains("has-idea")) {
        clearSlot(slot);
        combo = 0;
        comboEl.textContent = "×0";
      }
    });
  }

  function showDistraction(slot, distraction, lifetime = itemLifetime(true)) {
    const index = Number(slot.dataset.slot) + 1;
    slot.className = `slot has-wrong wrong-${distraction.kind}`;
    slot.disabled = false;
    slot.dataset.distraction = distraction.kind;
    slot.dataset.distractionLabel = distraction.label;
    const isTimeTrap = distraction.kind === "time-trap";
    slot.setAttribute("aria-label", isTimeTrap ? `紅色干擾物：${distraction.label}，誤點減少 5 秒` : `紅標干擾物：${distraction.label}，誤點扣兩分`);
    const art = isTimeTrap ? "time-penalty-timer-fast.webp" : "red-distraction-fast.webp";
    const mark = isTimeTrap ? "−5s" : "−2";
    const label = distraction.label;
    slot.innerHTML = `<span class="slot-id">${String(index).padStart(2, "0")}</span><span class="wrong-mark">${mark}</span><span class="block-content"><img class="object-art distraction-art" src="./assets/${art}" alt="" /><span class="block-label">${label}</span></span>`;
    scheduleSlotExpiry(slot, lifetime, () => {
      if (slot.classList.contains("has-wrong")) clearSlot(slot);
    });
  }

  function showPower(slot, kind = "double", lifetime = itemLifetime(false, true)) {
    const index = Number(slot.dataset.slot) + 1;
    const item = powerItems[kind];
    slot.className = "slot has-power";
    slot.disabled = false;
    slot.dataset.power = kind;
    slot.setAttribute("aria-label", item.aria);
    slot.innerHTML = `<span class="slot-id">${String(index).padStart(2, "0")}</span><span class="power-content power-${kind}"><img class="object-art power-art" src="./assets/${item.art}" alt="" /><span class="power-label">${item.label}</span></span>`;
    scheduleSlotExpiry(slot, lifetime, () => {
      if (slot.classList.contains("has-power")) clearSlot(slot);
    });
  }

  function onSlotClick(event) {
    const slot = event.currentTarget;
    if (!running) return;
    if (slot.classList.contains("has-idea")) collectIdea(slot);
    else if (slot.classList.contains("has-wrong")) hitDistraction(slot);
    else if (slot.classList.contains("has-power")) collectPower(slot);
  }

  function collectIdea(slot) {
    const label = slot.dataset.idea || "新點子！";
    const letter = slot.dataset.letter || "";
    const rare = slot.dataset.rare === "true";
    const rect = slot.getBoundingClientRect();
    clearSlot(slot);

    const previousCombo = combo;
    combo += 1;
    captured += 1;
    const stack = capturedStacks.get(label) || { count: 0, letters: [] };
    stack.count += 1;
    stack.letters.push(letter);
    capturedStacks.set(label, stack);

    let comboBonus = 0;
    if (Math.floor(combo / 5) > Math.floor(previousCombo / 5)) comboBonus = 2;
    const extraQuoteBonus = collectQuoteLetter(letter);
    const multiplier = doubleNextScore ? 2 : 1;
    const catchPoints = ((rare ? 3 : 1) + comboBonus) * multiplier;
    const quotePoints = extraQuoteBonus * multiplier;
    const gained = catchPoints + quotePoints;
    playGameSound("correct");
    if (multiplier === 2) playGameSound("double", 0.09);
    score += gained;
    doubleNextScore = false;

    scoreEl.textContent = String(score);
    comboEl.textContent = `×${combo}`;
    savedCountEl.textContent = String(captured);
    updatePowerStatus();
    renderNotebook();
    animateNoteToNotebook(label, rect);

    const messages = [`${rare ? "罕見靈感" : "接住"} ${label} +${rare ? 3 : 1} 分`];
    if (comboBonus) messages.push("連擊加成 +2");
    if (extraQuoteBonus) messages.push(`名句獎勵 +${quotePoints}，本次合計 +${gained}`);
    if (extraQuoteBonus) messages.push(`新靈感解讀：${currentQuote.explanation}`);
    if (multiplier === 2) messages.push("已套用 ×2");
    showToast(messages.join("・"), extraQuoteBonus ? 6500 : 1500);
  }

  function collectQuoteLetter(letter) {
    if (wordComplete || !letter) return 0;
    const required = countLetters(quoteLetters());
    const already = collectedLetters.get(letter) || 0;
    if (!required.has(letter) || already >= required.get(letter)) return 0;
    collectedLetters.set(letter, already + 1);
    wordComplete = [...required.entries()].every(([char, count]) => (collectedLetters.get(char) || 0) >= count);
    updateWordProgress();
    if (wordComplete) {
      if (!quoteRewardClaimed) {
        quoteRewardClaimed = true;
        return quoteReward();
      }
      return 0;
    }
    wordHintEl.textContent = `收集到 ${letter}！還差 ${quoteLetters().length - countCollectedLetters()} 個字母。`;
    return 0;
  }

  function nextMissingQuoteLetter() {
    const needed = countLetters(quoteLetters());
    const missing = [];
    needed.forEach((count, letter) => {
      const left = count - (collectedLetters.get(letter) || 0);
      for (let index = 0; index < left; index += 1) missing.push(letter);
    });
    return missing.length ? missing[random(missing.length)] : "";
  }

  function collectPower(slot) {
    const kind = slot.dataset.power || "double";
    const rect = slot.getBoundingClientRect();
    clearSlot(slot);
    if (kind === "double") {
      doubleNextScore = true;
      updatePowerStatus();
      playGameSound("double");
      showToast("加倍便條收下了！下次分數加減都 ×2");
      return;
    }
    if (kind === "timeBonus") {
      const seconds = BONUS_SECONDS_PER_PICKUP;
      remaining += seconds;
      timerEl.textContent = timeString(remaining);
      showTimeFloater(rect, `+${seconds}s`, "time-bonus-floater");
      playGameSound("timeBonus");
      showToast(`筆記本補充時間 +${seconds} 秒！沒有加時上限。`);
      showBanner(`筆記本補充時間 +${seconds} 秒。`, "time");
      return;
    }
    if (kind === "teamwork") {
      teamworkCollected = true;
      const letter = nextMissingQuoteLetter();
      const extraQuoteBonus = collectQuoteLetter(letter);
      const multiplier = doubleNextScore ? 2 : 1;
      const gained = (TEAMWORK_BONUS_POINTS + extraQuoteBonus) * multiplier;
      score += gained;
      remaining += TEAMWORK_BONUS_SECONDS;
      doubleNextScore = false;
      scoreEl.textContent = String(score);
      timerEl.textContent = timeString(remaining);
      updatePowerStatus();
      showTimeFloater(rect, `+${gained} 分・+${TEAMWORK_BONUS_SECONDS}s`, "teamwork-floater");
      playGameSound("correct");
      if (multiplier === 2) playGameSound("double", 0.09);
      const letterLabel = letter ? `補上缺少字母 ${letter}` : "名句字母已集齊";
      showToast(`同仁一起討論：+${TEAMWORK_BONUS_POINTS} 分、${letterLabel}、+${TEAMWORK_BONUS_SECONDS} 秒${multiplier === 2 ? "（×2 已套用）" : ""}`, extraQuoteBonus ? 6000 : 2600);
      showBanner(`同仁一起討論：+${TEAMWORK_BONUS_POINTS} 分、${letterLabel}、+${TEAMWORK_BONUS_SECONDS} 秒。`, "time", 2600);
      return;
    }
    if (kind === "slowSpawn") {
      slowSpawnUntil = performance.now() + SLOW_SPAWN_DURATION_MS;
      clearTimeout(spawnId);
      scheduleWave();
      showTimeFloater(rect, "慢速 3 秒", "slow-floater");
      playGameSound("slow");
      showToast("懷錶啟動！接下來 3 秒，物件生成速度放慢。", 2200);
      showBanner("懷錶生效中：接下來 3 秒，物件生成間隔加長。", "slow", 3000);
    }
  }

  function removeRandomCollectedLetter() {
    const collected = [];
    collectedLetters.forEach((count, letter) => {
      for (let index = 0; index < count; index += 1) collected.push(letter);
    });
    if (!collected.length) return null;
    const letter = collected[random(collected.length)];
    const count = collectedLetters.get(letter) || 0;
    if (count <= 1) collectedLetters.delete(letter);
    else collectedLetters.set(letter, count - 1);
    wordComplete = false;
    updateWordProgress();
    const left = quoteLetters().length - countCollectedLetters();
    wordHintEl.textContent = `紅標偷走字母 ${letter}！還差 ${left} 個字母。`;
    return letter;
  }

  function hitDistraction(slot) {
    const kind = slot.dataset.distraction;
    const displayedLabel = slot.dataset.distractionLabel || "臨床急件";
    const rect = slot.getBoundingClientRect();
    clearSlot(slot);
    if (kind === "time-trap") {
      remaining = Math.max(0, remaining - TIME_TRAP_PENALTY);
      timerEl.textContent = timeString(remaining);
      combo = 0;
      comboEl.textContent = "×0";
      playGameSound("wrong");
      showTimeFloater(rect, `−${TIME_TRAP_PENALTY}s`, "time-penalty-floater");
      showToast(`誤點${displayedLabel}，時間 −${TIME_TRAP_PENALTY} 秒！`);
      showBanner(`誤點${displayedLabel}，時間 −${TIME_TRAP_PENALTY} 秒。`, "wrong");
      if (remaining <= 0) finishGame();
      else moveOneIdea();
      return;
    }
    const name = distractions.find((item) => item.kind === kind)?.name || displayedLabel || "干擾物";
    const multiplier = doubleNextScore ? 2 : 1;
    const penalty = 2 * multiplier;
    const lostLetter = removeRandomCollectedLetter();
    score -= penalty;
    combo = 0;
    doubleNextScore = false;
    scoreEl.textContent = String(score);
    comboEl.textContent = "×0";
    updatePowerStatus();
    playGameSound("wrong");
    if (multiplier === 2) playGameSound("double", 0.09);
    showPenalty(rect, penalty);
    const letterMessage = lostLetter ? `隨機失去字母 ${lostLetter}` : "還沒有已收集字母可扣";
    showToast(`誤點${name} −${penalty} 分，${letterMessage}！`);
    showBanner(`誤點${name} −${penalty} 分；${letterMessage}。`);
    moveOneIdea();
  }

  function moveOneIdea() {
    const activeIdeas = slots.filter((slot) => slot.classList.contains("has-idea"));
    const open = availableSlots();
    if (!activeIdeas.length || !open.length) return;
    const source = activeIdeas[random(activeIdeas.length)];
    const label = source.dataset.idea;
    const letter = source.dataset.letter;
    const rare = source.dataset.rare === "true";
    clearSlot(source);
    const destination = open[random(open.length)];
    showIdea(destination, label, letter, itemLifetime(), true, rare);
  }

  function showTimeFloater(rect, text, className) {
    const marker = document.createElement("span");
    marker.className = `score-floater ${className}`;
    marker.textContent = text;
    marker.style.left = `${rect.left + rect.width / 2 - 28}px`;
    marker.style.top = `${rect.top + 7}px`;
    document.body.append(marker);
    window.setTimeout(() => marker.remove(), 900);
  }

  function showPenalty(rect, amount) {
    const marker = document.createElement("span");
    marker.className = "score-floater";
    marker.textContent = `−${amount}`;
    marker.style.left = `${rect.left + rect.width / 2 - 18}px`;
    marker.style.top = `${rect.top + 7}px`;
    document.body.append(marker);
    window.setTimeout(() => marker.remove(), 700);
  }

  function showBanner(message, type = "wrong", duration = 1400) {
    eventBanner.className = `event-banner active ${type}`;
    eventBanner.querySelector(".event-icon").textContent = type === "slow" ? "慢速" : type === "time" ? "時間" : "誤點";
    eventText.textContent = message;
    clearTimeout(bannerId);
    bannerId = window.setTimeout(() => {
      if (!running) return;
      eventBanner.className = "event-banner idle";
      eventBanner.querySelector(".event-icon").textContent = "規則";
      eventText.textContent = "靈感 +1／罕見 +3；筆記本 +5 秒；同仁討論 +3 分、補字母並加 3 秒；臨床急件誤點 −5 秒。";
    }, duration);
  }

  function animateNoteToNotebook(label, fromRect) {
    const note = document.createElement("span");
    note.className = "fly-note";
    note.textContent = label;
    note.setAttribute("aria-hidden", "true");
    note.style.left = `${fromRect.left + fromRect.width / 2 - 44}px`;
    note.style.top = `${fromRect.top + fromRect.height / 2 - 28}px`;
    document.body.append(note);
    requestAnimationFrame(() => {
      const target = notebookPaper.getBoundingClientRect();
      note.style.left = `${target.left + target.width / 2 - 44}px`;
      note.style.top = `${target.top + target.height / 2 - 28}px`;
      note.style.transform = "scale(.28) rotate(12deg)";
      note.style.opacity = "0";
    });
    window.setTimeout(() => {
      note.remove();
      notebook.classList.remove("receiving");
      void notebook.offsetWidth;
      notebook.classList.add("receiving");
    }, 410);
  }

  function showToast(message, duration = 1500) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastId);
    toastId = window.setTimeout(() => toast.classList.remove("show"), duration);
  }

  function finishGame() {
    if (!running) return;
    running = false;
    clearTimers();
    remaining = 0;
    timerEl.textContent = timeString(remaining);
    roundStateEl.textContent = "本局完成";
    startButton.disabled = false;
    startButton.textContent = "再玩一次";
    pauseButton.hidden = true;
    pauseButton.disabled = true;
    setIdleGrid("本局完成");
    eventBanner.className = "event-banner idle";
    eventBanner.querySelector(".event-icon").textContent = "完成";
    eventText.textContent = `你接住 ${captured} 張靈感便條，名句字母 ${countCollectedLetters()}/${quoteLetters().length}。`;
    finalScoreEl.textContent = String(score);
    resultBackdrop.hidden = false;
    armCloseGuard();
    document.querySelector("#result-dialog").focus();
  }

  function armCloseGuard() {
    let secondsLeft = 3;
    closeResultButton.disabled = true;
    closeResultButton.textContent = `${secondsLeft} 秒後可關閉`;
    closeGuardId = window.setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(closeGuardId);
        closeGuardId = 0;
        closeResultButton.disabled = false;
        closeResultButton.textContent = "回到桌面看本局結果";
        return;
      }
      closeResultButton.textContent = `${secondsLeft} 秒後可關閉`;
    }, 1000);
  }

  slots.forEach((slot) => slot.addEventListener("click", onSlotClick));
  gridWrapEl.addEventListener("pointermove", onGridPointerMove);
  gridWrapEl.addEventListener("pointerdown", onGridPointerDown);
  gridWrapEl.addEventListener("pointerup", onGridPointerUp);
  gridWrapEl.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") hideGameMallet();
  });
  soundToggleEl.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) unlockAudio();
    updateSoundToggle();
  });
  startButton.addEventListener("click", startGame);
  document.querySelector("#replay-button").addEventListener("click", startGame);
  rulesStartButton.addEventListener("click", () => {
    if (pauseMode) resumeGame();
    else beginCountdown();
  });
  rulesCancelButton.addEventListener("click", closeRules);
  pauseButton.addEventListener("click", pauseGame);
  rulesBackdrop.addEventListener("click", (event) => {
    if (event.target === rulesBackdrop) closeRules();
  });
  closeResultButton.addEventListener("click", () => {
    if (closeResultButton.disabled) return;
    resultBackdrop.hidden = true;
    startButton.focus();
  });
  resultBackdrop.addEventListener("click", (event) => {
    if (event.target === resultBackdrop && !closeResultButton.disabled) resultBackdrop.hidden = true;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !rulesBackdrop.hidden) closeRules();
    if (event.key === "Escape" && !resultBackdrop.hidden && !closeResultButton.disabled) resultBackdrop.hidden = true;
  });

  resetState();
  updateSoundToggle();
})();
