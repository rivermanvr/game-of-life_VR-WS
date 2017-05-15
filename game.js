var gameOfLife = {

  width: (document.getElementById('settings_columns').value) * 1,
  height: (document.getElementById('settings_rows').value) * 1,
  stepInterval: (document.getElementById('settings_interval').value) * 1,
  intervalId: null,

  createAndShowBoard: function () {
    console.log('.....entering create & show board........');
    let board = document.getElementById('board');
    board.appendChild(this.buildTable());
    this.setupBoardEvents();
    console.log('.....leaving create & show board........');
  },

  setupBoardEvents: function() {
    console.log('.......entering setup board events......');
    this.processTable(function(cell) {
      cell.addEventListener('click', gameOfLife.cellStatus)
    });
    document.getElementById('step_btn').onclick = this.step.bind(this);
    document.getElementById('autoplay_btn').onclick = this.enableAutoPlay.bind(this);
    document.getElementById('pause_btn').onclick = this.pause.bind(this);
    document.getElementById('random_btn').onclick = this.createRandom.bind(this);
    document.getElementById('new_game_btn').onclick = this.newGame.bind(this);
    document.getElementById('advanced_default_btn').onclick = this.advancedDef.bind(this);
    document.getElementById('advanced_settings_btn').onclick = this.advancedSav.bind(this);
    console.log('.......leaving board events......');
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

  processTable: function(fn, stateObj){
    console.log('.......in processTable...........')
    if (stateObj) stateObj.gameCount = 0;
    for (var ht = 0; ht < this.height; ht++) {
      for (var wd = 0; wd < this.width; wd++) {
        let cell = document.getElementById(`${ht}-${wd}`);
        fn(cell, ht, wd, stateObj);
      }
    }
    console.log('.......leaving processTable...........')
  },

  processRules: function(cell, row, column, stateObj) {
    console.log('in processRules...........')
    /* rules/actions for each cell:
          is it alive?, (red or blue?), then
          ...Add a count to keys as follows:
            key = cellId: 'X-Y', 0 <= X < height, 0 <= Y < width
            do calculations and add 1 to each derived count:
              - if red, add to redOrganism, blue then to blueOrganism
              - cells: (x-1)(y-1), (x-1)(y), (x-1)(y+1),
                       (x+1)(y-1), (x+1)(y), (x+1)(y+1),
                       (x)(y-1),   (x)(y+1)
    */
    if (cell.dataset.status !== 'dead') {
      let orgColor = (cell.className === 'alive blue') ? 'blueOrganism' : 'redOrganism';
      for (let rr = -1; rr < 2; rr++) {
        let buddyRow = row + rr;
        if (buddyRow >= 0 && buddyRow < gameOfLife.height) {
          for (let cc = -1; cc < 2; cc++) {
            let buddyCol = column + cc;
            let buddyId = `${buddyRow}-${buddyCol}`;
            if (buddyCol >= 0 && buddyCol < gameOfLife.width && buddyId !== cell.id) {
              stateObj[orgColor][buddyId] = (stateObj[orgColor][buddyId ] + 1) || 1;
            }
          }
        }
      }
    }
  },

  processNewState: function(cell, row, column, stateObj) {
    console.log('in processNewState.......');
    /* move board to the :
            Check both red & blue tables, result goes to tickState:
              count (red + blue) > 3 cell dies.
              count (red <2 && blue < 2) cell dies
              count ( 2<= red <=3 && blue <2) red alive.
              count ( 2<= blue <=3 && red <2) blue alive.
              else whichever color greater is alive.
    */
    let countRed = stateObj.redOrganism[cell.id] || 0;
    let countBlue = stateObj.blueOrganism[cell.id] || 0;
    if (cell.dataset.status !== 'dead') {
      let redAlive = countRed >= 2 && countRed <= 3;
      let blueAlive = countBlue >= 2 && countBlue <= 3;
      let countTotal = countRed + countBlue;
      if (countTotal > 3 || (countRed < 2 && countBlue < 2)) {
        this.gameOfLife.cellDead(cell);
      } else if ( (redAlive && !blueAlive) || countRed > countBlue) {
        stateObj.gameCount++;
        this.gameOfLife.cellAlive(cell, 'red');
      } else if ( (!redAlive && blueAlive) || countRed < countBlue) {
        stateObj.gameCount++;
        this.gameOfLife.cellAlive(cell, 'blue');
      }
    } else {
      if (countRed === 3 && countBlue === 0) {
        stateObj.gameCount++;
        this.gameOfLife.cellAlive(cell, 'red');
      } else if (countBlue === 3 && countRed === 0) {
        stateObj.gameCount++;
        this.gameOfLife.cellAlive(cell, 'blue');
      }
    }
  },

  step: function () {
    console.log('in step function.........');
    let stateObj = {blueOrganism: {}, redOrganism: {}, gameCount: 0};
    this.processTable(gameOfLife.processRules, stateObj);
    this.processTable(gameOfLife.processNewState, stateObj);
    console.log('redOrganism: ', stateObj.redOrganism);
    console.log('blueOrganism: ', stateObj.blueOrganism);
    console.log('gameCount: ', stateObj.gameCount);
    if (!stateObj.gameCount) {
      let game = document.getElementById('game_over');
      game.className = '';
      this.enableAutoPlay();
    }
  },

  enableAutoPlay: function () {
    console.log('clicked Auto-Play.........')
    this.intervalId = setInterval('gameOfLife.step()', this.stepInterval);
  },

  pause: function() {
    console.log('in pause.........')
    clearInterval(this.intervalId);
    this.intervalId = null;
  },

  newGame: function() {
    console.log('...entering new game..........');
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    let board = document.getElementById('board');
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }
    gameOfLife.intervalId = null;
    this.createAndShowBoard();
    console.log('...leaving new game..........');
  },

  createRandom: function() {
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    let board = document.getElementById('board');
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }
    this.createAndShowBoard();
    this.randomStart();
  },

  randomStart: function() {
    console.log('creating random board............')
  },

  advancedSav: function(){
    console.log('advanced play..Sav.......');
    let advSettings = document.getElementById('control_panel_input');
    advSettings.className = 'hidden disabled';
    let advBtn = document.getElementById('control_panel_settings_default');
    advBtn.className = '';
    let advChg = document.getElementById('control_panel_settings_chg');
    advChg.className = 'hidden disabled';
  },

  advancedDef: function(){
    console.log('advanced play...Default......');
      let advSettings = document.getElementById('control_panel_input');
      advSettings.className = '';
      let advBtn = document.getElementById('control_panel_settings_default');
      advBtn.className = 'hidden disabled';
      let advChg = document.getElementById('control_panel_settings_chg');
      advChg.className = '';
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
  }
};

gameOfLife.newGame();
