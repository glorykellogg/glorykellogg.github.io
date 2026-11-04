'use strict';
const x='<mi>x</mi>', C='<mo>+</mo><mi>C</mi>';
const power=(base,n)=>`<msup>${base}<mn>${n}</mn></msup>`;
const integral=body=>`<mo largeop="true">∫</mo><mspace width="0.25em"/>${body}<mspace width="0.25em"/><mi mathvariant="normal">d</mi>${x}`;
const frac=(a,b)=>`<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`;
const trig=name=>`<mi mathvariant="normal">${name}</mi><mspace width="0.15em"/>${x}`;
const exp=exponent=>`<msup><mi>e</mi><mrow>${exponent}</mrow></msup>`;
const pairs=[
[integral('<mn>2</mn>'+x),power(x,2)+C,'integral of 2 x','x squared plus C'],
[integral(power(x,2)),frac(power(x,3),'<mn>3</mn>')+C,'integral of x squared','x cubed over 3 plus C'],
[integral(trig('cos')),trig('sin')+C,'integral of cosine x','sine x plus C'],
[integral(exp('<mn>2</mn>'+x)),frac(exp('<mn>2</mn>'+x),'<mn>2</mn>')+C,'integral of e to the 2 x','e to the 2 x over 2 plus C'],
[integral(frac('<mn>1</mn>',x)),'<mi mathvariant="normal">ln</mi><mo>|</mo>'+x+'<mo>|</mo>'+C,'integral of 1 over x','natural logarithm of absolute x plus C'],
[integral(x+exp(x)),'<mo>(</mo>'+x+'<mo>−</mo><mn>1</mn><mo>)</mo>'+exp(x)+C,'integral of x times e to the x','x minus 1 times e to the x plus C'],
[integral(trig('sin')),'<mo>−</mo>'+trig('cos')+C,'integral of sine x','negative cosine x plus C'],
[integral('<mn>3</mn>'+power(x,2)),power(x,3)+C,'integral of 3 x squared','x cubed plus C']
];
const board=document.querySelector('.board'),status=document.querySelector('#status');
const timer=document.querySelector('.timer');
let deck=[],selected=null,matched=new Set();
let startedAt=null,clock=null;
function updateTimer(){
const seconds=startedAt===null?0:Math.floor((performance.now()-startedAt)/1000);
const minutes=Math.floor(seconds/60);
timer.textContent=String(minutes).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}
function startTimer(){if(startedAt!==null)return;startedAt=performance.now();clock=setInterval(updateTimer,200);updateTimer();}
function stopTimer(){if(clock!==null)clearInterval(clock);clock=null;updateTimer();}

function shuffle(cards){for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
function fitEquation(button){
const equation=button.querySelector('math');
if(!equation)return;
equation.style.transform='none';
const style=getComputedStyle(button);
const width=button.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-8;
const height=button.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-8;
const bounds=equation.getBoundingClientRect();
if(bounds.width>0&&bounds.height>0){
const scale=Math.min(1,Math.max(0,width)/bounds.width,Math.max(0,height)/bounds.height);
equation.style.transform=`scale(${scale})`;
}
}
function fitAllEquations(){for(const button of board.children)fitEquation(button);}
function paint(i){const b=board.children[i], c=deck[i],show=matched.has(i)||selected===i;
b.classList.toggle('selected',selected===i);b.classList.toggle('matched',matched.has(i));
b.innerHTML=show?`<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" aria-hidden="true"><mrow>${c.math}</mrow></math>`:'∫';
b.setAttribute('aria-label',show?`${c.label}${matched.has(i)?', matched':', selected'}`:`Face-down card ${i+1}`);
b.setAttribute('aria-pressed',String(selected===i));b.setAttribute('aria-disabled',String(matched.has(i)));fitEquation(b);}
function flip(i){if(matched.has(i)||selected===i)return;startTimer();const previous=selected;selected=i;paint(i);
if(previous===null){status.textContent='Card selected. Choose another card.';return;}
if(deck[previous].key===deck[i].key&&deck[previous].kind!==deck[i].kind){matched.add(previous);matched.add(i);selected=null;paint(previous);paint(i);if(matched.size===deck.length){stopTimer();status.textContent='All eight pairs matched in '+timer.textContent+'.';}else{status.textContent='Match found.';}}else{paint(previous);status.textContent='No match. The second card remains selected.';}}
function restart(){if(clock!==null)clearInterval(clock);clock=null;startedAt=null;updateTimer();deck=shuffle(pairs.flatMap((p,key)=>[{key,kind:'integral',math:p[0],label:p[2]},{key,kind:'answer',math:p[1],label:p[3]}]));selected=null;matched=new Set();board.replaceChildren();deck.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='card';b.style.setProperty('--paper-x',`${Math.random()*100}%`);b.style.setProperty('--paper-y',`${Math.random()*100}%`);b.style.setProperty('--paper-size',`${125+Math.random()*35}%`);b.addEventListener('click',()=>flip(i));board.append(b);paint(i);});status.textContent='New shuffled board.';}
restart();

new ResizeObserver(fitAllEquations).observe(board);
if(document.fonts)document.fonts.ready.then(fitAllEquations);

// Randomize the paper independently of card positions and matching pairs.
const paperStyle=document.documentElement.style;
paperStyle.setProperty('--background-paper-x',`${Math.floor(Math.random()*800)}px`);
paperStyle.setProperty('--background-paper-y',`${Math.floor(Math.random()*800)}px`);
paperStyle.setProperty('--background-paper-size',`${720+Math.floor(Math.random()*240)}px`);
