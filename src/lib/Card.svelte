<script lang="ts">
  let front: boolean = true; // if front of card is shown currently
  
  export const flip = () => {
    front = !front;
  }
  
  export let frontData: string = "front of card";
  export let backData: string = "back of card";
</script>

<style>
    .cardInner {
        border: 1px solid #000;
        border-radius: 10px;
        position: relative;
        width: 100%;
        height: 100%;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: transform 0.6s;
        transform-style: preserve-3d;
        padding: 3px;
    }
    
    .cardInner:hover, .cardInnerFlipped:hover {
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);
    }
    
    .cardInnerFlipped {
        border: 1px solid #000;
        border-radius: 10px;
        position: relative;
        width: 100%;
        height: 100%;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: transform 0.6s;
        transform-style: preserve-3d;
        transform: rotateY(180deg); /* keep the card flipped 180 */
        padding: 3px;
    }

    .front, .back {
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }
    
    .front {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
    }
    
    .back {
        transform: rotateY(180deg); /* rotate the text content as well so it matches */
    }
</style>

<div class="{front ? 'cardInner' : 'cardInnerFlipped'}" on:click={flip}>
    {#if front}
        <div class='front'>{@html frontData}</div>
    {/if}
    {#if !front}
        <div class='back'>{@html backData}</div>
    {/if}
</div>
