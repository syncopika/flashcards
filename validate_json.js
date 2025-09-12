// validate the JSON datasets
// TODO: can we also detect duplicates?
import { readFileSync } from 'fs';

function checkDatasets(){
    const datasets = [
        "public/datasets/chinese.json",
        "public/datasets/japanese.json",
        "public/datasets/cantonese.json",
    ];

    datasets.forEach(dataset => {
        const json = readFileSync(dataset);
        try {
            JSON.parse(json);
            console.log(`${dataset} is valid JSON.`);
            
            if(dataset.includes('chinese')){
              const data = JSON.parse(json);
              data.forEach((row, idx) => checkValues(idx, row));
            }
        } catch(err) {
            console.log(`${dataset} is invalid JSON. error: ${err}`);
            process.exit(1);
        }
    });
    
    process.exit(0);
}

// make sure definition, value, pinyin are populated
function checkValues(idx, row){
  if(row.definition === "" || row.value === "" || row.pinyin === ""){
    console.log(`line ${idx + 2} is missing a definition or value`);
    throw new Error('missing data');
  }
}

checkDatasets();

