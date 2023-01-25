<script lang="ts">
  import Card from './lib/Card.svelte';
  import Counter from './lib/Counter.svelte';
  import Navigate from './lib/Navigate.svelte';
  import { Mapper } from './lib/Mapper';
  import { onMount } from 'svelte';
  
  let datasets: string[] = [
    "chinese",
    "japanese"
  ];
  
  let selected: string = "chinese";
  let data: Record<string, string>[] = [];
  let currCardIndex: number = 0;
  let totalCards: number = data.length;
  
  // fetch data
  onMount(async () => {
      const mapper = new Mapper();
      const res = await fetch('datasets/chinese.json');
      const d = await res.json();
      
      data = mapper.processChineseDataset(d);
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
      }
      
      currCardIndex = 0;
      totalCards = data.length;
  }
  
  const onChangeSearch = async () => {
      const mapper = new Mapper();
      const res = await fetch(`datasets/${selected}.json`);
      const d = await res.json();
      
      let currData: Record<string, string>[];
      if(selected === "chinese"){
        currData = mapper.processChineseDataset(d);
      }else if(selected === "japanese"){
        currData = mapper.processJapaneseDataset(d);
      }
      
      const searchInput: HTMLInputElement | null = document.querySelector('.searchInput');
      if(searchInput){
          const inputVal = searchInput.value;
          if(inputVal !== ""){
            // then filter data
            const selectedRadioBtn: HTMLInputElement | null = document.querySelector('input[name="search-side-choice"]:checked');
            if(selectedRadioBtn){
                // TODO: create type here?
                const selectedSide: string = selectedRadioBtn.value;
                currData = currData.filter(x => (x[selectedSide]).includes(inputVal));
            }
          }
      }
      
      currCardIndex = 0;
      data = currData;
      totalCards = data.length;
  }
  
</script>

<button class="icon" on:click={toggleOptionsPanel}>
  <i class="fa fa-bars"></i>
</button>

<main>
  <div class="options-panel {showOptionsPanel ? 'options-panel-on' : 'options-panel-off'}">
    <p>dataset: &nbsp;</p>
    <select bind:value={selected} on:change={onChange}>
        {#each datasets as ds}
            <option value={ds}>{ds}</option>
        {/each}
    </select>
    <p> | </p>
    <p> search: </p>
    <input class="searchInput" type="text" name="search" on:input={onChangeSearch}>
    <p> | </p>
    <input type="radio" id="search-front-choice" name="search-side-choice" value="front" on:change={onChangeSearch}>
    <label for="search-front-choice">front</label>
    <input type="radio" id="search-back-choice" name="search-side-choice" value="back" on:change={onChangeSearch}>
    <label for="search-back-choice">back</label>
  </div>

  <h1>flashcards</h1>

  <Counter bind:currCardIndex bind:totalCards />
  
  <div class='cardContainer'>
    {#if totalCards > 0}
        <Card frontData={data[currCardIndex].front} backData={data[currCardIndex].back} />
    {/if}
  </div>
  
  <br />
  
  <Navigate bind:currCardIndex bind:totalCards />
  
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
        height: 65px;
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