const views=[...document.querySelectorAll('.view')];
const gameGrid=document.getElementById('gameGrid');
const memoryStage=document.getElementById('memoryStage');
const gameInstruction=document.getElementById('gameInstruction');
const gameStatus=document.getElementById('gameStatus');
const startMemoryBtn=document.getElementById('startMemoryBtn');
const soundToggle=document.getElementById('soundToggle');
let soundOn=true;
let targets=[];
let selected=[];

const games=[
['🧠','그림 기억하기','그림을 기억하고 다시 찾아요',true],
['📍','위치 기억하기','꽃이 있던 자리를 기억해요',false],
['👀','다른 그림 찾기','다른 하나를 찾아요',false],
['🛒','장보기','살 물건을 기억하고 골라요',false],
['🗣️','속담 완성','익숙한 속담을 완성해요',false],
['💰','시장 계산','생활 속 계산을 해요',false],
['🔄','생활 순서 맞추기','일상 행동 순서를 맞춰요',false],
['📻','추억의 물건','옛 물건을 떠올려요',false]
];

function show(id){
  views.forEach(v=>v.classList.toggle('active',v.id===id));
}

function speak(text){
  if(!soundOn||!('speechSynthesis' in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='ko-KR';
  u.rate=.9;
  speechSynthesis.speak(u);
}

function resetMemory(){
  targets=[];selected=[];memoryStage.textContent='';
  gameInstruction.textContent='그림을 잘 기억해 주세요.';
  gameStatus.textContent='';
  startMemoryBtn.hidden=false;
  startMemoryBtn.textContent='시작하기';
}

function startMemory(){
  const pool=['🍎','🐶','🚗','🌼','🍌','🐱','🚌','🥛','🥕','⚽'];
  targets=[...pool].sort(()=>Math.random()-.5).slice(0,3);
  memoryStage.textContent='';
  targets.forEach(x=>{
    const d=document.createElement('div');
    d.className='memory-item';d.textContent=x;memoryStage.appendChild(d);
  });
  gameInstruction.textContent='그림 3개를 기억해 주세요.';
  startMemoryBtn.hidden=true;
  speak('그림 세 개를 잘 기억해 주세요.');
  setTimeout(()=>showChoices(pool),4500);
}

function showChoices(pool){
  const extra=pool.filter(x=>!targets.includes(x)).sort(()=>Math.random()-.5).slice(0,3);
  const choices=[...targets,...extra].sort(()=>Math.random()-.5);
  memoryStage.textContent='';selected=[];
  gameInstruction.textContent='아까 보았던 그림 3개를 골라주세요.';
  speak('아까 보았던 그림 세 개를 골라 주세요.');
  choices.forEach(x=>{
    const b=document.createElement('button');
    b.type='button';b.className='memory-item';b.textContent=x;
    b.addEventListener('click',()=>{
      if(selected.includes(x))return;
      selected.push(x);b.classList.add('selected');
      if(selected.length===3){
        const ok=targets.every(t=>selected.includes(t));
        gameStatus.textContent=ok?'👏 잘하셨어요! 모두 맞혔어요.':'괜찮아요. 한 번 더 해볼까요?';
        speak(ok?'잘하셨어요. 모두 맞혔어요.':'괜찮아요. 한 번 더 해볼까요?');
        startMemoryBtn.hidden=false;startMemoryBtn.textContent='다시 하기';
      }
    });
    memoryStage.appendChild(b);
  });
}

function renderGames(){
  games.forEach(g=>{
    const b=document.createElement('button');
    b.type='button';b.className='game-card';
    const e=document.createElement('span');e.className='emoji';e.textContent=g[0];
    const s=document.createElement('strong');s.textContent=g[1];
    const m=document.createElement('small');m.textContent=g[2];
    b.append(e,s,m);
    b.addEventListener('click',()=>{
      if(g[3]){resetMemory();show('memoryGameView');speak('그림 기억하기 놀이입니다.');}
      else{
        document.getElementById('placeholderTitle').textContent=g[1];
        document.getElementById('placeholderEmoji').textContent=g[0];
        document.getElementById('placeholderText').textContent=g[1]+'은 다음 구현 단계에서 추가됩니다.';
        show('placeholderView');
      }
    });
    gameGrid.appendChild(b);
  });
}

soundToggle.addEventListener('click',()=>{
  soundOn=!soundOn;
  soundToggle.textContent=soundOn?'🔊 소리 켜짐':'🔇 소리 꺼짐';
});

document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>{
  resetMemory();show(b.closest('#memoryGameView')?'gamesView':'homeView');
}));

document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
  const a=b.dataset.action;
  if(a==='free')show('gamesView');
  else if(a==='daily'){resetMemory();show('memoryGameView');}
  else{
    document.getElementById('placeholderTitle').textContent=a==='memoryTrip'?'추억여행':'내 기록';
    document.getElementById('placeholderEmoji').textContent=a==='memoryTrip'?'📻':'📊';
    show('placeholderView');
  }
}));

startMemoryBtn.addEventListener('click',startMemory);
renderGames();