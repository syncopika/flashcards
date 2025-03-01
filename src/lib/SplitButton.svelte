<script lang="ts">
import type { Mode } from './types';

export let currMode: Mode;
let showOptions: boolean = false;

const showModeOptions = () => {
  showOptions = !showOptions;
};

</script>

<style>
  .changeModeButton {
    display: inline-block;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    transition: border-color 0.25s;
    margin: 4px;
  }
  
  .left {
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    border-right: 1px solid #ccc;
    border-radius: 8px 0px 0px 8px;
    background-color: #f9f9f9;
  }
  
  .left:hover {
    cursor: pointer;
    border-color: #646cff;
  }
  
  .right {
    padding: 0.6em 1.2em;
    border: 1px solid transparent;
    border-radius: 0px 8px 8px 0px;
    background-color: #f9f9f9;
  }
  
  .right:hover {
    cursor: pointer;
    border-color: #646cff;
  }
  
  .parent {
    display: flex;
    align-items: center;
  }
  
  li {
    list-style-type: none;
    border-bottom: 1px solid #ccc;
  }
  
  li:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
  
</style>

<div class="changeModeButton">
  <div class="parent">
    mode:
    <button class="left"> flashcard </button>
    {#if showOptions}
      <ul class="modeOptions">
        <li> quiz-pinyin </li>
        <li> quiz-definition </li>
      </ul>
    {/if}
    
    <!-- from iconoir.com (nav-arrow-down) -->
    <button class="right" on:click={showModeOptions}>
      <svg width="14px" height="14px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M6 9L12 15L18 9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </button>
  </div>
</div>
