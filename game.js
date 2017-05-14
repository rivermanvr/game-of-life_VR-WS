var gameOfLife = {

  width: (document.getElementById('settings_columns').value) * 1,
  height: (document.getElementById('settings_rows').value) * 1, // width and height dimensions of the board
  stepInterval: 100, // should be used to hold reference to an interval that is "playing" the game

  createAndShowBoard: function () {
    var board = document.getElementById('board');
    board.appendChild(this.buildTable());
    this.setupBoardEvents();
  },

  setupBoardEvents: function() {
    this.processTable(function(cell) {
      cell.addEventListener('click', gameOfLife.cellStatus)
    });
  },

  cellStatus: function(ev, organism = 'blue') {
    if (this.dataset.status === 'dead') gameOfLife.cellAlive(this, organism);
    else gameOfLife.cellDead(this);
  },

  cellAlive: function(cell, organism) {
      cell.className = `alive ${organism}`;
      cell.dataset.status = `alive`;
  },

  cellDead: function(cell) {
    cell.className = 'dead';
    cell.dataset.status = 'dead';
  },

  buildTable: function() {
    let goltable = document.createElement('tbody');
    // build Table HTML
    var tablehtml = '';
    for (var ht = 0; ht < this.height; ht++) {
      tablehtml += "<tr id='row+" + ht + "'>";
      for (var wd = 0; wd < this.width; wd++) {
        tablehtml += "<td data-status='dead' id='" + ht + '-' + wd + "'></td>";
      }
      tablehtml += '</tr>';
    }
    goltable.innerHTML = tablehtml;
    return goltable;
  },

  processTable: function(fn){
    console.log('in process table............')
    for (var ht = 0; ht < this.height; ht++) {
      for (var wd = 0; wd < this.width; wd++) {
        let cell = document.getElementById(`${ht}-${wd}`);
        fn(cell, ht, wd);
      }
    }
  },

  step: function () {
    console.log('in step function');
    let tickState = this.processTable(gameOfLife.processRules);
  },

  enableAutoPlay: function (play) {
    console.log('clicked Auto-Play/Pause.........')
    let auto;
    if (play) auto = setInterval(this.step(), this.stepInterval);
    else clearInterval(auto);
  },

  processRules: function(cell, row, column) {
    console.log('in processRules.......');
    console.log(cell, row, column);
    /* rules/actions for each cell:

          1. create 3 empty objects --> redOrganism, bluOrganism, tickState.
          2. go to every cell in the g-o-l table.
              is it dead?, yes...if key does not exist, make value 0.
              is it alive?, (red or blue?), then
              ...Add a count to keys as follows:
                key = cellId: 'X-Y'
                first, calculations must follow this:
                    0 <= X < height
                    0 <= Y < width
                second, do calculations and add 1 to each derived count:
                    - if red, add to redOrganism, blue then to blueOrganism
                    - cells: (x-1)(y-1), (x-1)(y), (x-1)(y+1),
                             (x+1)(y-1), (x+1)(y), (x+1)(y+1),
                             (x)(y-1), (x)(y+1),
          3. Check both red & blue tables, resul to goes to tickState:
              count (red + blue) > 3 cell dies.
              count (red <2 && blue < 2) cell dies
              count ( 2<= red <=3 && blue <2) red alive.
              count ( 2<= blue <=3 && red <2) blue alive.
              else whichever color greater is alive.
          4. update g-o-l table.
    */
    //create objects:
    let redOrganism = {}, blueOrganism = {}, tickState = {};
    return tickState;
  },

  reset: function() {
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    let board = document.getElementById('board');
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }
    this.createAndShowBoard();
    this.createRandom();
  },

  createRandom: function() {
    console.log('creating random board............')
  },

  clear: function() {
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    let board = document.getElementById('board');
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }
    let clearElem = document.getElementById('clear_btn');
    this.createAndShowBoard();
  },

  advanced: function(status){
    console.log('advanced play.........');
    if (status === 'default') {
      let advSettings = document.getElementById('control_panel_input');
      advSettings.className = '';
      let advBtn = document.getElementById('control_panel_settings_default');
      advBtn.className = 'hidden disabled';
      let advChg = document.getElementById('control_panel_settings_chg');
      advChg.className = '';
    } else {
      let advSettings = document.getElementById('control_panel_input');
      advSettings.className = 'hidden disabled';
      let advBtn = document.getElementById('control_panel_settings_default');
      advBtn.className = '';
      let advChg = document.getElementById('control_panel_settings_chg');
      advChg.className = 'hidden disabled';
    }
  }
};

gameOfLife.createAndShowBoard();
