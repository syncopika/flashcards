// functions for analyzing the JSON datasets
import { readFileSync } from 'fs';

// https://github.com/syncopika/piano_roll_browser/blob/master/src/classes.js#L456C1-L518C2
// max-heap to help find out things like top 10 frequent Chinese characters
function PriorityQueue(){
  this.array = [];
  this.size = 0;
  this.lastIndex = 0;
    
  this.swap = function(idx1, idx2){
    const temp = this.array[idx1];
    this.array[idx1] = this.array[idx2];
    this.array[idx2] = temp;
  };
    
  this.add = function(thing){
    this.array[this.lastIndex++] = thing;
    this.size++;
    
    if(this.array.length === 1){
      return; // nothing to do if adding the first element to the heap
    }
    
    // bubble-up
    let currIdx = this.lastIndex - 1;
    let parentIdx = Math.floor((currIdx - 1) / 2);
    
    // notice we're assuming the element at the index is an object with a "freq" property.
    // TODO: can we make things more modular and pass in some arbitrary comparison function?
    //console.log(`comparing parent idx ${parentIdx} with current idx ${currIdx}, size: ${this.size}`);
    while(parentIdx >= 0 && this.array[parentIdx].freq < this.array[currIdx].freq){
      this.swap(currIdx, parentIdx);
      currIdx = parentIdx;
      parentIdx = Math.floor((currIdx - 1) / 2);
    }
  };
  
  this.remove = function(){
    if(this.size === 0){
      return null;
    }
        
    const root = this.array[0];
        
    this.array[0] = this.array[this.lastIndex - 1]; // move last node to root
    this.lastIndex--;
        
    // bubble-down
    for(let i = 0; (2*i + 1) < this.array.length; i++){
      let smallestChildIdx = 2*i + 1;
      const rightChildIdx = 2*i + 2;
            
      if(rightChildIdx < this.array.length){
        // compare against right child since it exists
        // TODO: can we make things more modular and pass in some arbitrary comparison function?
        if(this.array[smallestChildIdx].freq < this.array[rightChildIdx].freq){
          smallestChildIdx = rightChildIdx;
        }
      }
      
      // TODO: can we make things more modular and pass in some arbitrary comparison function?
      if(this.array[i].freq < this.array[smallestChildIdx].freq){
        this.swap(i, smallestChildIdx);
      }
    }
        
    this.size--;
        
    return root;
  };
    
  this.peek = function(){
    return this.array[0];
  };
}

function getUniqueChineseCharacters(){
  const chineseJson = readFileSync("public/datasets/chinese.json");
  const data = JSON.parse(chineseJson);
  
  const uniqueCharsSeen = {};
  
  data.forEach(row => {
    const chars = row.value.split('');
    chars.forEach(c => {
      if(uniqueCharsSeen[c]){
        uniqueCharsSeen[c]++;
      }else{
        uniqueCharsSeen[c] = 1;
      }
    });
  });
  
  return uniqueCharsSeen;
}

function getMostCommonChineseCharacter(characterCountMap, numToReturn){  
  const maxHeap = new PriorityQueue();
  for(let char in characterCountMap){
    maxHeap.add({character: char, freq: characterCountMap[char]});
  }
  
  const results = [];
  
  for(let i = 0; i < numToReturn; i++){
    results.push(maxHeap.remove());
  }
  
  return results;
}

// if using a Windows terminal, try running "chcp 950" first to be able to see traditional Chinese in the terminal
function getStats(){
  // count number of unique Chinese characters
  const uniqueChineseChars = getUniqueChineseCharacters();
  const totalUniqueCount = Object.keys(uniqueChineseChars).length;
  const mostCommonChars = getMostCommonChineseCharacter(uniqueChineseChars, 10);
  
  console.log(`number of unique Chinese characters in Chinese dataset: ${totalUniqueCount}`);
  
  console.log('--------------------');
  
  console.log('10 most common Chinese characters in dataset: ');
  for(let char of mostCommonChars){
    console.log(`character: ${char.character}, freq: ${char.freq} times`);
  }
  
  console.log('--------------------');
 
  process.exit(0);
}

getStats();

