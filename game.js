const gameOfLife = {
  resetState: function() {
    this.stateObj = {blueColor: {}, redColor: {}, gameCount: 0,
      rows: (document.getElementById('settings_rows').value) * 1,
      columns: (document.getElementById('settings_columns').value) * 1,
      colorId: 1,
      stepInterval: (document.getElementById('settings_interval').value) * 1,
      intervalId: null
    }
  },

  processTable: function(fn){
    for (let row = 0; row < this.stateObj.rows; row++) {
      for (let column = 0; column < this.stateObj.columns; column++) {
        fn.bind(this)(document.getElementById(`${row}-${column}`), row, column);
      }
    }
  },

  buildTable: function() {
    console.log('game setup');
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

  createAndShowBoard: function () {
    this.resetState();
    let board = document.getElementById('board');
    board.appendChild(this.buildTable());
    this.setupBoardEvents();
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

  createRandom: function() {
    this.newGame();
    this.processTable(function(cell){
      this.setStatus(cell, Math.round(Math.random()) ? 'dead' : 'alive', Math.round(Math.random()) ? 'blue' : 'red');
    });
    this.resetState();
  },

  newGame: function() {
    console.log('...newGame');
    let gameOver = document.getElementById('game_over');
    gameOver.className = 'hidden disabled';
    this.processTable(function(cell){
      if ( cell.getAttribute('data-status') === 'alive') this.setStatus(cell, 'dead', 'dead');
    });
    this.resetState();
  },

  cellStatus: function() {
    let color = (gameOfLife.stateObj.colorId === 1) ? 'blue' : 'red';
    if (this.dataset.status === 'dead') gameOfLife.setStatus(this, 'alive', color);
    else gameOfLife.setStatus(this, 'dead', 'dead');
  },

  setStatus: function(cell, status, color) {
    if (color === 1) color = 'blue';
    if (color === 2) color = 'red';
    cell.setAttribute('data-status', status);
    cell.className = (status === 'dead') ? 'dead' : color;
  },

  step: function () {
    this.processTable(this.countNeighbors);
    this.processTable(this.processNewState);
    if (!this.stateObj.gameCount) {
      let game = document.getElementById('game_over');
      game.className = '';
      this.pause();
    }
    this.resetState();
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
    let NewStateObj = {
      countRed: this.stateObj.redColor[cell.id] || 0,
      countBlue: this.stateObj.blueColor[cell.id] || 0,
      redAlive: cell.dataset.status !== 'dead' && cell.className === 'red',
      blueAlive: cell.dataset.status !== 'dead' && cell.className === 'blue',
      stable: true,
      countTotal: 0
    };
    NewStateObj.countTotal = NewStateObj.countRed + NewStateObj.countBlue;

    if (cell.dataset.status === 'alive') {
      this.aliveNewState(cell, NewStateObj);
    } else {
      this.deadNewState(cell, NewStateObj);
    }
  },

  aliveNewState: function(cell, NewStateObj) {
    if (NewStateObj.countTotal > 3 || (NewStateObj.countRed < 2 && NewStateObj.countBlue < 2)) {
      this.stateObj.gameCount++;
      this.setStatus(cell, 'dead', 'dead');
    } else if ( (NewStateObj.redAlive && !NewStateObj.blueAlive) || NewStateObj.countRed > NewStateObj.countBlue) {
      if (!NewStateObj.redAlive) this.stateObj.gameCount++;
      this.setStatus(cell, 'alive', 'red');
    } else if ((!NewStateObj.redAlive && NewStateObj.blueAlive) || NewStateObj.countRed < NewStateObj.countBlue) {
      if (!NewStateObj.blueAlive) this.stateObj.gameCount++;
      this.setStatus(cell, 'alive', 'blue');
    }
  },

  deadNewState: function(cell, NewStateObj) {
    if (NewStateObj.countRed === 3 && NewStateObj.countBlue === 0) {
      this.stateObj.gameCount++;
      this.setStatus(cell, 'alive', 'red');
    } else if (NewStateObj.countBlue === 3 && NewStateObj.countRed === 0) {
      this.stateObj.gameCount++;
      this.setStatus(cell, 'alive', 'blue');
    } else {
      this.setStatus(cell, 'dead', 'dead');
    }
  },

  enableAutoPlay: function () {
    console.log('..AutoPlay');
    this.stateObj.intervalId = window.setInterval(this.step.bind(this), this.stateObj.stepInterval);
  },

  pause: function() {
    console.log('..pause AutoPlay');
    window.clearInterval(this.stateObj.intervalId);
    this.resetState();
  },

  advancedDef: function(){
      let advSettings = document.getElementById('control_panel_input');
      advSettings.className = '';
      let advBtn = document.getElementById('control_panel_settings_default');
      advBtn.className = 'hidden disabled';
      let advChg = document.getElementById('control_panel_settings_chg');
      advChg.className = '';
  },

  //Advanced settings listeners:

  selectColor: function() {
    this.stateObj.colorId = document.getElementById('selectColor').value * 1;
    console.log('changed color', this.stateObj.colorId);
  },

  advSettings: function() {
    let advSettings = document.getElementById('control_panel_input');
    advSettings.className = 'hidden disabled';
    let advBtn = document.getElementById('control_panel_settings_default');
    advBtn.className = '';
    let advChg = document.getElementById('control_panel_settings_chg');
    advChg.className = 'hidden disabled';
  }
};

gameOfLife.createAndShowBoard();
