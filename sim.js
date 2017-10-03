var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../libs/core/enums.d.ts"/>
function logMsg(m) { console.log(m); }
var pxsim;
(function (pxsim) {
    var console;
    (function (console) {
        /**
         * Print out message
         */
        //% 
        function log(msg) {
            logMsg("CONSOLE: " + msg);
            // why doesn't that work?
            pxsim.board().writeSerial(msg + "\n");
        }
        console.log = log;
    })(console = pxsim.console || (pxsim.console = {}));
})(pxsim || (pxsim = {}));
//% color=#0078D7 weight=100
var pxsim;
(function (pxsim) {
    var control;
    (function (control) {
        /**
         * a label to jump to
         */
        //% blockId=processorLBL block="LBL %lbl"
        //% async  
        function label(lbl) {
            // note that we use PXT's async compilation feature to generate
            // a continuation in the generated JavaScript for the branch to 
            // target.  We need to get access to thie continuation, so that
            // the branch instruction can instruct the runtime to continue
            // execution at that point
            pxsim.board().setLabel(lbl);
        }
        control.label = label;
        /**
         * Compare contents of Rs and Rd
         */
        //% blockId=processorCMP 
        //% block="CMP d:%Rd |, s:%Rs"
        function cmp(Rd, Rs) {
            pxsim.board().compareRegisters(Rd, Rs);
        }
        control.cmp = cmp;
        /**
         * B = branch on condition
         */
        //% blockId=processorBEQ
        //% block="B%cond || %lbl"
        //% async  
        function beq(cond, lbl) {
            pxsim.board().conditionalBranch(cond, lbl);
        }
        control.beq = beq;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
//% color=#B4009E weight=99
var pxsim;
(function (pxsim) {
    var shift;
    (function (shift) {
        /**
         * Shift Rs left by 5-bit immediate value C and place result in Rd
         */
        //% blockId=processorLSL
        //% block="LSL d:%Rd |, s:%Rs |, C:%Offset5"
        //% Offset5.min=0 Offset5.max=31
        function lsl(Rd, Rs, Offset5) {
            pxsim.board().shiftRegister(Rd, Rs, "<<", Offset5);
        }
        shift.lsl = lsl;
        /**
         * Shift Rs right by 5-bit immediate value C and place result in Rd
         */
        //% blockId=processorLSR 
        //% block="LSR d:%Rd |, s:%Rs |, C:%Offset5"
        //% Offset5.min=0 Offset5.max=31
        function lsr(Rd, Rs, Offset5) {
            pxsim.board().shiftRegister(Rd, Rs, ">>", Offset5);
        }
        shift.lsr = lsr;
    })(shift = pxsim.shift || (pxsim.shift = {}));
})(pxsim || (pxsim = {}));
//% color=#5C2D91 weight=97
var pxsim;
(function (pxsim) {
    var logical;
    (function (logical) {
        /**
         * Logically negate of the contents of Rs and place result in Rd
         */
        //% blockId=processorNEG 
        //% block="NEG d:%Rd |, s:%Rs"
        function neg(Rd, Rs) {
            pxsim.board().logicRegister(Rd, "NEG", Rs);
        }
        logical.neg = neg;
        /**
         * Logical AND the contents of Rd with the contents of Rs and place result in Rd
         */
        //% blockId=processorAND
        //% block="AND d:%Rd |, s:%Rs"
        function and(Rd, Rs) {
            pxsim.board().logicRegister(Rd, "AND", Rs);
        }
        logical.and = and;
        /**
         * Logical OR the contents of Rd with the contents of Rs and place result in Rd
         */
        //% blockId=processorORR
        //% block="ORR d:%Rd |, s:%Rs"
        function orr(Rd, Rs) {
            pxsim.board().logicRegister(Rd, "ORR", Rs);
        }
        logical.orr = orr;
        /**
         * Logical EOR the contents of Rd with the contents of Rs and place result in Rd
         */
        //% blockId=processorEOR
        //% block="EOR d:%Rd |, s:%Rs"
        function eor(Rd, Rs) {
            pxsim.board().logicRegister(Rd, "EOR", Rs);
        }
        logical.eor = eor;
    })(logical = pxsim.logical || (pxsim.logical = {}));
})(pxsim || (pxsim = {}));
//% color=90 weight=30
var pxsim;
(function (pxsim) {
    var arithmetic;
    (function (arithmetic) {
        //% blockId=processorMOVSIMM
        //% block="MOV d:%Rd |, C:%Offset8"
        //% weight=90
        //% Offset8.min=0 Offset8.max=255
        function movsImm(Rd, Offset8) {
            pxsim.board().setRegister(Rd, Offset8);
        }
        arithmetic.movsImm = movsImm;
        /**
         * Add 8-bit immediate value C to contents of Rd and place result in Rd
         */
        //% blockId=processorADDIMM
        //% block="ADD d:%Rd |, C:%Offset8"
        //% weight=88 
        //% Offset8.min=0 Offset8.max=255
        function addImm(Rd, Offset8) {
            pxsim.board().addRegister(Rd, Offset8);
        }
        arithmetic.addImm = addImm;
        /**
         * Subtract 8-bit immediate value C from contents of Rd and place result in Rd
         */
        //% blockId=processorSUBIMM
        //% block="SUB d:%Rd |, C:%Offset8"
        //% weight=86
        //% Offset8.min=0 Offset8.max=255
        function subImm(Rd, Offset8) {
            pxsim.board().subRegister(Rd, Offset8);
        }
        arithmetic.subImm = subImm;
        /**
         * Add contents of Rs to contents of Rd and place result in Rd
         */
        //% blockId=processorADD
        //% block="ADD d:%Rd |, s:%Rs |, n:%Rn"
        //% weight=84
        function add(Rd, Rs, Rn) {
            pxsim.board().addRegisters(Rd, Rs, Rn);
        }
        arithmetic.add = add;
        /**
         * Subtract contents of Rs from contents of Rd and place result in Rd
         */
        //% blockId=processorSUB
        //% block="SUB d:%Rd |, s:%Rs |, n:%Rn"
        //% weight=82
        function sub(Rd, Rs, Rn) {
            pxsim.board().subRegisters(Rd, Rs, Rn);
        }
        arithmetic.sub = sub;
    })(arithmetic = pxsim.arithmetic || (pxsim.arithmetic = {}));
})(pxsim || (pxsim = {}));
/**
 * memory
 */
//% color=#008272 weight=32
var pxsim;
(function (pxsim) {
    var memory;
    (function (memory) {
        /**
         * Load into Rd the 32-bit value at the address specified by Rb
         */
        //% blockId=processorLDR 
        //% block="LDR d:%Rd |, |[ b:%Rb |]"
        function ldr(Rd, Rb) {
            pxsim.board().loadRegister(Rd, Rb);
        }
        memory.ldr = ldr;
        /**
         * Store the 32-bit value in Rd at the address specified by Rb
         */
        //% blockId=processorSTR
        //% block="STR d:%Rd |, |[ b:%Rb |]"
        function str(Rd, Rb) {
            pxsim.board().storeRegister(Rd, Rb);
        }
        memory.str = str;
    })(memory = pxsim.memory || (pxsim.memory = {}));
})(pxsim || (pxsim = {}));
/**
 * Input/output
 */
//% color=#008002 weight=34
var pxsim;
(function (pxsim) {
    var io;
    (function (io) {
        /**
         * Load into Rd the next 32-bit value in the input queue, if not empty.
         * If the input queue is empty, stop program execution.
         */
        //% blockId=processorIN
        //% block="IN d:%rd"
        function queueIn(Rd) {
        }
        io.queueIn = queueIn;
        /**
         * Store into the output queue the 32-bit value in Rd.
         */
        //% blockId=processorOUT
        //% block="OUT d:%rd"
        function queueOut(Rd) {
        }
        io.queueOut = queueOut;
    })(io = pxsim.io || (pxsim.io = {}));
})(pxsim || (pxsim = {}));
/// <reference path="../node_modules/pxt-core/typings/globals/bluebird/index.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
var pxsim;
(function (pxsim) {
    var myBoard;
    pxsim.initCurrentRuntime = function () {
        if (myBoard == null) {
            myBoard = new Board();
        }
        pxsim.runtime.board = myBoard;
        // override the run command 
        // pass 1 - sequential execution of every instruction to do analysis
        // pass 2 - the actual execution
        var oldRun = pxsim.runtime.run;
        pxsim.runtime.run = function (cb) {
            oldRun(cb);
            myBoard.phase = Phase.Execution;
            pxsim.runtime.setRunning(false);
            oldRun(cb);
        };
    };
    function board() {
        return pxsim.runtime.board;
    }
    pxsim.board = board;
    // invariants
    // - all numbers represented as unsigned 32-bit integers
    // - can we simplify by using asm.js tricks?
    var ProcessorState = (function () {
        function ProcessorState(memSize, regSize) {
            this.memory = [];
            this.registers = [];
            // setting condition codes based on sign bits, overflow, etc.
            // Application Processor Status Register (APSR):
            //
            // N: Negative
            // - The N flag is set by an instruction if the result is negative. 
            // - In practice, N is set to the two's complement sign bit of the result (bit 31).
            //
            // Z: Zero
            // - The Z flag is set if the result of the flag-setting instruction is zero.
            //
            // C: Carry (or Unsigned Overflow)
            // - The C flag is set if the result of an unsigned operation overflows the 
            // - 32-bit result register. This bit can be used to implement 64-bit unsigned arithmetic, for example.
            this.N = false;
            this.Z = false;
            this.C = false;
            this.memory.length = memSize;
            for (var i = 0; i < memSize; i++) {
                this.memory[i] = 0;
            }
            this.registers.length = regSize;
            for (var i = 0; i < regSize; i++) {
                this.registers[i] = 0;
            }
        }
        return ProcessorState;
    }());
    pxsim.ProcessorState = ProcessorState;
    var UPPER = Math.pow(2, 32);
    (function (Phase) {
        Phase[Phase["Analysis"] = 0] = "Analysis";
        Phase[Phase["Execution"] = 1] = "Execution";
    })(pxsim.Phase || (pxsim.Phase = {}));
    var Phase = pxsim.Phase;
    var Board = (function (_super) {
        __extends(Board, _super);
        function Board() {
            _super.call(this);
            this.phase = Phase.Analysis;
            this.memoryCells = [];
            this.registerCells = [];
            this.labels = [];
            this.branchLabels = [];
            this.asyncContinuations = [];
            this.registers = document.getElementById('registerstate');
            this.registers.innerHTML = "";
            this.initRegisters();
            this.memory = document.getElementById('memorystate');
            this.memory.innerHTML = "";
            this.initMemory();
            this.processor = new ProcessorState(64, 8);
        }
        Board.prototype.createTextBox = function () {
            var input = document.createElement("input");
            input.type = "text";
            input.className = "inputField";
            input.value = "00000000";
            input.size = 8;
            input.maxLength = 8;
            return input;
        };
        // 8 registers
        Board.prototype.initRegisters = function () {
            var _this = this;
            var header = this.registers.insertRow();
            //let resetRow = this.registers.insertRow()
            var title = header.insertCell();
            title.innerText = "Registers (Click to reset)";
            title.className = "register";
            title.colSpan = 8;
            var onClick = function () {
                for (var _i = 0, _a = _this.processor.registers; _i < _a.length; _i++) {
                    var i = _a[_i];
                    i = 0;
                }
                for (var _b = 0, _c = _this.registerCells; _b < _c.length; _b++) {
                    var i = _c[_b];
                    i.value = "00000000";
                }
            };
            title.onclick = onClick;
            var reg = 0;
            var _loop_1 = function(row) {
                var r = this_1.registers.insertRow(-1);
                var _loop_2 = function(col) {
                    var name_1 = r.insertCell();
                    var val = r.insertCell();
                    name_1.className = "register";
                    name_1.innerText = "R" + reg.toString();
                    var input = this_1.createTextBox();
                    val.appendChild(input);
                    var onBlur = function () {
                        var n = _this.ensureRange(parseInt(input.value), 256);
                        var res = _this.overflow(n);
                        _this.processor.registers[row * 4 + col] = res;
                        _this.registerCells[row * 4 + col].value = _this.convertIntTo32bitHex(res);
                    };
                    input.onblur = onBlur;
                    this_1.registerCells.push(input);
                    reg++;
                };
                for (var col = 0; col < 4; col++) {
                    _loop_2(col);
                }
            };
            var this_1 = this;
            for (var row = 0; row < 2; row++) {
                _loop_1(row);
            }
        };
        // 64 words (4 bytes) of memory
        Board.prototype.initMemory = function () {
            var _this = this;
            var header = this.memory.insertRow();
            var title = header.insertCell();
            title.innerText = "Memory (Click to reset)";
            title.colSpan = 8;
            title.className = "memory";
            var onClick = function () {
                for (var _i = 0, _a = _this.processor.memory; _i < _a.length; _i++) {
                    var i = _a[_i];
                    i = 0;
                }
                for (var _b = 0, _c = _this.memoryCells; _b < _c.length; _b++) {
                    var i = _c[_b];
                    i.value = "00000000";
                }
            };
            title.onclick = onClick;
            var _loop_3 = function(row) {
                var r = this_2.memory.insertRow();
                var _loop_4 = function(col) {
                    var name_2 = r.insertCell();
                    var val = r.insertCell();
                    name_2.className = "memory";
                    name_2.innerText = this_2.convertIntTo32bitHex((row * 16) + (col * 4), 2);
                    var input = this_2.createTextBox();
                    val.appendChild(input);
                    var onBlur = function () {
                        var n = _this.ensureRange(parseInt(input.value), 256);
                        var res = _this.overflow(n);
                        _this.processor.memory[row * 4 + col] = res;
                        _this.memoryCells[row * 4 + col].value = _this.convertIntTo32bitHex(res);
                    };
                    input.onblur = onBlur;
                    this_2.memoryCells.push(input);
                };
                for (var col = 0; col < 4; col++) {
                    _loop_4(col);
                }
            };
            var this_2 = this;
            for (var row = 0; row < 16; row++) {
                _loop_3(row);
            }
        };
        Board.prototype.initAsync = function (msg) {
            pxsim.console.log('setting simulator');
            document.body.innerHTML = ''; // clear children
            document.body.appendChild(this.registers);
            document.body.appendChild(this.memory);
            return Promise.resolve();
        };
        Board.prototype.updateView = function () {
        };
        Board.prototype.convertIntTo32bitHex = function (n, length) {
            if (length === void 0) { length = 8; }
            pxsim.U.assert(0 <= n && n < Math.pow(16, length), "0<=n && n < Math.pow(16,length)");
            var str = n.toString(16).toUpperCase();
            var zeros = length - str.length;
            var zeroStr = "";
            while (zeros--) {
                zeroStr += "0";
            }
            return zeroStr + str;
        };
        Board.prototype.ensureRange = function (n, top) {
            n = Math.floor(n);
            pxsim.U.assert(0 <= n && n < top, n.toString() + " is outside of range [ 0, " + (top - 1).toString() + "]");
            return n;
        };
        // handle overflow of 32-bit quantities
        // and compute condition codes
        Board.prototype.overflow = function (n, signed) {
            if (signed === void 0) { signed = false; }
            var res = n;
            this.processor.C = this.processor.N = false;
            if (n >= UPPER) {
                this.processor.C = true;
                res = n - UPPER;
            }
            if (signed) {
                this.processor.N = !!(res & 0x80000000);
            }
            this.processor.Z = (res === 0x00000000);
            return res;
        };
        Board.prototype.subRegister = function (Rd, Offset8) {
            if (this.phase == Phase.Execution) {
                var n = this.ensureRange(Offset8, 256);
                // convert to 2's complement
                n = UPPER - n;
                var res = this.overflow(this.processor.registers[Rd] + n, true);
                this.processor.registers[Rd] = res;
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.addRegister = function (Rd, Offset8) {
            if (this.phase == Phase.Execution) {
                var n = this.ensureRange(Offset8, 256);
                var res = this.overflow(this.processor.registers[Rd] + n);
                this.processor.registers[Rd] = res;
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.setMemory = function (Me, Offset5) {
            if (this.phase == Phase.Execution) {
                var n = this.ensureRange(Offset5, 256);
                this.processor.memory[Me] = n;
                this.memoryCells[Me].innerText = this.convertIntTo32bitHex(n);
            }
        };
        Board.prototype.addRegisters = function (Rd, Rs, Rn) {
            if (this.phase == Phase.Execution) {
                var res = this.overflow(this.processor.registers[Rs] + this.processor.registers[Rn]);
                this.processor.registers[Rd] = res;
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.subRegisters = function (Rd, Rs, Rn) {
            if (this.phase == Phase.Execution) {
                var neg = UPPER - this.processor.registers[Rn];
                var res = this.overflow(this.processor.registers[Rs] + neg, true);
                this.processor.registers[Rd] = res;
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.shiftRegister = function (Rd, Rs, op, Offset5) {
            if (this.phase == Phase.Execution) {
                var n = this.ensureRange(Offset5, 32);
                var res = op == "<<" ? (this.processor.registers[Rs] | 0x0) << n
                    : (this.processor.registers[Rs] | 0x0) >>> n;
                // TODO: need special logic for carry out on LSL
                if (res < 0) {
                    res = UPPER + res;
                }
                res = this.overflow(res);
                this.processor.registers[Rd] = res;
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.logicRegister = function (Rd, op, Rs) {
            if (this.phase == Phase.Execution) {
                var res = 0;
                switch (op) {
                    case "NEG":
                        res = ~this.processor.registers[Rs];
                        break;
                    case "AND":
                        res = this.processor.registers[Rd] & this.processor.registers[Rs];
                        break;
                    case "ORR":
                        res = this.processor.registers[Rd] | this.processor.registers[Rs];
                        break;
                    case "EOR":
                        res = this.processor.registers[Rd] ^ this.processor.registers[Rs];
                        break;
                }
                // logic ops can cause negative
                if (res < 0) {
                    res = UPPER + res;
                }
                res = this.overflow(res);
                this.processor.registers[Rd] = res;
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.setRegister = function (Rd, Offset8) {
            if (this.phase == Phase.Execution) {
                // validators will ensure, but let's enforce anyway
                var n = this.ensureRange(Offset8, 256);
                this.processor.registers[Rd] = this.overflow(n);
                this.registerCells[Rd].value = this.convertIntTo32bitHex(n);
            }
        };
        Board.prototype.checkAddr = function (addr) {
            pxsim.U.assert(0 <= addr && addr < 256, "address " + addr.toString() + " is out of range [0,252]");
            pxsim.U.assert(addr / 4 - Math.floor(addr / 4) == 0, "unaligned address (must be a multiple of 4)");
            return addr >> 2;
        };
        Board.prototype.loadRegister = function (Rd, Rb) {
            if (this.phase == Phase.Execution) {
                var addr = this.checkAddr(this.processor.registers[Rb]);
                var res = this.processor.registers[Rd] = this.overflow(this.processor.memory[addr]);
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.storeRegister = function (Rd, Rb) {
            if (this.phase == Phase.Execution) {
                var addr = this.checkAddr(this.processor.registers[Rb]);
                var res = this.processor.registers[Rd];
                this.processor.memory[addr] = this.overflow(res);
                this.memoryCells[addr].innerText = this.convertIntTo32bitHex(res);
            }
        };
        Board.prototype.compareRegisters = function (Rd, Rs) {
            if (this.phase == Phase.Execution) {
                var neg = UPPER - this.processor.registers[Rs];
                var res = this.overflow(this.processor.registers[Rd] + neg, true);
            }
        };
        Board.prototype.setLabel = function (lbl) {
            if (this.phase == Phase.Analysis) {
                pxsim.U.assert(this.labels.indexOf(lbl) == -1, "Label L" + (lbl + 1).toString() + " is included twice in program.");
                this.labels.push(lbl);
                this.asyncContinuations.push(lbl);
            }
            pxsim.runtime.overwriteResume(-1);
        };
        Board.prototype.branchToLabel = function (lbl) {
            // find the index of lbl
            var index = this.asyncContinuations.indexOf(lbl);
            // we check for label at runtime, not at compile time
            pxsim.U.assert(index != -1, "Label L" + (lbl + 1).toString() + " is referenced but not included in program.");
            // find the continuation from runtime
            var entry = pxsim.runtime.entry;
            var continuations = entry.continuations;
            pxsim.U.assert(continuations.length > index, "Internal error: branchToLabel");
            pxsim.runtime.overwriteResume(continuations[index]);
        };
        Board.prototype.conditionalBranch = function (cond, lbl) {
            if (this.phase == Phase.Analysis) {
                this.branchLabels.push(lbl);
                this.asyncContinuations.push(-1);
            }
            else {
                switch (cond) {
                    case 0 /* EQ */:
                        if (this.processor.Z) {
                            this.branchToLabel(lbl);
                            return;
                        }
                        break;
                    case 1 /* NE */:
                        if (!this.processor.Z) {
                            this.branchToLabel(lbl);
                            return;
                        }
                        break;
                    case 3 /* GT */:
                        if (!this.processor.N && !this.processor.Z) {
                            this.branchToLabel(lbl);
                            return;
                        }
                        break;
                    case 2 /* LT */:
                        if (this.processor.N) {
                            this.branchToLabel(lbl);
                            return;
                        }
                        break;
                    case 5 /* GE */:
                        if (!this.processor.N || this.processor.Z) {
                            this.branchToLabel(lbl);
                            return;
                        }
                        break;
                    case 4 /* LE */:
                        if (this.processor.Z || this.processor.N) {
                            this.branchToLabel(lbl);
                            return;
                        }
                        break;
                }
            }
            pxsim.runtime.overwriteResume(-1);
        };
        return Board;
    }(pxsim.BaseBoard));
    pxsim.Board = Board;
})(pxsim || (pxsim = {}));
