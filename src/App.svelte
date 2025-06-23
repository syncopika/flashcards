<script lang="ts">
import type { Mode } from './lib/types';
import Card from './lib/Card.svelte';
import Counter from './lib/Counter.svelte';
import Navigate from './lib/Navigate.svelte';
import { Mapper } from './lib/Mapper';
import { DrawingCanvas } from './lib/DrawingCanvas';
import { onMount } from 'svelte';

interface HanziLookupResult {
  hanzi: string;
  score: number;
}

let datasets: string[] = [
  'bopomofo',
  'chinese',
  'japanese',
  'cantonese',
];

let selected: string = 'chinese';
let currMode: Mode = 'flashcard';
let data: Record<string, string>[] = [];
let filteredData: Record<string, string>[] = [];
let currCardIndex: number = 0;
let totalCards: number = data.length;

// set up web worker for chinese character recognition
// https://github.com/gugray/hanzi_lookup
const worker = new Worker('hanzi_lookup_worker.js');
worker.onmessage = (e) => {
  if (!e.data.what) return;
  if (e.data.what == "lookup"){
    //console.log(e.data.matches);
    openResults(e.data.matches);
  }
}
worker.postMessage({wasm_uri: 'hanzi_lookup_bg.wasm'});

const drawingCanvas: DrawingCanvas = new DrawingCanvas(worker);

// for handling swipe events
let touchStartX: number | undefined;

// get references to these components that have functions we want to call
let navComponent: Navigate | undefined;
let cardComponent: Card | undefined;

// https://stackoverflow.com/questions/58287729/how-can-i-export-a-function-from-a-svelte-component-that-changes-a-value-in-the
// https://svelte.dev/tutorial/svelte-window
function handleKeydown(evt: KeyboardEvent){
  const target = evt.target as HTMLInputElement;
  if(evt.code === 'ArrowLeft'){
    if(navComponent) navComponent.prev();
  }else if(evt.code === 'ArrowRight'){
    if(navComponent) navComponent.next();
  }else if(evt.code === 'Space'){
    if(target.name !== 'search'){
      evt.preventDefault(); // prevent any button presses with spacebar
      if(cardComponent) cardComponent.flip();
    }
  }
}

async function getJSONDataset(dataName: string){
  try {
    // try getting json from repo (rely on one source only for data). this way I don't have to keep updating the data in multiple places
    // e.g. if I have my deployment on a different branch I don't have to keep updating the datasets there
    const filename = `https://raw.githubusercontent.com/syncopika/flashcards/refs/heads/main/public/datasets/${dataName}.json`;
    console.log(`getting data from: ${filename}`);
    return await fetch(filename);
  }catch(err){
    // otherwise fall back to the file in /datasets. may be outdated
    console.log(err);
    console.log('getting data from local dataset instead');
    return await fetch(`datasets/${dataName}.json`);
  }
}

// fetch data
onMount(async () => {
  const mapper = new Mapper();
  const res = await getJSONDataset('chinese');
  const d = await res.json();
  
  data = mapper.processChineseDataset(d);
  filteredData = data;
  totalCards = data.length;
});

let showOptionsPanel: boolean = false;

const toggleOptionsPanel = () => {
  showOptionsPanel = !showOptionsPanel;
};

const onChange = async () => {
  const mapper = new Mapper();
  
  const res = await getJSONDataset(selected);
  const d = await res.json();
  
  if(selected === "chinese"){
    data = mapper.processChineseDataset(d);
  }else if(selected === "japanese"){
    data = mapper.processJapaneseDataset(d);
  }else if(selected === "bopomofo"){
    data = mapper.processBopomofoDataset(d);
  } else if(selected === "cantonese"){
    data = mapper.processCantoneseDataset(d);
  }
  
  currCardIndex = 0;
  totalCards = data.length;
  filteredData = data;
};

