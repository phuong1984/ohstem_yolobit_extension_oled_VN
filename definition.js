// ============================================================
// OLED Extension Blocks for ezFBfont and ezFBmarquee
// Supports Vietnamese text display on SSD1306 OLED
// ============================================================

// ============================================================
// Group 1: Static Text (ezFBfont)
// ============================================================

// --- Block: oled_static_init ---
// Initialize OLED I2C and create an ezFBfont instance
Blockly.Blocks['oled_static_init'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_static_init",
      "message0": Blockly.Msg.BLOCK_OLED_STATIC_INIT_MESSAGE0,
      "args0": [],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_STATIC_INIT_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_STATIC_INIT_HELPURL
    });
  }
};

Blockly.Python['oled_static_init'] = function(block) {
  Blockly.Python.definitions_['import_ssd1306'] = 'from ssd1306 import SSD1306_I2C';
  Blockly.Python.definitions_['import_ezFBfont'] = 'from ezFBfont import ezFBfont';
  Blockly.Python.definitions_['import_F8x13'] = 'import F8x13';

  var code = [
    'oled = SSD1306_I2C()',
    'static_text = ezFBfont(oled, F8x13)',
    ''
  ].join('\n');
  return code;
};

// --- Mutator block for a single text line ---
// Used inside the gear icon dialog only
Blockly.Blocks['oled_static_text_line'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_static_text_line",
      "message0": Blockly.Msg.BLOCK_OLED_STATIC_TEXT_ITEM,
      "args0": [],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "colourSecondary": "#27b0ba",
      "colourTertiary": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_STATIC_TEXT_LINE_TOOLTIP
    });
  }
};

// --- Mutator container block ---
// Used inside the gear icon dialog only
Blockly.Blocks['oled_static_text_container'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_CONTAINER);
    this.appendStatementInput('STACK');
    this.setColour('#27b0ba');
    this.setTooltip(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_LINE_TOOLTIP);
  }
};

// --- Block: oled_static_text ---
// Display Vietnamese text with mutator for multiple lines
Blockly.Blocks['oled_static_text'] = {
  init: function() {
    this.setColour("#27b0ba");
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_HELPURL);
    this.itemCount_ = 1;
    this.setMutator(new Blockly.Mutator(['oled_static_text_line']));
    this.updateShape_();
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },

  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10) || 1;
    this.updateShape_();
  },

  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('oled_static_text_container');
    containerBlock.initSvg();

    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var block = workspace.newBlock('oled_static_text_line');
      block.initSvg();
      block.setColour('#27b0ba');
      connection.connect(block.previousConnection);
      connection = block.nextConnection;
    }
    return containerBlock;
  },

  compose: function(containerBlock) {
    // Count items
    var block = containerBlock.getInput('STACK').connection.targetBlock();
    var newCount = 0;
    while (block) {
      newCount++;
      block = block.nextConnection && block.nextConnection.targetBlock();
    }

    // Disconnect all existing value input blocks before rebuilding
    for (var i = 0; i < this.itemCount_; i++) {
      var input = this.getInput('TEXT' + i);
      if (input && input.connection && input.connection.targetBlock()) {
        input.connection.targetBlock().unplug();
      }
    }

    this.itemCount_ = newCount;
    this.updateShape_();
  },

  updateShape_: function() {
    // Remove all existing row inputs
    while (this.inputList.length > 0) {
      this.removeInput(this.inputList[0].name);
    }

    // Rebuild with new count — each row: text value input with inline X/Y fields
    for (var i = 0; i < this.itemCount_; i++) {
      // Create a value input for the text (allows attaching variable/text blocks)
      var textInput = this.appendValueInput('TEXT' + i)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_SHOW);

        // Attach X and Y fields to the same input so they appear after the text socket
        textInput.appendField(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_AT_X)
             .appendField(new Blockly.FieldNumber(0, 0, null, 1), 'X' + i)
             .appendField(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_Y)
             .appendField(new Blockly.FieldNumber(0, 0, null, 1), 'Y' + i);
    }
  }
};

Blockly.Python['oled_static_text'] = function(block) {
  Blockly.Python.definitions_['import_ssd1306'] = Blockly.Python.definitions_['import_ssd1306'] || 'from ssd1306 import SSD1306_I2C';
  Blockly.Python.definitions_['import_ezFBfont'] = Blockly.Python.definitions_['import_ezFBfont'] || 'from ezFBfont import ezFBfont';
  Blockly.Python.definitions_['import_F8x13'] = Blockly.Python.definitions_['import_F8x13'] || 'import F8x13';

  var code = '';
  for (var i = 0; i < block.itemCount_; i++) {
    var text = Blockly.Python.valueToCode(block, 'TEXT' + i, Blockly.Python.ORDER_ATOMIC);
    if (!text || text === '') {
      text = Blockly.Python.quote_(Blockly.Msg.BLOCK_OLED_STATIC_TEXT_DEFAULT);
    }
    var x = block.getFieldValue('X' + i) || 0;
    var y = block.getFieldValue('Y' + i) || 0;
    code += 'static_text.write(str(' + text + '), ' + x + ', ' + y + ')\n';
  }
  code += 'oled.show()\n';
  return code;
};


// ============================================================
// Group 2: Dynamic Text (ezFBmarquee)
// ============================================================

