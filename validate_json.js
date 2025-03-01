// validate the JSON datasets
import { readFileSync } from 'fs';

function checkDatasets(){
    const datasets = [
        "public/datasets/chinese.json",
        "public/datasets/japanese.json",
    ];

    datasets.forEach(dataset => {
        const json = readFileSync(dataset);
        try {
            JSON.parse(json);
            console.log(`${dataset} is valid JSON.`);
        } catch(err) {
            console.log(`${dataset} is invalid JSON. error: ${err}`);
            process.exit(1);
        }
    });
    
    process.exit(0);
}

checkDatasets();