const onChangeSearch = async () => {
  const searchInput: HTMLInputElement | null = document.querySelector('.search-input');
  if(searchInput && currMode === 'flashcard'){
    const inputVal = searchInput.value;
    if(inputVal !== ""){
      // then filter data
      const selectedRadioBtn: HTMLInputElement | null = document.querySelector('input[name="search-side-choice"]:checked');
      if(selectedRadioBtn){
        // TODO: create type here (e.g. instead of string, either 'front' or 'back' or 'tag')?
        const selectedSide: string = selectedRadioBtn.value;
        
        if(selectedSide === 'back' && inputVal.split(' ').length > 1){
          // if user wants to look up a compound and knows the pinyin but not the tones
          // but also handle case where user might be trying to lookup by definition
          // and their input contains multiple words
          
          // TODO: maybe need to refine search params for definition, pinyin, and character 
          // instead of card side?
          filteredData = data.filter(x => {
            const val = inputVal.split(' ').join('');
            const regex = x.pinyin.match(/[a-z]+/g).join('');
            return val === regex || x[selectedSide]?.includes(inputVal);
          });
        }else{
          filteredData = data.filter(x => x[selectedSide]?.includes(inputVal));
        }
      }
    }else{
      filteredData = data;
    }
  }
  
  currCardIndex = 0;
  totalCards = filteredData.length;
};

const onChangeSearchDebounce = () => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      onChangeSearch();
    }, 200);
  }
};

const searchDebounce = onChangeSearchDebounce();

const shuffle = () => {
  // TODO: make some animation to go along with this?
  
  // shuffle the cards - https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  const maxIndex = filteredData.length - 1;
  for(let i = 0; i < filteredData.length - 2; i++){
    const newIdx = Math.floor(Math.random() * (maxIndex - i) + i);
    const temp = filteredData[i];
    filteredData[i] = filteredData[newIdx];
    filteredData[newIdx] = temp;
  }
  
  // update current card @ current index after shuffle
  const newCurrIdx = Math.floor(Math.random() * maxIndex);
  currCardIndex = newCurrIdx;
};

const changeMode = (evt: Event) => {
  const target = evt.target as HTMLSelectElement;
  const selected = target.value as Mode;
  if(selected.includes('quiz')){
    shuffle();
  }
  currMode = selected;
};

const getPossibleQuizAnswers = (correctAnswerIndex: number): Array<Record<string, string>> => {
  // we want to add in a couple of random answers to the set of
  // possible answers (which of course should include the correct answer)
  
  const possibleAnswers = [
    filteredData[correctAnswerIndex],
    filteredData[Math.floor(Math.random() * totalCards)],
    filteredData[Math.floor(Math.random() * totalCards)],
  ];
  
  // shuffle the array
  // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  let counter = possibleAnswers.length;
  while(counter > 0){
    const idx = Math.floor(Math.random() * counter);
    counter--;
    const tmp = possibleAnswers[counter];
    possibleAnswers[counter] = possibleAnswers[idx];
    possibleAnswers[idx] = tmp;
  }
  return possibleAnswers;
};

const checkQuizAnswer = (evt: Event) => {
  const target = evt.target as HTMLElement;
  const choice = target.textContent.trim();
  const originalBtnBgColor = target.style.backgroundColor;
  
  let actualAnswer;
  if(currMode === 'quiz-pinyin'){
    actualAnswer = filteredData[currCardIndex].pinyin.trim();
  }else if(currMode === 'quiz-definition'){
    actualAnswer = filteredData[currCardIndex].definition.trim();
  }
  
  if(choice === actualAnswer){
    target.style.border = "1px solid #32cd32";
    target.style.backgroundColor = "#32cd32";
  }else{
    target.style.border = "1px solid #cd3232";
    target.style.backgroundColor = "#cd3232";
  }
  
  setTimeout(() => {
    target.style.border = "1px solid #000";
    target.style.backgroundColor = originalBtnBgColor;
  }, 2000);
};

const touchstart = (evt: TouchEvent) => {
  touchStartX = evt.touches[0].screenX;
};

const touchend = (evt: TouchEvent) => {
  const end = evt.changedTouches[0].screenX;
  if(touchStartX && Math.abs(end - touchStartX) > 10){
    if(end < touchStartX){
      // swipe left, go forwards
      if(currCardIndex + 1 > totalCards - 1){
          currCardIndex = 0;
      }else{
          currCardIndex++;
      }
    }else{
      // swipe right, go backwards
      if(currCardIndex - 1 < 0){
        currCardIndex = totalCards - 1;
      }else{
        currCardIndex--;
      }
    }
  }
};

