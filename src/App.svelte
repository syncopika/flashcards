<script lang="ts">
  import Card from './lib/Card.svelte';
  import Counter from './lib/Counter.svelte';
  import Navigate from './lib/Navigate.svelte';
  import { Mapper } from './lib/Mapper';
  import { onMount } from 'svelte';
  
  let datasets: string[] = [
    "bopomofo",
    "chinese",
    "japanese"
  ];
  
  let selected: string = "chinese";
  let data: Record<string, string>[] = [];
  let filteredData: Record<string, string>[] = [];
  let currCardIndex: number = 0;
  let totalCards: number = data.length;
  
  // get references to these components that have functions we want to call
  let navComponent;
  let cardComponent;
  
  // https://stackoverflow.com/questions/58287729/how-can-i-export-a-function-from-a-svelte-component-that-changes-a-value-in-the
  // https://svelte.dev/tutorial/svelte-window
  function handleKeydown(evt){
    if(evt.code === 'ArrowLeft'){
        if(navComponent) navComponent.prev();
    }else if(evt.code === 'ArrowRight'){
        if(navComponent) navComponent.next();
    }else if(evt.code === 'Space'){
        if(cardComponent) cardComponent.flip();
    }
  }
  
  // fetch data
  onMount(async () => {
      const mapper = new Mapper();
      const res = await fetch('datasets/chinese.json');
      const d = await res.json();
      
      data = mapper.processChineseDataset(d);
      filteredData = data;
      totalCards = data.length;
  });
  
  let showOptionsPanel: boolean = false;
  
  const toggleOptionsPanel = () => {
    showOptionsPanel = !showOptionsPanel;
  }
  
  const onChange = async () => {
      const mapper = new Mapper();
      const res = await fetch(`datasets/${selected}.json`);
      const d = await res.json();
      
      if(selected === "chinese"){
        data = mapper.processChineseDataset(d);
      }else if(selected === "japanese"){
        data = mapper.processJapaneseDataset(d);
      }else if(selected === "bopomofo"){
        data = mapper.processBopomofoDataset(d);
      }
      
      currCardIndex = 0;
      totalCards = data.length;
      filteredData = data;
  }
  
  const onChangeSearch = async () => {
      const searchInput: HTMLInputElement | null = document.querySelector('.searchInput');
      if(searchInput){
          const inputVal = searchInput.value;
          if(inputVal !== ""){
            // then filter data
            const selectedRadioBtn: HTMLInputElement | null = document.querySelector('input[name="search-side-choice"]:checked');
            if(selectedRadioBtn){
                // TODO: create type here (e.g. instead of string, either 'front' or 'back')?
                const selectedSide: string = selectedRadioBtn.value;
                filteredData = data.filter(x => (x[selectedSide]).includes(inputVal));
            }
          }else{
            filteredData = data;
          }
      }
      
      currCardIndex = 0;
      totalCards = filteredData.length;
  }
  
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
  }
  
</script>

<svelte:window on:keydown={handleKeydown} />

<button class="icon" on:click={toggleOptionsPanel}>
  <i class="fa fa-bars"></i>
</button>

<main>
  <div class="options-panel {showOptionsPanel ? 'options-panel-on' : 'options-panel-off'}">
    <p>dataset: </p>
    <select bind:value={selected} on:change={onChange}>
        {#each datasets as ds}
            <option value={ds}>{ds}</option>
        {/each}
    </select>
    <p> | </p>
    <p> search: </p>
    <input class="searchInput" type="text" name="search" on:input={onChangeSearch}>
    <input type="radio" id="search-front-choice" name="search-side-choice" value="front" on:change={onChangeSearch}>
    <label for="search-front-choice">front</label>
    <input type="radio" id="search-back-choice" name="search-side-choice" value="back" on:change={onChangeSearch}>
    <label for="search-back-choice">back</label>
    <button on:click={shuffle}>shuffle</button>
  </div>

  <h1>flashcards</h1>

  <Counter bind:currCardIndex bind:totalCards />
  
  <div class='cardContainer'>
    {#if totalCards > 0}
        <Card bind:this={cardComponent} frontData={filteredData[currCardIndex].front} backData={filteredData[currCardIndex].back} />
    {/if}
  </div>
  
  <br />
  
  <Navigate bind:this={navComponent} bind:currCardIndex bind:totalCards />
  
</main>

<style>
    .cardContainer {
        height: 200px;
        width: 280px;
        margin: 0 auto;
        margin-bottom: 5%;
        perspective: 1000px;
    }
    
    .options-panel {
        position: fixed;
        width: 100%;
        left: 0;
        box-shadow: 0px 1px 1px #ccc;
    }
    
    .options-panel>* {
        display: inline-block;
    }
    
    .options-panel-on {
        top: 0;
        transition: 0.5s;
    }
    
    .options-panel-off {
        height: 0px;
        top: -100px;
        transition: 0.5s;
    }
    
    .icon {
        position: relative;
        z-index: 10;
    }
    
    #search-front-choice, #search-back-choice {
        display: inline-block;
    }
</style>