// https://github.com/gugray/hanzi_lookup
// https://github.com/gugray/hanzi_lookup/blob/master/web_demo/drawingBoard.js

export class DrawingCanvas {

  canvas: HTMLCanvasElement;
  worker: Worker; // web worker to communicate with
  clicking: boolean;
  lastTouchX: number;
  lastTouchY: number;
  timestamp: Date | undefined;
  strokeWidth: number;
  lastPoint: number[] | undefined;
  rawStrokes: number[][][]; // array of strokes, where a stroke is an array of coordinates, and each coordinate is an array containing an x and y value
  currStroke: number[][];

  constructor(worker: Worker){
    this.init();
    this.worker = worker;
    this.clicking = false;
    this.lastTouchX = -1;
    this.lastTouchY = -1;
    this.strokeWidth = 5;
    this.rawStrokes = [];
    this.currStroke = [];
  }
  
  init(){
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 256;
    canvasElement.height = 256;
    canvasElement.style.backgroundColor = '#fff';
    canvasElement.style.margin = '0 auto';
    canvasElement.style.border = '1px solid #000';
    
    canvasElement.addEventListener('pointermove', (e: PointerEvent) => {
      if(!this.clicking) return;
      const x = e.pageX - canvasElement.getBoundingClientRect().left;
      const y = e.pageY - canvasElement.getBoundingClientRect().top;
      this.dragClick(x, y);
    });
    
    canvasElement.addEventListener('pointerdown', (e: PointerEvent) => {
      const x = e.pageX - canvasElement.getBoundingClientRect().left;
      const y = e.pageY - canvasElement.getBoundingClientRect().top;
      this.startClick(x, y);
    });
    
    canvasElement.addEventListener('pointerup', (e: PointerEvent) => {
      const x = e.pageX - canvasElement.getBoundingClientRect().left;
      const y = e.pageY - canvasElement.getBoundingClientRect().top;
      this.endClick(x, y);
    });
    
    // handle drawing via on touch
    canvasElement.addEventListener('touchmove', (e: TouchEvent) => {
      if(!this.clicking) return;
      e.preventDefault();
      const x = e.touches[0].pageX - canvasElement.getBoundingClientRect().left;
      const y = e.touches[0].pageY - canvasElement.getBoundingClientRect().top;
      this.lastTouchX = x;
      this.lastTouchY = y;
      this.dragClick(x, y);
    });
    
    this.canvas = canvasElement;
    
    this.drawClearCanvas();
  }
  
  // clears canvas and draws gridlines
  drawClearCanvas(){
    const ctx = this.canvas.getContext('2d');
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.rawStrokes = [];
    this.currStroke = [];
    ctx.clearRect(0, 0, width, height);
    ctx.setLineDash([1, 1]);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }
  
  startClick(x: number, y: number){
    this.clicking = true;
    this.currStroke = [];
    this.lastPoint = [x, y];
    this.currStroke.push(this.lastPoint);
    
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.setLineDash([]);
    ctx.lineWidth = this.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    this.timestamp = new Date();
  }
  
  dragClick(x: number, y: number){
    if(this.timestamp && (new Date().getTime() - this.timestamp.getTime()) < 50){
      return;
    }
    this.timestamp = new Date();
    const point = [x, y];
    if(this.lastPoint && 
      (point[0] === this.lastPoint[0]) &&
      (point[1] === this.lastPoint[1])){
      return;
    }
    this.currStroke.push(point);
    this.lastPoint = point;
    
    const ctx = this.canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  
  endClick(x: number, y: number){
    this.clicking = false;
    if(x === -1) return;
    const ctx = this.canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    this.currStroke.push([x,y]);
    this.rawStrokes.push(this.currStroke);
    this.currStroke = [];
  }
  
  // get the hand-drawn input strokes and try to find a character match
  lookup(){
    this.worker.postMessage({strokes: this.rawStrokes, limit: 8});
  }

  getCanvas(){
    return this.canvas;
  }
}