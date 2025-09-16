// validate the JSON datasets
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
            const data = JSON.parse(json);
            console.log(`${dataset} is valid JSON.`);
            
            // flag any duplicates
            checkDuplicates(data);
            
            // check if any data is missing a value
            if(dataset.includes('chinese')){
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
    console.log(`line ${idx + 2} is missing a definition or value or pinyin`);
    throw new Error('missing data');
  }
}

// detect duplicates
function checkDuplicates(data){
  const seen = new Set();
  data.forEach((row, idx) => {
    if(seen.has(row.value)){
      throw new Error(`duplicate detected on line ${idx + 2}: ${row.value}`);
    }
    seen.add(row.value);
  });
}

checkDatasets();

