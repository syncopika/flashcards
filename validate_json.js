// validate the JSON datasets
const fs = require('fs');

function checkDatasets(){
    const datasets = [
        "datasets/chinese.json",
        "datasets/japanese.json",
    ];

    datasets.forEach(dataset => {
        const json = fs.readFileSync(dataset);
        try {
            JSON.parse(json);
        } catch(err) {
            console.log(`${dataset} is invalid JSON. error: ${err}`);
            process.exit(1);
        }
    });
    
    process.exit(0);
}

checkDatasets();

