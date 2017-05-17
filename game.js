const gameOfLife = {
  resetState: function() {
    console.log('........reset state.......');
    this.stateObj = {blueColor: {}, redColor: {}, gameCount: 0,
      rows: (document.getElementById('settings_rows').value) * 1,
      columns: (document.getElementById('settings_columns').value) * 1,
      stepInterval: (document.getElementById('settings_interval').value) * 1,
      intervalId: null
    }
    this.stateObj.ColorId = document.getElementById('selectColor').value;
  },

  buildTable: function() {
    let goltable = document.createElement('tbody');
    // build Table HTML
    let tablehtml = '';
    for (let row = 0; row < this.stateObj.rows; row++) {
      tablehtml += "<tr id='row+" + row + "'>";
      for (let column = 0; column < this.stateObj.columns; column++) {
        tablehtml += "<td data-status='dead' id='" + row + '-' + column + "'></td>";
      }
      tablehtml += '</tr>';
    }
    goltable.innerHTML = tablehtml;
    return goltable;
  },

  newGame: function() {
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    let clearBoard = document.getElementById('board');
    while (clearBoard.lastChild) {
      clearBoard.removeChild(clearBoard.lastChild);
    }
    this.resetState();
    this.createAndShowBoard();
    this.setupBoardEvents();
  },

  createAndShowBoard: function () {
    let board = document.getElementById('board');
    if (board.childNodes.length) board.removeChild();
    board.appendChild(this.buildTable());
  },

  setupBoardEvents: function() {
    this.processTable(function(cell) {
      cell.addEventListener('click', this.cellStatus)
    });
    // -------------------------------------------------
    //document.getElementById('step_btn').onclick = this.step.bind(this);
    document.getElementById('step_btn').addEventListener('click', this.step.bind(this));
    // -------------------------------------------------
    document.getElementById('autoplay_btn').onclick = this.enableAutoPlay.bind(this);
    document.getElementById('pause_btn').onclick = this.pause.bind(this);
    document.getElementById('random_btn').onclick = this.createRandom.bind(this);
    document.getElementById('new_game_btn').onclick = this.newGame.bind(this);              //tested <--
    document.getElementById('advanced_default_btn').onclick = this.advancedDef.bind(this);
    document.getElementById('selectColor').onchange = this.selectColor.bind(this);
    document.getElementById('advanced_settings_btn').onclick = this.advSettings.bind(this);
  },

  processTable: function(fn){
    for (let row = 0; row < this.stateObj.rows; row++) {
      for (let column = 0; column < this.stateObj.columns; column++) {
        fn.bind(this)(document.getElementById(`${row}-${column}`), row, column);
      }
    }
  },

  cellStatus: function() {
    if (this.dataset.status === 'dead') gameOfLife.setStatus(this, 'alive', organism = 'blue');
    else gameOfLife.setStatus(this, 'dead', 'dead');
  },

  setStatus: function(cell, status, color) {
    console.log('..set cell status..')
    if (color === 1) color = 'blue';
    if (color === 2) color = 'red';
    cell.setAttribute('data-status', status);
    cell.className = color;
    console.log(cell);
  },

  step: function () {
    this.processTable(this.countNeighbors);
    console.log('redColor: ', this.stateObj.redColor);
    console.log('blueColor: ', this.stateObj.blueColor);
    this.processTable(this.processNewState);
    if (!this.stateObj.gameCount) {
      let game = document.getElementById('game_over');
      game.className = '';
      this.pause();
    }
    this.resetState();
    console.log('.leaving step function.........');
  },

  countNeighbors: function(cell, row, column) {
    if (cell.dataset.status !== 'dead') {
      let orgColor = (cell.className === 'blue') ? 'blueColor' : 'redColor';
      for (let rowAdjust = -1; rowAdjust < 2; rowAdjust++) {
        let buddyRow = row + rowAdjust;
        if (buddyRow >= 0 && buddyRow < this.stateObj.rows) {
          for (let colAdjust = -1; colAdjust < 2; colAdjust++) {
            let buddyCol = column + colAdjust;
            let buddyId = `${buddyRow}-${buddyCol}`;
            if (buddyCol >= 0 && buddyCol < this.stateObj.columns && buddyId !== cell.id) {
              this.stateObj[orgColor][buddyId] = (this.stateObj[orgColor][buddyId ] + 1) || 1;
            }
          }
        }
      }
    }
  },

  processNewState: function(cell) {
    console.log('.....entering processNewState.......');
    let NewStateObj = {
      countRed: this.stateObj.redColor[cell.id] || 0,
      countBlue: this.stateObj.blueColor[cell.id] || 0,
      redAlive: cell.dataset.status !== 'dead' && cell.className === 'red',
      blueAlive: cell.dataset.status !== 'dead' && cell.className === 'blue',
      stable: true,
      countTotal: 0
    };
    NewStateObj.countTotal = NewStateObj.countRed + NewStateObj.countBlue;
    console.log('---setup variables---');
    console.log('countRed', NewStateObj.countRed);
    console.log('countBlue', NewStateObj.countBlue);
    console.log('countTotal', NewStateObj.countTotal);
    console.log('---------------------');
    console.log('redAlive', NewStateObj.redAlive);
    console.log('blueAlive', NewStateObj.blueAlive);
    console.log('---------------------');

    if (cell.dataset.status === 'alive') {
      this.aliveNewState(cell, NewStateObj);
    } else {
      this.deadNewState(cell, NewStateObj);
    }
    console.log('-------back from--------------');
    console.log('cell coming out: ', cell);
    console.log('count coming out: ', this.stateObj.gameCount);
    console.log('.....leaving processNewState.......');
    console.log('---------------------');
    console.log('\n');
  },

  aliveNewState: function(cell, NewStateObj) {
    console.log('.....entering aliveNewState.......');
    if (NewStateObj.countTotal > 3 || (NewStateObj.countRed < 2 && NewStateObj.countBlue < 2)) {
      console.log('------either---------------');
      console.log('------countTotal >3 or both red&blue count <2-------');
      this.stateObj.gameCount++;
      this.setStatus(cell, 'dead', 'dead');
    } else if ( (NewStateObj.redAlive && !NewStateObj.blueAlive) || NewStateObj.countRed > NewStateObj.countBlue) {
      console.log('------either---------------');
      console.log('------red is alive or red count > blue count-------');
      this.stateObj.gameCount++;
      this.cellAlive(cell, 'red');
    } else if ((!NewStateObj.redAlive && NewStateObj.blueAlive) || NewStateObj.countRed < NewStateObj.countBlue) {
      console.log('------either---------------');
      console.log('------blue is alive or blue count > red count-------');
      if (!NewStateObj.blueAlive) this.stateObj.gameCount++;
      this.setStatus(cell, 'alive', 'blue');
    }
  },

  deadNewState: function(cell, NewStateObj) {
    console.log('.....entering deadNewState.......');
    if (NewStateObj.countRed === 3 && NewStateObj.countBlue === 0) {
      console.log('------red count = 3, blue count= 0-------');
      this.stateObj.gameCount++;
      this.cellAlive(cell, 'red');
    } else if (NewStateObj.countBlue === 3 && NewStateObj.countRed === 0) {
      console.log('------blue count = 3, red count= 0-------');
      this.stateObj.gameCount++;
      this.setStatus(cell, 'alive', 'blue');
    } else {
      this.setStatus(cell, 'dead', 'dead');
    }
  },

  enableAutoPlay: function () {
    console.log('.entering ...clicked Auto-Play.........')
    console.log(this)
    this.intervalId = setInterval(this.step(), this.stepInterval);
    console.log('.leaving ...clicked Auto-Play.........')
  },

  pause: function() {
    console.log('...entering pause.........')
    clearInterval(this.intervalId);
    this.resetState();
    console.log('...leavinging pause.........')
  },

  createRandom: function() {
    console.log('...entering create random................');
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    let board = document.getElementById('board');
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }
    this.createAndShowBoard();
    this.randomStart();
    console.log('...leavinging create random................');
  },

  randomStart: function() {
    console.log('....entering random start............')
    console.log('....leavinging random start............')
  },

  advancedDef: function(){
    console.log('....entering advanced play...Default......');
      let advSettings = document.getElementById('control_panel_input');
      advSettings.className = '';
      let advBtn = document.getElementById('control_panel_settings_default');
      advBtn.className = 'hidden disabled';
      let advChg = document.getElementById('control_panel_settings_chg');
      advChg.className = '';
    console.log('....leavinging advanced play...Default......');
  },

  //Advanced settings listeners:

  selectColor: function() {
    this.stateObj.ColorId = document.getElementById('selectColor').value;
  },

  advSettings: function() {
    console.log('you hit the accept advanced settings button');
    let advSettings = document.getElementById('control_panel_input');
    advSettings.className = 'hidden disabled';
    let advBtn = document.getElementById('control_panel_settings_default');
    advBtn.className = '';
    let advChg = document.getElementById('control_panel_settings_chg');
    advChg.className = 'hidden disabled';

    console.log('did you change the color?');
    console.log(this.stateObj.entryColorId);

    console.log('...leavinging advanced play..Sav.......');
  }
};

gameOfLife.newGame();