const openDrawingCanvas = () => {
  const overlay = document.createElement('div');
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '100';
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.8)';
  overlay.style.textAlign = 'center';
  
  const header = document.createElement('h1');
  header.textContent = 'draw a character';
  
  const canvas = drawingCanvas.getCanvas();
  
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'submit';
  submitBtn.addEventListener('click', () => {
    drawingCanvas.lookup();
    overlay.parentNode.removeChild(overlay);
  });
  
  const clearBtn = document.createElement('button');
  clearBtn.style.marginLeft = '6px';
  clearBtn.textContent = 'clear';
  clearBtn.addEventListener('click', () => {
    drawingCanvas.drawClearCanvas();
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.style.marginLeft = '6px';
  cancelBtn.textContent = 'cancel';
  cancelBtn.addEventListener('click', () => {
    drawingCanvas.drawClearCanvas();
    overlay.parentNode.removeChild(overlay);
  });
  
  overlay.appendChild(header);
  overlay.appendChild(canvas);
  overlay.appendChild(document.createElement('br'));
  overlay.appendChild(submitBtn);
  overlay.appendChild(clearBtn);
  overlay.appendChild(cancelBtn);
  document.body.appendChild(overlay);
};

// display any matched characters from web worker job
const openResults = (results: HanziLookupResult[]) => {
  const overlay = document.createElement('div');
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '100';
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.8)';
  overlay.style.textAlign = 'center';
  
  const header = document.createElement('h1');
  header.textContent = 'match results';
  
  const display = document.createElement('div');
  display.style.display = 'flex';
  display.style.flexWrap = 'wrap';
  display.style.alignItems = 'center';
  display.style.justifyContent = 'center';
  display.style.gap = '1em';
  display.style.margin = '0 auto';
  display.style.width = 'auto';
  
  results.forEach(r => {
    const resultElement = document.createElement('div');
    resultElement.style.padding = '5px';
    
    const hanzi = document.createElement('h1');
    hanzi.textContent = r.hanzi;
    hanzi.style.fontWeight = 'bold';
    
    const matchScore = document.createElement('p');
    matchScore.textContent = `match score: ${r.score}`;
    
    resultElement.appendChild(hanzi);
    resultElement.appendChild(matchScore);
    
    resultElement.classList.add('match-result');
    resultElement.addEventListener('click', () => {
      // add to search input
      const searchInput: HTMLInputElement | null = document.querySelector('.search-input');
      if(searchInput) searchInput.value = r.hanzi;
    });
    resultElement.style.backgroundColor = '#fff';
    
    display.appendChild(resultElement);
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.style.marginLeft = '6px';
  cancelBtn.textContent = 'cancel';
  cancelBtn.addEventListener('click', () => {
    overlay.parentNode.removeChild(overlay);
  });
  
  overlay.appendChild(header);
  overlay.appendChild(display);
  overlay.appendChild(document.createElement('br'));
  overlay.appendChild(cancelBtn);
  document.body.appendChild(overlay);
};

</script>

<svelte:window on:keydown={handleKeydown} on:touchstart={touchstart} on:touchend={touchend} />

<button class="icon" on:click={toggleOptionsPanel}>
  <i class="fa fa-bars"></i>
</button>

<header class="options-panel {showOptionsPanel ? 'options-panel-on' : 'options-panel-off'}">
  <p>dataset: </p>
  <select bind:value={selected} on:change={onChange} disabled={currMode.includes('quiz-')}>
    {#each datasets as ds}
      <option value={ds}>{ds}</option>
    {/each}
  </select>
  <p> | </p>
  <p> search: </p>
  <input 
    class="search-input" 
    type="text" 
    name="search" 
    on:input={searchDebounce}
  >
  {#if selected === "chinese"}
  <button class="pencil-button" on:click={openDrawingCanvas}>
    <!-- pencil svg icon is from https://iamvector.com/all-icons?search=pencil ("Pencil industry business") -->
    <svg fill="#000000" width="24px" height="24px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.3,5.54,7.161,19.682c-.01.01-.013.023-.022.033a.99.99,0,0,0-.172.26c-.01.021-.022.041-.03.063s-.013.023-.017.036L4.8,26.437A1,1,0,0,0,6.063,27.7l6.364-2.121c.013,0,.023-.013.036-.017s.041-.02.063-.03a.99.99,0,0,0,.26-.172c.01-.009.023-.012.033-.022L26.96,11.2a4,4,0,0,0,0-5.657A4.1,4.1,0,0,0,21.3,5.54ZM7.328,25.172l.977-2.932,1.955,1.955Zm4.783-1.954L9.282,20.389,21.3,8.368,24.132,11.2ZM25.546,9.783,22.717,6.954a2.048,2.048,0,0,1,2.829,0,2,2,0,0,1,0,2.829ZM21.3,11.2a1,1,0,0,1,0,1.414l-7.778,7.778a1,1,0,0,1-1.414-1.414L19.889,11.2A1,1,0,0,1,21.3,11.2Z">
      </path>
    </svg>
  </button>
  {/if}
  
  <div>
    <input
      type="radio"
      id="search-front-choice"
      name="search-side-choice"
      value="front"
      on:change={onChangeSearch}
    >
    <label for="search-front-choice">front</label>
    
    <input
      type="radio"
      id="search-back-choice"
      name="search-side-choice"
      value="back"
      on:change={onChangeSearch}
    >
    <label for="search-back-choice">back</label>
    
    <input
      type="radio"
      id="search-tag-choice"
      name="search-side-choice"
      value="tags"
      on:change={onChangeSearch}
    >
    <label for="search-tag-choice">tag</label>
  </div>
  
  <p> | </p>
  
  <button on:click={shuffle}>shuffle</button>
  
  {#if selected === "chinese"}
    <!-- <button id="changeModeButton" on:click={changeMode}>quiz mode</button> -->
    <p> | </p>
    <p> mode: </p>
    <select bind:value={currMode} on:change={changeMode}>
        <option value='flashcard'>flashcard</option>
        <option value='quiz-pinyin'>pinyin quiz</option>
        <option value='quiz-definition'>definition quiz</option>
    </select>
  {/if}
</header>

<main>
  <h1>flashcards</h1>

  {#if currMode === 'flashcard'}
    <Counter bind:currCardIndex bind:totalCards />
    
    <div class='card-container'>
      {#if totalCards > 0}
        <Card
          bind:this={cardComponent}
          frontData={filteredData[currCardIndex].front}
          backData={filteredData[currCardIndex].back}
          tags={filteredData[currCardIndex].tags}
        />
      {/if}
    </div>
    
    <Navigate bind:this={navComponent} bind:currCardIndex bind:totalCards />
  {:else if currMode === 'quiz-pinyin'}
    {@const possibleAnswers = getPossibleQuizAnswers(currCardIndex)}
    <div>
      <h2>what is the pinyin for <a target="_blank" href={`http://google.com/search?q=${filteredData[currCardIndex].value}`}>{filteredData[currCardIndex].value}</a>?</h2>
      <button class="quiz-answer-choice" on:click={checkQuizAnswer}>{possibleAnswers[0].pinyin}</button>
      <button class="quiz-answer-choice" on:click={checkQuizAnswer}>{possibleAnswers[1].pinyin}</button>
      <button class="quiz-answer-choice" on:click={checkQuizAnswer}>{possibleAnswers[2].pinyin}</button>
      <button on:click={shuffle}> next </button>
    </div>
  {:else if currMode === 'quiz-definition'}
    {@const possibleAnswers = getPossibleQuizAnswers(currCardIndex)}
    <div>
      <h2>what is the definition for <a target="_blank" href={`http://google.com/search?q=${filteredData[currCardIndex].value}`}>{filteredData[currCardIndex].value}</a>?</h2>
      <button class="quiz-answer-choice" on:click={checkQuizAnswer}>{possibleAnswers[0].definition}</button>
      <button class="quiz-answer-choice" on:click={checkQuizAnswer}>{possibleAnswers[1].definition}</button>
      <button class="quiz-answer-choice" on:click={checkQuizAnswer}>{possibleAnswers[2].definition}</button>
      <button on:click={shuffle}> next </button>
    </div>
  {/if}
</main>

<style>
:global(.match-result):hover {
  cursor: pointer;
  outline: 1px solid #000;
}

:global(.match-result){
  color: #000;
}
</style>