// --- Block: oled_marquee_init ---
// Initialize OLED I2C and create an ezFBmarquee instance
Blockly.Blocks['oled_marquee_init'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_marquee_init",
      "message0": Blockly.Msg.BLOCK_OLED_MARQUEE_INIT_MESSAGE0,
      "args0": [],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_MARQUEE_INIT_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_MARQUEE_INIT_HELPURL
    });
  }
};

Blockly.Python['oled_marquee_init'] = function(block) {
  Blockly.Python.definitions_['import_ssd1306'] = 'from ssd1306 import SSD1306_I2C';
  Blockly.Python.definitions_['import_ezFBmarquee'] = 'from ezFBmarquee import ezFBmarquee';
  Blockly.Python.definitions_['import_F8x13'] = 'import F8x13';

  var code = [
    'oled = SSD1306_I2C()',
    'dynamic_text = ezFBmarquee(oled, F8x13)',
    ''
  ].join('\n');
  return code;
};

// --- Block: oled_marquee_start ---
// Start scrolling text (scroller mode only)
Blockly.Blocks['oled_marquee_start'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_marquee_start",
      "message0": Blockly.Msg.BLOCK_OLED_MARQUEE_START_MESSAGE0,
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "text": "Xin chào"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_MARQUEE_START_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_MARQUEE_START_HELPURL
    });

    // Attach a shadow block with default value "Xin chào"
    var shadowXml = Blockly.utils.xml.createElement('shadow');
    shadowXml.setAttribute('type', 'text');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TEXT');
    field.appendChild(Blockly.utils.xml.createTextNode('Xin chào'));
    shadowXml.appendChild(field);
    this.getInput('TEXT').connection.setShadowDom(shadowXml);
  }
};

Blockly.Python['oled_marquee_start'] = function(block) {
  var text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_ATOMIC);
  var code = 'dynamic_text.start(str(' + text + '), mode="scroller")\n';
  return code;
};

// --- Block: oled_marquee_step ---
// Advance marquee by a number of steps (1-5)
Blockly.Blocks['oled_marquee_step'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_marquee_step",
      "message0": Blockly.Msg.BLOCK_OLED_MARQUEE_STEP_MESSAGE0,
      "args0": [
        {
          "type": "input_value",
          "name": "STEPS",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "inputsInline": true,
      "tooltip": Blockly.Msg.BLOCK_OLED_MARQUEE_STEP_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_MARQUEE_STEP_HELPURL
    });

    // Attach a shadow block with default value 1 so users can edit directly
    var shadowXml = Blockly.utils.xml.createElement('shadow');
    shadowXml.setAttribute('type', 'math_number');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'NUM');
    field.appendChild(Blockly.utils.xml.createTextNode('1'));
    shadowXml.appendChild(field);
    this.getInput('STEPS').connection.setShadowDom(shadowXml);
  }
};

Blockly.Python['oled_marquee_step'] = function(block) {
  var steps = Blockly.Python.valueToCode(block, 'STEPS', Blockly.Python.ORDER_ATOMIC) || '1';
  var code = 'dynamic_text.step(' + steps + ')\noled.show()\n';
  return code;
};

// --- Block: oled_marquee_pause ---
// Pause marquee for N steps
Blockly.Blocks['oled_marquee_pause'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_marquee_pause",
      "message0": Blockly.Msg.BLOCK_OLED_MARQUEE_PAUSE_MESSAGE0,
      "args0": [
        {
          "type": "input_value",
          "name": "COUNT",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_MARQUEE_PAUSE_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_MARQUEE_PAUSE_HELPURL
    });

    // Attach a shadow block with default value 100 so users can edit directly
    var shadowXml = Blockly.utils.xml.createElement('shadow');
    shadowXml.setAttribute('type', 'math_number');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'NUM');
    field.appendChild(Blockly.utils.xml.createTextNode('100'));
    shadowXml.appendChild(field);
    this.getInput('COUNT').connection.setShadowDom(shadowXml);
  }
};

Blockly.Python['oled_marquee_pause'] = function(block) {
  var count = Blockly.Python.valueToCode(block, 'COUNT', Blockly.Python.ORDER_ATOMIC);
  var code = 'dynamic_text.pause(' + count + ')\n';
  return code;
};

// --- Block: oled_marquee_stop ---
// Stop marquee
Blockly.Blocks['oled_marquee_stop'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_marquee_stop",
      "message0": Blockly.Msg.BLOCK_OLED_MARQUEE_STOP_MESSAGE0,
      "args0": [],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_MARQUEE_STOP_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_MARQUEE_STOP_HELPURL
    });
  }
};

Blockly.Python['oled_marquee_stop'] = function(block) {
  var code = 'dynamic_text.stop()\n';
  return code;
};

// --- Block: oled_marquee_active ---
// Check if marquee is running (boolean expression)
Blockly.Blocks['oled_marquee_active'] = {
  init: function() {
    this.jsonInit({
      "type": "oled_marquee_active",
      "message0": Blockly.Msg.BLOCK_OLED_MARQUEE_ACTIVE_MESSAGE0,
      "args0": [],
      "output": "Boolean",
      "colour": "#27b0ba",
      "tooltip": Blockly.Msg.BLOCK_OLED_MARQUEE_ACTIVE_TOOLTIP,
      "helpUrl": Blockly.Msg.BLOCK_OLED_MARQUEE_ACTIVE_HELPURL
    });
  }
};

Blockly.Python['oled_marquee_active'] = function(block) {
  var code = 'dynamic_text.active()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};
