/// <reference path="../node_modules/pxt-core/typings/globals/bluebird/index.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>

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
        memoryCells : HTMLTableCellElement[] = [];
        
        registers : HTMLTableElement;
        registerCells : HTMLTableCellElement[] = [];
        
        processor : ProcessorState;
        labels: Label[] = []
        branchLabels: Label[] = []
        asyncContinuations : number[] = []
        
        constructor() {
            super();

            this.registers = <HTMLTableElement>document.getElementById('registerstate');
            this.registers.innerHTML = ""
            this.initRegisters();

            this.memory = <HTMLTableElement>document.getElementById('memorystate');
            this.memory.innerHTML = ""
            this.initMemory();

            this.processor = new ProcessorState(64,8)
        }

        // 8 registers
        private initRegisters() {
            let header = this.registers.insertRow()
            let title = header.insertCell()
            title.innerText = "Registers"
            title.colSpan = 8
            title.className = "register"
            let reg = 0;
            for(let row = 0; row < 2; row++) {
                let r = this.registers.insertRow(-1)
                for(let col = 0; col < 4; col++) {
                    let name = r.insertCell()
                    let val = r.insertCell()
                    name.className = "register"
                    name.innerText = "R" + reg.toString()
                    val.innerText = "00000000"
                    this.registerCells.push(val)
                    reg++
                }
            }
        }

        // 64 words (4 bytes) of memory
        private initMemory() {
            let header = this.memory.insertRow()
            let title = header.insertCell()
            title.innerText = "Memory"
            title.colSpan = 8
            title.className = "memory"
            for(let row = 0; row<16; row++) {
                let r = this.memory.insertRow()
                for(let col = 0; col<4; col++) {
                    let name = r.insertCell()
                    name.className = "memory"
                    name.innerText = this.convertIntTo32bitHex((row*16)+(col*4),2)
                    let val = r.insertCell()
                    this.memoryCells.push(val)
                    val.innerText = "00000000"
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
            U.assert(0<=n && n < Math.pow(16,length))
            let str = n.toString(16).toUpperCase()
            let zeros = length - str.length
            let zeroStr = ""
            while(zeros--) { zeroStr += "0" }
            return zeroStr + str;
        }

        private ensureRange(n: number, top: number) {
            n = Math.floor(n)
            U.assert(0<=n && n<top, n.toString() + " is outside of range [ 0, " + top.toString() + "]")
            return n
        }

        // TODO: setting condition codes based on sign bits, overflow, etc.

        private overflow(n: number) {
            if (n >= UPPER) {
                return n - UPPER
            }
            return n
        }

        subRegister(Rd:Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset8, 256)
                // convert to 2's complement
                n = UPPER - n
                let res = this.overflow(this.processor.registers[Rd] + n)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        addRegister(Rd:Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset8, 256)
                let res = this.overflow(this.processor.registers[Rd] + n)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
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
                this.processor.registers[Rd] = n
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(n)
            }
        }

        private checkAddr(addr: number): number {
            U.assert(0 <= addr && addr < 256, "address " + addr.toString() + " is out of range [0,255]")
            U.assert(addr/4 - Math.floor(addr/4) == 0, "unaligned address (must be a multiple of 4)");
            return addr >> 2
        }

        loadRegister(Rd: Register, Rb: Register) {
            if (this.phase == Phase.Execution) {
                let addr = this.checkAddr(this.processor.registers[Rb])
                let res = this.processor.registers[Rd] = this.processor.memory[addr]
                this.registerCells[Rd].innerText = this.convertIntTo32bitHex(res)
            }
        }

        storeRegister(Rd: Register, Rb: Register) {
            if (this.phase == Phase.Execution) {
                let addr = this.checkAddr(this.processor.registers[Rb])
                let res = this.processor.registers[Rd]
                this.processor.memory[addr]
                this.memoryCells[addr].innerText = this.convertIntTo32bitHex(res)
            }
        }

        compareRegisters(Rd: Register, Rs: Register) {
            if (this.phase == Phase.Execution) {
                this.processor.conditionCode = this.processor.registers[Rd] - this.processor.registers[Rs]   
            }
        }

        setLabel(lbl: Label) {
            if (this.phase == Phase.Analysis) {
                U.assert(this.labels.indexOf(lbl) == -1, "Label L" + (lbl+1).toString() + " is included twice in program.")  
                this.labels.push(lbl)
                this.asyncContinuations.push(lbl)
            } 
            runtime.overwriteResume(-1)
        }

        private branchToLabel(lbl: Label) {
            // find the index of lbl
            let index = this.asyncContinuations.indexOf(lbl)
            // we check for label at runtime, not at compile time
            U.assert(index!= -1, "Label L" + (lbl+1).toString() + " is referenced but not included in program.")
            // find the continuation from runtime
            let entry =  <any>runtime.entry
            let continuations: number[] = <number[]>entry.continuations
            U.assert(continuations.length>index, "Internal error: branchToLabel")
            runtime.overwriteResume(continuations[index])
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
            runtime.overwriteResume(-1)
        }
    }
}
