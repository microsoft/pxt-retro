/// <reference path="../node_modules/pxt-core/typings/globals/bluebird/index.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>

// TODO:
// - Thumb condition codes 
// - bound checking in simulator (memory accesses and branches)
// - 
// - compiler check plug-in (check for labels)
//   - create array of lbls, for mapping to continuation
//   - no duplicate labels
//   - missing labels
// For later
// - no transition to Monaco (Sam - we will use thumb as experiment for embedding)
// - Blockly validator for value ranges (Sam)
// - generate Thumb ASM and binary encoding of instructions (via our assembler???)

namespace pxsim {

    initCurrentRuntime = () => {
        let myBoard = new Board()
        runtime.board = myBoard
        // override the run command 
        // pass 1 - sequential execution of every instruction to do analysis
        // pass 2 - the actual execution
        
        let oldRun = runtime.run
        runtime.run = (cb: ResumeFn) => { 
            oldRun(cb)
            myBoard.checkBranchLabels()
            myBoard.phase = Phase.Execution
            runtime.setRunning(false)
            oldRun(cb)
        }
    };

    export function board() : Board {
        return runtime.board as Board;
    }

    // invariants
    // - all numbers represented as unsigned 32-bit integers
    // - can we simplify by using asm.js tricks?
    export class ProcessorState {
        memory : number[] = [];
        registers : number[] = [];
        conditionCode : number = 0;
        constructor(memSize: number, regSize: number) {
            this.memory.length = memSize;
            for(let i=0;i<memSize;i++) { this.memory[i] = 0 }
            this.registers.length = regSize;
            for(let i=0;i<regSize;i++) { this.registers[i] = 0 }
        }
    }

    const UPPER = Math.pow(2,32)
     
    export enum Phase { Analysis, Execution }
    export class Board extends pxsim.BaseBoard {
        phase = Phase.Analysis; 
        memory : HTMLTableElement;
        memoryCells : HTMLTableCellElement[];
        
        registers : HTMLTableElement;
        registerCells : HTMLTableCellElement[];
        
        processor : ProcessorState;
        labels: Label[] = []
        branchLabels: Label[] = []
        asyncContinuations : number[] = []
        
        constructor() {
            super();
        
            this.memory = <HTMLTableElement>document.getElementById('memorystate');
            this.memory.innerHTML = ""
            this.memoryCells = [];
            this.initMemory();

            this.registers = <HTMLTableElement>document.getElementById('registerstate');
            this.registers.innerHTML = ""
            this.registerCells = [];
            this.initRegisters();

            this.processor = new ProcessorState(256,8)
        }

        checkBranchLabels() {
            for(let lbl of this.branchLabels) {
                if (this.labels.indexOf(lbl) == -1) {
                    // TODO: raise an error
                }
            }
        }

        // 8 registers
        private initRegisters() {
            let reg = 0;
            for(let row = 0; row < 2; row++) {
                let r = this.registers.insertRow(-1)
                for(let col = 0; col < 4; col++) {
                    let name = r.insertCell(-1)
                    let val = r.insertCell(-1)
                    name.innerText = "R" + reg.toString()
                    val.innerText = "00000000"
                    this.registerCells.push(val)
                    reg++
                }
            }
        }

        // 256 words of memory
        private initMemory() {
            let header = this.memory.insertRow(-1)
            for(let h = 0; h<16; h++) {
                let c = header.insertCell(-1)
                c.innerText = h.toString()
            }
            for(let row = 0; row<16; row++) {
                let r = this.memory.insertRow(-1)
                this.memory.appendChild(r)
                for(let col = 0; col<16; col++) {
                    let c = r.insertCell(-1)
                    r.appendChild(c)
                    this.memoryCells.push(c)
                    c.innerText = "00"
                    c.setAttribute("memory","00000000")
                }
            }
        }
        
        initAsync(msg: pxsim.SimulatorRunMessage): Promise<void> {
            console.log('setting simulator')
            
            document.body.innerHTML = ''; // clear children
            document.body.appendChild(this.registers);
            document.body.appendChild(this.memory);

            return Promise.resolve();
        }       
        
        updateView() {

        }

        private convertIntTo32bitHex(n: number, length = 8) {
            U.assert(0<=n && n < UPPER)
            let str = n.toString(16).toUpperCase()
            let zeros = length - str.length
            let zeroStr = ""
            while(zeros--) { zeroStr += "0" }
            return zeroStr + str;
        }

        private convertIntToHexRgb(n: number) {
            // TODO: for memory
        }

        private ensureRange(n: number, top: number) {
            n = Math.floor(n)
            if (0<=n && n<top)
                return n
            return undefined
        }

