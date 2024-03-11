// https://github.com/gugray/hanzi_lookup

export class DrawingCanvas {

  canvas: HTMLCanvasElement;

  constructor(){
    this.init();
  }
  
  init(){
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 512;
    canvasElement.height = 512;
    canvasElement.style.backgroundColor = '#fff';
    canvasElement.style.margin = '0 auto';
    canvasElement.style.border = '1px solid #000';
    
    // https://github.com/gugray/hanzi_lookup/blob/master/web_demo/drawingBoard.js
    // TODO: set up canvas to keep track of strokes
    
    this.canvas = canvasElement;
  }

  getCanvas(){
    return this.canvas;
  }
}