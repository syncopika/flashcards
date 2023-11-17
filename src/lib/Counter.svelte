<script lang="ts">

export let currCardIndex: number;
export let totalCards: number;

</script>

<style>
  .counter p {
    display: inline-block;
  }
</style>

<div class='counter'>
  <p>{currCardIndex + 1}</p>
  <p> / </p>
  <p>{totalCards}</p>
</div>
