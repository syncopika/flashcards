export class Mapper {
    // use this class to create methods for
    // converting arbitrary json data to an array of {'front': '', 'back': ''} objects,
    // which is what Card.svelte expects
    // if there's a new json dataset, a new mapper method should be made to be able to process it
    
    // we expect chinese character datasets
    // to be arranged like an array of {"value": "匂", "pinyin": "xiong1", "definition": "fragrance, smell;", "tags": []}
    // we want to show the character on the front of a card and the pinyin and definition on the back of the card
    // TODO: create an interface for the expected incoming dataset format
    // TODO: maybe pass back the fields and values to display and let whoever is receiving this data handle the html presentation
    generateTagsHtml(tagList: string[]){
      const tags = tagList.map(currVal => `<span class='tag'>${currVal}</span>`);
      return tags.join(",");
    }
    
    processChineseDataset(jsonData: any[]): Record<string, string>[] {
      return jsonData.map(obj => {
        return {
          front: `<p>${obj.value}</p>`,
          back: `<p><span class='field'>pinyin:</span> ${obj.pinyin}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`,
          value: obj.value,
          pinyin: obj.pinyin,
          tags: obj.tags ? this.generateTagsHtml(obj.tags) : "", //obj.tags.reduce((acc, currVal) => acc + `<span class='tag'>${currVal}</span>`, "") : "",
        };
      });
    }
    
    // example data: {"value": "暗記", "romaji": "anki (あんき)", "definition": "memorization"}
    processJapaneseDataset(jsonData: any[]): Record<string, string>[] {
       return jsonData.map(obj => {
         return {
           front: `<p>${obj.value}</p>`,
           back: `<p><span class='field'>romaji:</span> ${obj.romaji}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`,
           tags: obj.tags ? this.generateTagsHtml(obj.tags) : "",
         };
      });
    }
    
    // example data: {"character": "ㄅ", "pinyin": "b"}
    processBopomofoDataset(jsonData: any[]): Record<string, string>[] {
       return jsonData.map(obj => {
         return {
           front: `<p>${obj.character}</p>`,
           back: `<p><span class='field'>pinyin:</span> ${obj.pinyin}</p>`,
         };
      });
    }
}