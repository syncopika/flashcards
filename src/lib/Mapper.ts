export class Mapper {

    // use this class to create methods for
    // converting arbitrary json data to an array of {'front': '', 'back': ''} objects,
    // which is what Card.svelte expects
    // if there's a new json dataset, a new mapper method should be made to be able to process it
    
    // we expect chinese character datasets
    // to be arranged like an array of {"value": "匂", "pinyin": "xiong1", "definition": "fragrance, smell;"}
    // we want to show the character on the front of a card and the pinyin and definition on the back of the card
    // TODO: create an interface for the expected incoming dataset format
    processChineseDataset(jsonData: any[]): Record<string, string>[] {
        return jsonData.map(obj => {
            return {
                front: obj.value,
                back: `<p>pinyin: ${obj.pinyin}</p> <p>definition: ${obj.definition}</p>`,
            };
        });
    }
    
    // example data: {"value": "暗記", "romaji": "anki (あんき)", "definition": "memorization"}
    processJapaneseDataset(jsonData: any[]): Record<string, string>[] {
         return jsonData.map(obj => {
            return {
                front: obj.value,
                back: `<p>romaji: ${obj.romaji}</p> <p>definition: ${obj.definition}</p>`,
            };
        });
    }
}