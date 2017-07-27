/// <reference path="../node_modules/pxt-core/typings/globals/bluebird/index.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>

namespace pxsim {
    let myBoard: Board
    initCurrentRuntime = () => {
        if(myBoard == null){
            myBoard = new Board()
        }
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

    export function board(): Board {
        return runtime.board as Board;
    }

    // invariants
    // - all numbers represented as unsigned 32-bit integers
    // - can we simplify by using asm.js tricks?
    export class ProcessorState {
        memory: number[] = [];
        registers: number[] = [];

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

        N: boolean = false;
        Z: boolean = false;
        C: boolean = false;

        constructor(memSize: number, regSize: number) {
            this.memory.length = memSize;
            for (let i = 0; i < memSize; i++) { this.memory[i] = 0 }
            this.registers.length = regSize;
            for (let i = 0; i < regSize; i++) { this.registers[i] = 0 }
        }
    }

    const UPPER = Math.pow(2, 32)

    export enum Phase { Analysis, Execution }
    export class Board extends pxsim.BaseBoard {
        phase = Phase.Analysis;
        memory: HTMLTableElement;
        memoryCells: HTMLInputElement[] = [];

        registers: HTMLTableElement;
        registerCells: HTMLInputElement[] = [];

        processor: ProcessorState;
        labels: Label[] = []
        branchLabels: Label[] = []
        asyncContinuations: number[] = []

        constructor() {
            super();

            this.registers = <HTMLTableElement>document.getElementById('registerstate');
            this.registers.innerHTML = ""
            this.initRegisters();

            this.memory = <HTMLTableElement>document.getElementById('memorystate');
            this.memory.innerHTML = ""
            this.initMemory();

            this.processor = new ProcessorState(64, 8)
        }
        private createTextBox() {
            let input = <HTMLInputElement>document.createElement("input")
            input.type = "text"
            input.className = "inputField"
            input.value = "00000000"
            input.size = 8
            input.maxLength = 8
            return input
        }
        // 8 registers
        private initRegisters() {
            let header = this.registers.insertRow()
            //let resetRow = this.registers.insertRow()
            let title = header.insertCell()   
            title.innerText = "Registers (Click to reset)"
            title.className = "register"   
            title.colSpan = 8
            let onClick = () => {
                for(let i of this.processor.registers){
                    i = 0;
                }
                for(let i of this.registerCells){
                    i.value = "00000000";
                }
            }
            title.onclick = onClick
            let reg = 0;
            for (let row = 0; row < 2; row++) {
                let r = this.registers.insertRow(-1)
                for (let col = 0; col < 4; col++) {
                    let name = r.insertCell()
                    let val = r.insertCell()
                    name.className = "register"
                    name.innerText = "R" + reg.toString()
                    let input = this.createTextBox()
                    val.appendChild(input)
                    let onBlur = () => {
                        let n = this.ensureRange(parseInt(input.value), 256)
                        let res = this.overflow(n)
                        this.processor.registers[row * 4 + col] = res
                        this.registerCells[row * 4 + col].value = this.convertIntTo32bitHex(res)
                    }
                    input.onblur = onBlur
                    this.registerCells.push(input)
                    reg++
                }
            }
        }
        // 64 words (4 bytes) of memory
        private initMemory() {
            let header = this.memory.insertRow()
            let title = header.insertCell()
            title.innerText = "Memory (Click to reset)"
            title.colSpan = 8
            title.className = "memory"
            let onClick = () => {
                for(let i of this.processor.memory){
                    i = 0;
                }
                for(let i of this.memoryCells){
                    i.value = "00000000";
                }
            }
            title.onclick = onClick
            for (let row = 0; row < 16; row++) {
                let r = this.memory.insertRow()
                for (let col = 0; col < 4; col++) {
                    let name = r.insertCell()
                    let val = r.insertCell()
                    name.className = "memory"
                    name.innerText = this.convertIntTo32bitHex((row * 16) + (col * 4), 2)
                    let input = this.createTextBox()
                    val.appendChild(input)
                    let onBlur = () => {
                        let n = this.ensureRange(parseInt(input.value), 256)
                        let res = this.overflow(n)
                        this.processor.memory[row * 4 + col] = res
                        this.memoryCells[row * 4 + col].value = this.convertIntTo32bitHex(res)
                    }
                    input.onblur = onBlur
                    this.memoryCells.push(input)
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
            U.assert(0 <= n && n < Math.pow(16, length), "0<=n && n < Math.pow(16,length)")
            let str = n.toString(16).toUpperCase()
            let zeros = length - str.length
            let zeroStr = ""
            while (zeros--) { zeroStr += "0" }
            return zeroStr + str;
        }

        private ensureRange(n: number, top: number) {
            n = Math.floor(n)
            U.assert(0 <= n && n < top, n.toString() + " is outside of range [ 0, " + (top - 1).toString() + "]")
            return n
        }

        // handle overflow of 32-bit quantities
        // and compute condition codes
        private overflow(n: number, signed = false) {
            let res = n;
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
        }

        subRegister(Rd: Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset8, 256)
                // convert to 2's complement
                n = UPPER - n
                let res = this.overflow(this.processor.registers[Rd] + n, true)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        addRegister(Rd: Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset8, 256)
                let res = this.overflow(this.processor.registers[Rd] + n)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        setMemory(Me: Memory, Offset5: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset5, 256)
                this.processor.memory[Me] = n
                this.memoryCells[Me].innerText = this.convertIntTo32bitHex(n)
            }
        }

        addRegisters(Rd: Register, Rs: Register, Rn: Register) {
            if (this.phase == Phase.Execution) {
                let res = this.overflow(this.processor.registers[Rs] + this.processor.registers[Rn])
                this.processor.registers[Rd] = res
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        subRegisters(Rd: Register, Rs: Register, Rn: Register) {
            if (this.phase == Phase.Execution) {
                let neg = UPPER - this.processor.registers[Rn]
                let res = this.overflow(this.processor.registers[Rs] + neg, true)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        shiftRegister(Rd: Register, Rs: Register, op: string, Offset5: number) {
            if (this.phase == Phase.Execution) {
                let n = this.ensureRange(Offset5, 32)
                let res = op == "<<" ? (this.processor.registers[Rs] | 0x0) << n
                    : (this.processor.registers[Rs] | 0x0) >>> n
                // TODO: need special logic for carry out on LSL
                if (res < 0) {
                    res = UPPER + res;
                }
                res = this.overflow(res)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        logicRegister(Rd: Register, op: string, Rs: Register) {
            if (this.phase == Phase.Execution) {
                let res: number = 0
                switch (op) {
                    case "NEG": res = ~this.processor.registers[Rs]; break
                    case "AND": res = this.processor.registers[Rd] & this.processor.registers[Rs]; break
                    case "ORR": res = this.processor.registers[Rd] | this.processor.registers[Rs]; break
                    case "EOR": res = this.processor.registers[Rd] ^ this.processor.registers[Rs]; break
                }
                // logic ops can cause negative
                if (res < 0) {
                    res = UPPER + res;
                }
                res = this.overflow(res)
                this.processor.registers[Rd] = res
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        setRegister(Rd: Register, Offset8: number) {
            if (this.phase == Phase.Execution) {
                // validators will ensure, but let's enforce anyway
                let n = this.ensureRange(Offset8, 256)
                this.processor.registers[Rd] = this.overflow(n)
                this.registerCells[Rd].value = this.convertIntTo32bitHex(n)
            }
        }

        private checkAddr(addr: number): number {
            U.assert(0 <= addr && addr < 256, "address " + addr.toString() + " is out of range [0,252]")
            U.assert(addr / 4 - Math.floor(addr / 4) == 0, "unaligned address (must be a multiple of 4)");
            return addr >> 2
        }

        loadRegister(Rd: Register, Rb: Register) {
            if (this.phase == Phase.Execution) {
                let addr = this.checkAddr(this.processor.registers[Rb])
                let res = this.processor.registers[Rd] = this.overflow(this.processor.memory[addr])
                this.registerCells[Rd].value = this.convertIntTo32bitHex(res)
            }
        }

        storeRegister(Rd: Register, Rb: Register) {
            if (this.phase == Phase.Execution) {
                let addr = this.checkAddr(this.processor.registers[Rb])
                let res = this.processor.registers[Rd]
                this.processor.memory[addr] = this.overflow(res)
                this.memoryCells[addr].innerText = this.convertIntTo32bitHex(res)
            }
        }

        compareRegisters(Rd: Register, Rs: Register) {
            if (this.phase == Phase.Execution) {
                let neg = UPPER - this.processor.registers[Rs]
                let res = this.overflow(this.processor.registers[Rd] + neg, true)
            }
        }

        setLabel(lbl: Label) {
            if (this.phase == Phase.Analysis) {
                U.assert(this.labels.indexOf(lbl) == -1, "Label L" + (lbl + 1).toString() + " is included twice in program.")
                this.labels.push(lbl)
                this.asyncContinuations.push(lbl)
            }
            runtime.overwriteResume(-1)
        }

        private branchToLabel(lbl: Label) {
            // find the index of lbl
            let index = this.asyncContinuations.indexOf(lbl)
            // we check for label at runtime, not at compile time
            U.assert(index != -1, "Label L" + (lbl + 1).toString() + " is referenced but not included in program.")
            // find the continuation from runtime
            let entry = <any>runtime.entry
            let continuations: number[] = <number[]>entry.continuations
            U.assert(continuations.length > index, "Internal error: branchToLabel")
            runtime.overwriteResume(continuations[index])
        }

        conditionalBranch(cond: Condition, lbl: Label) {
            if (this.phase == Phase.Analysis) {
                this.branchLabels.push(lbl)
                this.asyncContinuations.push(-1)
            } else {
                switch (cond) {
                    case Condition.EQ:
                        if (this.processor.Z) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.NE:
                        if (!this.processor.Z) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.GT:
                        if (!this.processor.N && !this.processor.Z) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.LT:
                        if (this.processor.N) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.GE:
                        if (!this.processor.N || this.processor.Z) {
                            this.branchToLabel(lbl)
                            return
                        }
                        break
                    case Condition.LE:
                        if (this.processor.Z || this.processor.N) {
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