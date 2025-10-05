// ------------------- MATRIX BACKGROUND -------------------
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%";
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f0";
  ctx.font = fontSize + "px monospace";

  columns = Math.floor(canvas.width / fontSize);
  if (drops.length !== columns) drops = Array(columns).fill(1);

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 50);

// ------------------- CLICKER VARIABLES -------------------
let clicks = 0;
let clickPower = 1;
let multiplier = 1;
let prestigeMultiplier = 1;

// ------------------- HELPER: FORMAT NUMBERS -------------------
function formatNumber(num) {
  const abbrev = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  let index = 0;
  while (num >= 1000 && index < abbrev.length - 1) {
    num /= 1000;
    index++;
  }
  return num.toFixed(2).replace(/\.00$/, '') + abbrev[index];
}

// ------------------- AUDIO -------------------
const clickSound = new Audio('https://cdn.pixabay.com/download/audio/2025/09/08/audio_399898.mp3');
const buySound = new Audio('https://cdn.pixabay.com/download/audio/2025/09/08/audio_399898.mp3');
const prestigeSound = new Audio('https://cdn.pixabay.com/download/audio/2025/09/08/audio_399898.mp3');

// ✅ Local background music
const bgMusic = new Audio('game-8-bit-399898.mp3');
bgMusic.loop = true;
bgMusic.volume = 0; // start at 0 for fade-in

// ------------------- STORE ITEMS -------------------
const storeItems = [
  {name: "Green Cursor", baseCost: 50, type: "clickPower", value: 1, level: 0},
  {name: "Multiplier Upgrade", baseCost: 500, type: "multiplier", value: 0.5, level: 0},
  {name: "Pro Hacker", baseCost: 3000, type: "clickPower", value: 5, level: 0},
  {name: "Elite Hacker", baseCost: 10000, type: "clickPower", value: 20, level: 0},
  {name: "Legendary Hacker", baseCost: 50000, type: "clickPower", value: 100, level: 0},
  {name: "Mythic Hacker", baseCost: 250000, type: "clickPower", value: 500, level: 0},
  {name: "Exotic Clicker", baseCost: 1000000, type: "clickPower", value: 2500, level: 0},
  {name: "Cyber Hacker", baseCost: 5000000, type: "clickPower", value: 12500, level: 0},
  {name: "AI Hacker", baseCost: 25000000, type: "clickPower", value: 60000, level: 0},
  {name: "Quantum Hacker", baseCost: 100000000, type: "clickPower", value: 250000, level: 0}
];

// ------------------- DOM ELEMENTS -------------------
const clicksDisplay = document.getElementById("clicks");
const clickPowerDisplay = document.getElementById("clickPower");
const multiplierDisplay = document.getElementById("multiplier");
const prestigeDisplay = document.getElementById("prestigeMulti");
const storeDiv = document.getElementById("store");

// ------------------- LOAD SAVE -------------------
if (localStorage.getItem("hackerSave")) {
  const save = JSON.parse(localStorage.getItem("hackerSave"));
  clicks = save.clicks || 0;
  clickPower = save.clickPower || 1;
  multiplier = save.multiplier || 1;
  prestigeMultiplier = save.prestigeMultiplier || 1;
  if (save.storeLevels) storeItems.forEach((item,i)=>item.level=save.storeLevels[i]||0);
}

// ------------------- DISPLAY FUNCTIONS -------------------
function updateDisplay() {
  clicksDisplay.innerText = formatNumber(clicks);
  clickPowerDisplay.innerText = formatNumber(clickPower);
  multiplierDisplay.innerText = multiplier.toFixed(1);
  prestigeDisplay.innerText = prestigeMultiplier.toFixed(2);
}

function renderStore() {
  storeDiv.innerHTML = "";
  storeItems.forEach((item,index)=>{
    const cost = Math.floor(item.baseCost * Math.pow(1.15,item.level));
    const btn = document.createElement("div");
    btn.className = "store-item";
    btn.innerHTML = `${item.name}<br>Cost: ${formatNumber(cost)}<br>Level: ${item.level}`;
    btn.addEventListener("click",()=>buyItem(index));
    storeDiv.appendChild(btn);
  });
}

// ------------------- BUY ITEMS -------------------
function buyItem(index){
  const item = storeItems[index];
  const cost = Math.floor(item.baseCost*Math.pow(1.15,item.level));
  if(clicks>=cost){
    clicks-=cost;
    if(item.type==="clickPower") clickPower+=item.value;
    if(item.type==="multiplier") multiplier+=item.value;
    item.level++;
    notify(`Bought ${item.name}!`);
    buySound.currentTime=0; buySound.play();
    updateDisplay(); renderStore();
  } else notify("Not enough clicks!",1000);
}

// ------------------- CLICK BUTTON -------------------
document.getElementById("clickBtn").addEventListener("click",()=>{
  clicks += clickPower*multiplier*prestigeMultiplier;
  updateDisplay();
  clickSound.currentTime=0; clickSound.play();
  document.getElementById("clickBtn").style.transform="scale(1.1)";
  setTimeout(()=>document.getElementById("clickBtn").style.transform="scale(1)",50);
});

// ------------------- PRESTIGE BUTTON -------------------
document.getElementById("prestigeBtn").addEventListener("click",()=>{
  if(clicks>=100000){
    let scale=1.5+((clicks-100000)/150000);
    if(scale>5) scale=5;
    prestigeMultiplier+=scale;
    clicks=0; clickPower=1; multiplier=1;
    storeItems.forEach(item=>item.level=0);
    notify(`Prestige Activated! +${scale.toFixed(2)}x multiplier!`);
    prestigeSound.currentTime=0; prestigeSound.play();
    updateDisplay(); renderStore();
  } else notify("Need at least 100,000 clicks to prestige!",1500);
});

// ------------------- NOTIFICATIONS -------------------
function notify(text,duration=1500){
  const n=document.getElementById('notifications');
  n.innerText=text;
  setTimeout(()=>n.innerText='',duration);
}

// ------------------- AUTO SAVE -------------------
setInterval(()=>{
  const save={
    clicks, clickPower, multiplier, prestigeMultiplier,
    storeLevels: storeItems.map(i=>i.level)
  };
  localStorage.setItem("hackerSave",JSON.stringify(save));
},5000);

// ------------------- MUSIC FADE-IN -------------------
function fadeInMusic(audio, targetVolume = 0.2, duration = 4000) {
  audio.volume = 0;
  audio.play().catch(()=>console.log("Music blocked"));
  const step = 0.01;
  const interval = duration / (targetVolume / step);
  const fade = setInterval(() => {
    if (audio.volume < targetVolume) audio.volume = Math.min(audio.volume + step, targetVolume);
    else clearInterval(fade);
  }, interval);
}

// ------------------- START BUTTON -------------------
document.getElementById("startBtn").addEventListener("click",()=>{
  document.getElementById("startOverlay").style.display="none";
  document.querySelector(".container").style.display="flex";
  renderStore();
  updateDisplay();
  fadeInMusic(bgMusic, 0.2, 4000); // fade in music over 4 seconds
});