        // TODO: setting condition codes based on sign bits, overflow, etc.

        private overflow(n: number) {
            if (n >= UPPER) {
                return n - (UPPER-1)
            }
            return n
        }

        subRegister(Rd:Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset8, 256)
                if (n) {
                    // convert to 2's complement
                    n = UPPER - n
                    let res = this.overflow(this.processor.registers[Rd] + n)
                    this.processor.registers[Rd] = res
                    this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
                }
            }
        }

        addRegister(Rd:Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset8, 256)
                if (n) {
                    let res = this.overflow(this.processor.registers[Rd] + n)
                    this.processor.registers[Rd] = res
                    this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
                }
            }
        }

        addRegisters(Rd:Register, Rs:Register, Rn:Register) {
            if (this.phase == Phase.Execution) {
                let res = this.overflow(this.processor.registers[Rs] + this.processor.registers[Rn])
                this.processor.registers[Rd] = res
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        subRegisters(Rd:Register, Rs:Register, Rn:Register) {
            if (this.phase == Phase.Execution) {
                let neg = UPPER - this.processor.registers[Rn]
                let res = this.overflow(this.processor.registers[Rs] + neg)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        shiftRegister(Rd:Register, Rs:Register, op:string, Offset5: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset5, 32)
                let res = op == "<<" ? this.processor.registers[Rs] << n : this.processor.registers[Rs] >>> n
                // shifting can result in negative value
                if (res < 0) res = UPPER + res
                this.processor.registers[Rd] = res
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        logicRegister(Rd:Register, op: string, Rs:Register) {
            if (this.phase == Phase.Execution) {
                let res: number = 0
                switch (op) {
                    case "NEG": res = ~this.processor.registers[Rs]; break
                    case "AND": res = this.processor.registers[Rd] & this.processor.registers[Rs]; break
                    case "ORR": res = this.processor.registers[Rd] | this.processor.registers[Rs]; break
                    case "EOR": res = this.processor.registers[Rd] ^ this.processor.registers[Rs]; break
                }
                if (res < 0) res = UPPER + res
                this.processor.registers[Rd] = res
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        setRegister(Rd: Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                // validators will ensure, but let's enforce anyway
                let n = this.ensureRange(Offset8, 256)
                if (n) {
                    this.processor.registers[Rd] = n
                    this.registerCells[Rd].innerText = this.convertIntTo32bitHex(n)
                }
            }
        }

        loadRegister(Rd: Register, Rb: Register) {
            if (this.phase == Phase.Execution) {
                let addr = this.ensureRange(this.processor.registers[Rb], 256)
                let res = this.processor.registers[Rd] = this.processor.memory[addr]
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        storeRegister(Rd: Register, Rb: Register) {
            if (this.phase == Phase.Execution) {
                let addr = this.ensureRange(this.processor.registers[Rb], 256)
                this.processor.memory[addr] = this.processor.registers[Rd]
                // TODO: encoding for memory
            }
        }

        compareRegisters(Rd: Register, Rs: Register) {
            if (this.phase == Phase.Execution) {
                this.processor.conditionCode = this.processor.registers[Rd] - this.processor.registers[Rs]   
            }
        }

        setLabel(lbl: Label) {
            if (this.phase == Phase.Analysis) {
                if (this.labels.indexOf(lbl) != -1 ) {
                    // TODO: raise error - duplicate label
                } else {
                    this.labels.push(lbl)
                    this.asyncContinuations.push(lbl)
                }
            } 
            let cb = getResume()
            cb(() => {})
        }

        private branchToLabel(lbl: Label) {
            // find the index of lbl
            let index = this.asyncContinuations.indexOf(lbl)
            U.assert(index != -1, "simulator: failed to find label")
            // find the continuation from runtime
            let entry =  <any>runtime.entry
            let continuations: number[] = <number[]>entry.continuations
            U.assert(continuations.length>index)
            runtime.overwriteResume(continuations[index])
            let cb = getResume()
            cb(() => {})
        }

        conditionalBranch(cond: Condition, lbl: Label) {
            if (this.phase == Phase.Analysis) {
                this.branchLabels.push(lbl)
                this.asyncContinuations.push(-1)
            } else {
                switch(cond) {
                    case Condition.EQ:
                        if (this.processor.conditionCode == 0) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.NE: 
                        if (this.processor.conditionCode != 0) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.GT:
                        if (this.processor.conditionCode > 0) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.LT:
                        if (this.processor.conditionCode < 0) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.GE:
                        if (this.processor.conditionCode >= 0) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.LE:
                        if (this.processor.conditionCode <= 0) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                }
            }
            let cb = getResume()
            cb(() => {})
        }
    }
}
