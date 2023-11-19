<script lang="ts">

export let currCardIndex: number;
export let totalCards: number;

export const prev = () => {
  if(currCardIndex - 1 < 0){
    currCardIndex = totalCards - 1;
  }else{
    currCardIndex--;
  }
};

export const next = () => {
  if(currCardIndex + 1 > totalCards - 1){
    currCardIndex = 0;
  }else{
    currCardIndex++;
  }
};
    
</script>

<style>
.navigate button {
  display: inline-block;
}
</style>

<div class='navigate'>
  <button on:click={prev}>prev</button>
  <button on:click={next}>next</button>
</div>
