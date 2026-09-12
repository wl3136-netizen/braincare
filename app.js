const $=id=>document.getElementById(id);const views=[...document.querySelectorAll('.view')];
let soundOn=localStorage.getItem('braincare-sound')!=='off',current='memory',level='easy',timer=null,state={};
const gameGrid=$('gameGrid'),stage=$('gameStage'),instruction=$('gameInstruction'),status=$('gameStatus'),mainBtn=$('mainGameBtn');
const games=[
{id:'memory',icon:'🧠',name:'그림 기억하기',desc:'그림을 기억하고 다시 찾아요',ready:true},
{id:'position',icon:'📍',name:'위치 기억하기',desc:'꽃이 있던 자리를 기억해요',ready:true},
{id:'odd',icon:'👀',name:'다른 그림 찾기',desc:'다른 하나를 찾아요',ready:true},
{id:'shopping',icon:'🛒',name:'장보기',desc:'살 물건을 기억하고 골라요',ready:true},
{id:'proverb',icon:'🗣️',name:'속담 완성',desc:'익숙한 속담을 완성해요',ready:false},
{id:'market',icon:'💰',name:'시장 계산',desc:'생활 속 계산을 해요',ready:false},
{id:'order',icon:'🔄',name:'생활 순서 맞추기',desc:'일상 행동 순서를 맞춰요',ready:false},
{id:'retro',icon:'📻',name:'추억의 물건',desc:'옛 물건을 떠올려요',ready:false}];
const pools={memory:['🍎','🐶','🚗','🌼','🍌','🐱','🚌','🥛','🥕','⚽','🍇','🐰'],shopping:['🍎','🥛','🥕','🍌','🍞','🥚','🧅','🥔','🍅','🧀','🍐','🥬']};
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}function show(id){views.forEach(v=>v.classList.toggle('active',v.id===id));scrollTo(0,0)}
function speak(t){if(!soundOn||!('speechSynthesis' in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ko-KR';u.rate=.88;speechSynthesis.speak(u)}
function setSound(){const b=$('soundToggle');b.textContent=soundOn?'🔊 소리 켜짐':'🔇 소리 꺼짐';b.setAttribute('aria-pressed',soundOn)}
function logResult(game,correct,extra={}){const list=JSON.parse(localStorage.getItem('braincare-results')||'[]');list.push({date:new Date().toISOString(),game,difficulty:level,correct,...extra});localStorage.setItem('braincare-results',JSON.stringify(list.slice(-200)))}
function finish(ok,msg){
  if(state.advancing)return;
  status.textContent=msg;
  logResult(current,ok);
  if(ok){
    state.advancing=true;
    speak('잘하셨어요! 다음 문제로 넘어갈게요.');
    mainBtn.hidden=true;
    stage.querySelectorAll('button').forEach(b=>b.disabled=true);
    timer=setTimeout(()=>{state.advancing=false;start()},1200);
  }else{
    speak('괜찮아요. 다시 한번 해볼까요?');
    mainBtn.hidden=true;
  }
}
function card(x,click,cls='choice-item'){const b=document.createElement('button');b.className=cls;b.textContent=x;if(click)b.onclick=click;return b}
function reset(){clearTimeout(timer);state={};stage.innerHTML='';stage.className='game-stage';stage.style.removeProperty('--grid');status.textContent='';mainBtn.hidden=false;mainBtn.textContent='시작하기';const g=games.find(x=>x.id===current);instruction.textContent=g?g.desc:''}
function openGame(id){current=id;reset();const g=games.find(x=>x.id===id);$('playTitle').textContent=g.name;show('playView');speak(g.name+' 놀이입니다.')}
function renderGames(){gameGrid.innerHTML='';games.forEach(g=>{const b=document.createElement('button');b.className='game-card';b.innerHTML=`<span class="emoji">${g.icon}</span><strong>${g.name}</strong><small>${g.desc}${g.ready?'':' · 준비 중'}</small>`;b.onclick=()=>g.ready?openGame(g.id):placeholder(g);gameGrid.appendChild(b)})}
function placeholder(g){$('placeholderTitle').textContent=g.name;$('placeholderEmoji').textContent=g.icon;$('placeholderText').textContent=g.name+'은 다음 업데이트에서 추가됩니다.';show('placeholderView')}
function start(){reset();mainBtn.hidden=true;if(current==='memory')memoryStart();if(current==='position')positionStart();if(current==='odd')oddStart();if(current==='shopping')shoppingStart()}
function memoryStart(){const n={easy:2,normal:3,hard:5}[level],choices={easy:4,normal:6,hard:9}[level];state.targets=shuffle(pools.memory).slice(0,n);instruction.textContent=`그림 ${n}개를 기억해 주세요.`;state.targets.forEach(x=>stage.appendChild(card(x,null,'display-item')));speak(instruction.textContent);timer=setTimeout(()=>{stage.innerHTML='';state.selected=[];instruction.textContent=`아까 보았던 그림 ${n}개를 모두 골라주세요.`;const extra=shuffle(pools.memory.filter(x=>!state.targets.includes(x))).slice(0,choices-n);shuffle([...state.targets,...extra]).forEach(x=>stage.appendChild(card(x,e=>{if(state.advancing)return;const b=e.currentTarget;if(b.classList.contains('selected')){b.classList.remove('selected');state.selected=state.selected.filter(v=>v!==x);status.textContent=''}else if(state.selected.length<n){b.classList.add('selected');state.selected.push(x)}if(state.selected.length===n){const ok=state.targets.every(t=>state.selected.includes(t));finish(ok,ok?'👏 잘하셨어요! 다음 문제로 넘어가요.':'조금 달랐어요. 선택을 바꿔 다시 맞혀보세요.')}})));speak(instruction.textContent)},4200)}
function positionStart(){const size=level==='hard'?4:3,n={easy:2,normal:3,hard:4}[level],total=size*size;state.targets=shuffle([...Array(total).keys()]).slice(0,n);stage.className='game-stage position-grid';stage.style.setProperty('--grid',size);instruction.textContent='꽃이 있는 자리를 기억해 주세요.';for(let i=0;i<total;i++){const d=document.createElement('div');d.className='position-cell';d.textContent=state.targets.includes(i)?'🌼':'';stage.appendChild(d)}speak(instruction.textContent);timer=setTimeout(()=>{stage.innerHTML='';state.selected=[];instruction.textContent='꽃이 있던 자리를 눌러주세요.';for(let i=0;i<total;i++){const b=card('',()=>{if(state.advancing||state.selected.includes(i))return;b.textContent='🌱';state.selected.push(i);if(state.selected.length===n){const ok=state.targets.every(t=>state.selected.includes(t));if(!ok){state.selected=[];setTimeout(()=>stage.querySelectorAll('button').forEach(x=>x.textContent=''),500)}finish(ok,ok?'👏 위치를 모두 기억하셨어요! 다음 문제로 넘어가요.':'괜찮아요. 다시 한번 골라보세요.')}},'position-cell');stage.appendChild(b)}speak(instruction.textContent)},3500)}
function oddStart(){stage.className='game-stage odd-grid';const count={easy:9,normal:12,hard:16}[level],sets=level==='hard'?[['🍎','🍅'],['🐶','🐕']]:[['🍎','🍅'],['🌼','🌻'],['🐱','🐯']],pair=sets[Math.floor(Math.random()*sets.length)],odd=Math.floor(Math.random()*count);instruction.textContent='다른 그림 하나를 찾아주세요.';for(let i=0;i<count;i++)stage.appendChild(card(i===odd?pair[1]:pair[0],()=>{if(state.advancing)return;const ok=i===odd;finish(ok,ok?'👏 맞아요! 다음 문제로 넘어가요.':'조금 더 살펴볼까요?')}));speak(instruction.textContent)}
function shoppingStart(){const n={easy:2,normal:3,hard:4}[level],choices={easy:6,normal:8,hard:10}[level];state.targets=shuffle(pools.shopping).slice(0,n);instruction.textContent=`오늘 시장에서 살 물건 ${n}개를 기억해 주세요.`;state.targets.forEach(x=>stage.appendChild(card(x,null,'display-item')));speak(instruction.textContent);timer=setTimeout(()=>{stage.innerHTML='';state.selected=[];instruction.textContent='시장에 왔어요. 아까 살 물건을 모두 골라주세요.';const extra=shuffle(pools.shopping.filter(x=>!state.targets.includes(x))).slice(0,choices-n);shuffle([...state.targets,...extra]).forEach(x=>stage.appendChild(card(x,e=>{if(state.advancing)return;const b=e.currentTarget;if(b.classList.contains('selected')){b.classList.remove('selected');state.selected=state.selected.filter(v=>v!==x);status.textContent=''}else if(state.selected.length<n){b.classList.add('selected');state.selected.push(x)}if(state.selected.length===n){const ok=state.targets.every(t=>state.selected.includes(t));finish(ok,ok?'🛒 잘하셨어요! 다음 장보기 문제로 넘어가요.':'목록과 조금 달라요. 선택을 바꿔보세요.')}})));speak(instruction.textContent)},4500)}
$('soundToggle').onclick=()=>{soundOn=!soundOn;localStorage.setItem('braincare-sound',soundOn?'on':'off');setSound()};
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=b.dataset.level;document.querySelectorAll('[data-level]').forEach(x=>x.classList.toggle('active',x===b));reset()});
document.querySelectorAll('[data-back-home]').forEach(b=>b.onclick=()=>show('homeView'));document.querySelectorAll('[data-back-games]').forEach(b=>b.onclick=()=>{reset();show('gamesView')});
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='free')show('gamesView');else if(a==='daily')openGame('memory');else placeholder({name:a==='memoryTrip'?'추억여행':'내 기록',icon:a==='memoryTrip'?'📻':'📊'})});
mainBtn.onclick=start;setSound();renderGames();