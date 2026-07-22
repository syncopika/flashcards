// functions for analyzing the JSON datasets
import { readFileSync } from 'fs';

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

function getMostCommonChineseCharacter(characterCountMap){
  let freq = 0;
  let mostCommon = null;
  for(let char in characterCountMap){
    if(characterCountMap[char] > freq){
      mostCommon = char;
      freq = characterCountMap[char];
    }
  }
  return {word: mostCommon, count: freq};
}

// if using a Windows terminal, try running "chcp 950" first to be able to see traditional Chinese in the terminal
function getStats(){
  // count number of unique Chinese characters
  const uniqueChineseChars = getUniqueChineseCharacters();
  const totalUniqueCount = Object.keys(uniqueChineseChars).length;
  const mostCommonChar = getMostCommonChineseCharacter(uniqueChineseChars);
  
  console.log(`number of unique Chinese characters in Chinese dataset: ${totalUniqueCount}`);
  console.log(`most common character in Chinese dataset: ${mostCommonChar.word}, freq: ${mostCommonChar.count} times`);
 
  process.exit(0);
}

getStats();

