//"use strict";
var canvasGlobal = new CanvasState(document.getElementById('myCanvas'));
var table = document.getElementById('coordinateTable');
var tbody = table.getElementsByTagName('tbody')[0];
canvasGlobal.addHandle(new Handle(100, 200, 0));
canvasGlobal.addHandle(new Handle(160, 130, 1));
canvasGlobal.addHandle(new Handle(240, 230, 2));
canvasGlobal.addHandle(new Handle(300, 200, 3));
canvasGlobal.draw();

document.body.addEventListener('input', function() {
  var stupidJordanRegexVariable = event.target.id.match(/(\d+)/)[0];
  if(event.target.id.match(/x/)) {
    canvasGlobal.handles[stupidJordanRegexVariable - 1].draw(canvasGlobal.ctx, document.getElementById('handlex'+stupidJordanRegexVariable).value);
  } else if(event.target.id.match(/y/)) {
    canvasGlobal.handles[stupidJordanRegexVariable - 1].draw(canvasGlobal.ctx, undefined, document.getElementById('handley'+stupidJordanRegexVariable).value);
  }
  canvasGlobal.draw();
});

function CanvasState(canvas) {
  var stupidJordanObject = {
    addHandle: function(handle) {
      this.handles.push(handle);
    },
    clear: function() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    },
    draw: function() {
      const SQUARES = 1000;
      var ctx = this.ctx;
      
      var handles = this.handles;
      var squares = this.squares;
      this.clear();
      
      // ** Add stuff you want drawn in the background all the time here **
      var l = handles.length;
      var lq = SQUARES;
      var m;
      var coefficients = [];
      ctx.fillStyle = "#800080";
      
      for(var k = 0; k < l; k++) {
        if(k === 0 || k === l - 1)
          coefficients.push(1);
        else
          coefficients.push(coefficients[k - 1] * (l - k) / k);
      }
      for(var t = 0; t < lq; t++) {
        var xNew = 0;
        var yNew = 0;
        if(t === 0) {
          ctx.fillRect(handles[0].x, handles[0].y, 1, 1);
        }
        else if(t == lq - 1) {
          ctx.fillRect(handles[l - 1].x, handles[l - 1], 1, 1);
        }
        else{
          for(var j = 0; j < l; j++) {
            m = coefficients[j] * Math.pow(t / lq, j) * Math.pow(1 - t / lq, l - 1 - j);
            xNew += handles[j].x * m;
            yNew += handles[j].y * m;
          }
          ctx.fillRect(xNew, yNew, 1, 1);
        }
      }
      
      for (var i = 0; i < l; i++) {
        handles[i].draw(ctx);
      }
    },
    getMouse: function(e) {
      var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
      
      // Compute the total offset
      if (element.offsetParent !== undefined) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
      }
    
      // Add padding and border style widths to offset
      // Also add the offsets in case there's a position:fixed bar
      offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
      offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;
    
      mx = e.pageX - offsetX;
      my = e.pageY - offsetY;
      
      // We return a simple javascript object (a hash) with x and y defined
      return {x: mx, y: my};
    },
    init: function() {
      this.canvas = canvas;
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = canvas.getContext('2d');
      // This complicates things a little but but fixes mouse co-ordinate problems
      // when there's a border or padding. See getMouse for more detail
      var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
      if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingLeft, 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingTop, 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null).borderLeftWidth, 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null).borderTopWidth, 10)   || 0;
      }
      // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
      // They will mess up mouse coordinates and this fixes that
      var html = document.body.parentNode;
      this.htmlTop = html.offsetTop;
      this.htmlLeft = html.offsetLeft;
      
      this.handles = [];
      this.squares = [];
      this.dragging = false;
      this.selection = null;
      this.dragoffx = 0;
      this.dragoffy = 0;
      
      var myState = this;
      
      //fixes a problem where double clicking causes text to get selected on the canvas
      canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
      // Up, down, and move are for dragging
      canvas.addEventListener('mousedown', function(e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var handles = myState.handles;
        var l = handles.length;
        for (var i = l-1; i >= 0; i--) {
          if (handles[i].contains(mx, my)) {
            var mySel = handles[i];
            mySel.orange = true;
            // Keep track of where in the object we clicked
            // so we can move it smoothly (see mousemove)
            myState.dragoffx = mx - mySel.x;
            myState.dragoffy = my - mySel.y;
            myState.dragging = true;
            myState.selection = mySel;
            return;
          }
        }
      }, true);
      canvas.addEventListener('mousemove', function(e) {
        if (myState.dragging){
          var mouse = myState.getMouse(e);
          // We don't want to drag the object by its top-left corner,
          // we want to drag from where we clicked.
          // Thats why we saved the offset and use it here
          myState.selection.x = mouse.x - myState.dragoffx;
          myState.selection.y = mouse.y - myState.dragoffy;
          myState.draw();
        }
      }, true);
      canvas.addEventListener('mouseup', function(e) {
        myState.dragging = false;
        if(myState.selection !== null) {
          myState.selection.orange = false;
          myState.draw();
        }
        myState.selection = null;
      }, true);
      canvas.addEventListener('dblclick', function(e) {
        document.getElementById("deleteButton1").style.visibility = "visible";
        var clone = tbody.rows[0].cloneNode(true);
        var new_row = updateRow(clone.cloneNode(true), ++tbody.rows.length, true);
        tbody.appendChild(new_row);
        
        var mouse = myState.getMouse(e);
        myState.addHandle(new Handle(mouse.x, mouse.y, myState.handles.length));
        myState.draw();
      }, true);
    }
  };
  
  stupidJordanObject.init();
  
  return stupidJordanObject;
}

function deleteRow(rowToDelete) {
  var i = rowToDelete.parentNode.parentNode.rowIndex;
  table.deleteRow(i);
  canvasGlobal.handles.splice(i - 1, 1);
  for(var j = 0; j < canvasGlobal.handles.length; j++) {
    canvasGlobal.handles[j].handleNumber = j;
  }
  canvasGlobal.draw();
  for(i; i < table.rows.length; i++) {
      updateRow(table.rows[i], i, false);
  }
  if(canvasGlobal.handles.length === 1)
    document.getElementById("deleteButton1").style.visibility = "hidden";
}

function Handle(xR, yR, handleNumberR) {
  
  return {
    handleNumber: handleNumberR,
    x: xR || 0,
    y: yR || 0,
    r: 4,
    w: 3,
    orange: false,
    draw: function(ctx, xNew, yNew) {
      if(xNew !== undefined) {
        if(xNew > canvasGlobal.width)
          this.x = canvasGlobal.width;
        else if(xNew < 0)
          this.x = 0;
        else
          this.x = xNew;
      }
      if(yNew !== undefined)
        if(yNew > canvasGlobal.height)
          this.y = canvasGlobal.height;
        else if(yNew < 0)
          this.y = 0;
        else
          this.y = yNew;
      ctx.beginPath();
      ctx.lineWidth = this.w;
      if(this.orange)
        ctx.strokeStyle = "#FF8000";
      else
        ctx.strokeStyle = "#000000";
      ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
      ctx.stroke();
      
      tbody.rows[this.handleNumber].cells[1].getElementsByTagName('input')[0].value = this.x;
      tbody.rows[this.handleNumber].cells[2].getElementsByTagName('input')[0].value = this.y;
    },
    contains: function(mx, my) {
      var overlap = false;
      if(Math.sqrt(Math.pow(mx - this.x, 2) + Math.pow(my - this.y, 2)) < this.r + this.w)
        overlap = true;
      return overlap;
    }
  };
}

function updateRow(row, i, blank) {
    row.cells[0].innerHTML = 'Handle ' + i;
    var input1 = row.cells[1].getElementsByTagName('input')[0];
    var input2 = row.cells[2].getElementsByTagName('input')[0];
    var input3 = row.cells[3].getElementsByTagName('input')[0];
    input1.id = 'handlex' + i;
    input2.id = 'handley' + i;
    input3.id = 'deleteButton' + i;
    if (blank)
        input1.value = input2.value = '';
    
    return row;
}