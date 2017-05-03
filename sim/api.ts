/// <reference path="../libs/core/enums.d.ts"/>

function logMsg(m:string) { console.log(m) }

namespace pxsim.console {
    /**
     * Print out message
     */
    //% 
    export function log(msg:string) {
        logMsg("CONSOLE: " + msg)
        // why doesn't that work?
        board().writeSerial(msg + "\n")
    }
}

//% color=#0078D7 weight=100
namespace pxsim.control {
    /**
     * a label to jump to 
     */
    //% blockId=processorLBL block="LBL %lbl"
    //% async  
    export function label(lbl: Label) { 
        // note that we use PXT's async compilation feature to generate
        // a continuation in the generated JavaScript for the branch to 
        // target.  We need to get access to thie continuation, so that
        // the branch instruction can instruct the runtime to continue
        // execution at that point
        board().setLabel(lbl)
    }

    /**
     * Compare contents of Rs and Rd
     */
    //% blockId=processorCMP 
    //% block="CMP d:%Rd |, s:%Rs"
    export function cmp(Rd: Register, Rs: Register) {
        board().compareRegisters(Rd,Rs)
    }

    /**
     * B = branch on condition
     */
    //% blockId=processorBEQ
    //% block="B%cond || %lbl"
    //% async  
    export function beq(cond: Condition, lbl: Label) {
        board().conditionalBranch(cond, lbl)
    }
}

//% color=#B4009E weight=99
namespace pxsim.shift {
    /**
     * Shift Rs left by 5-bit immediate value C and place result in Rd
     */
    //% blockId=processorLSL
    //% block="LSL d:%Rd |, s:%Rs |, C:%Offset5"
    //% Offset5.min=0 Offset5.max=31
    export function lsl(Rd: Register, Rs: Register, Offset5: number) {
        board().shiftRegister(Rd, Rs, "<<", Offset5)
    }

    /**
     * Shift Rs right by 5-bit immediate value C and place result in Rd
     */
    //% blockId=processorLSR 
    //% block="LSR d:%Rd |, s:%Rs |, C:%Offset5"
    //% Offset5.min=0 Offset5.max=31
    export function lsr(Rd: Register, Rs: Register, Offset5: number) {
        board().shiftRegister(Rd, Rs, ">>", Offset5)
    }
}


//% color=#5C2D91 weight=97
namespace pxsim.logical {
    /**
     * Logically negate of the contents of Rs and place result in Rd
     */
    //% blockId=processorNEG 
    //% block="NEG d:%Rd |, s:%Rs"
    export function neg(Rd: Register, Rs: Register) {
        board().logicRegister(Rd, "NEG", Rs)
    }

    /**
     * Logical AND the contents of Rd with the contents of Rs and place result in Rd
     */
    //% blockId=processorAND
    //% block="AND d:%Rd |, s:%Rs"
    export function and(Rd: Register, Rs: Register) {
        board().logicRegister(Rd, "AND", Rs)
    }

    /**
     * Logical OR the contents of Rd with the contents of Rs and place result in Rd
     */
    //% blockId=processorORR
    //% block="ORR d:%Rd |, s:%Rs"
    export function orr(Rd: Register, Rs: Register) {
        board().logicRegister(Rd, "ORR", Rs)
    }

    /**
     * Logical EOR the contents of Rd with the contents of Rs and place result in Rd
     */
    //% blockId=processorEOR
    //% block="EOR d:%Rd |, s:%Rs"
    export function eor(Rd: Register, Rs: Register) {
        board().logicRegister(Rd, "EOR", Rs)
    }
}

//% color=90 weight=30
namespace pxsim.arithmetic {

    //% blockId=processorMOVSIMM
    //% block="MOV d:%Rd |, C:%Offset8"
    //% weight=90
    //% Offset8.min=0 Offset8.max=255
    export function movsImm(Rd: Register, Offset8: number) {
        board().setRegister(Rd,Offset8);
    }

    /**
     * Add 8-bit immediate value C to contents of Rd and place result in Rd
     */
    //% blockId=processorADDIMM
    //% block="ADD d:%Rd |, C:%Offset8"
    //% weight=88 
    //% Offset8.min=0 Offset8.max=255
    export function addImm(Rd: Register, Offset8: number) {
        board().addRegister(Rd,Offset8);
    }

    /**
     * Subtract 8-bit immediate value C from contents of Rd and place result in Rd
     */
    //% blockId=processorSUBIMM
    //% block="SUB d:%Rd |, C:%Offset8"
    //% weight=86
    //% Offset8.min=0 Offset8.max=255
    export function subImm(Rd: Register, Offset8: number) {
        board().subRegister(Rd,Offset8);
    }

    /**
     * Add contents of Rs to contents of Rd and place result in Rd
     */
    //% blockId=processorADD
    //% block="ADD d:%Rd |, s:%Rs |, n:%Rn"
    //% weight=84
    export function add(Rd: Register, Rs: Register, Rn: Register) {
        board().addRegisters(Rd, Rs, Rn);
    }

    /**
     * Subtract contents of Rs from contents of Rd and place result in Rd
     */
    //% blockId=processorSUB
    //% block="SUB d:%Rd |, s:%Rs |, n:%Rn"
    //% weight=82
    export function sub(Rd: Register, Rs: Register, Rn: Register) {
        board().subRegisters(Rd, Rs, Rn);
    }
}

/**
 * memory
 */
//% color=#008272 weight=32
namespace pxsim.memory {
    /**
     * Load into Rd the 32-bit value at the address specified by Rb
     */
    //% blockId=processorLDR 
    //% block="LDR d:%Rd |, |[ b:%Rb |]"
    export function ldr(Rd: Register, Rb: Register) {
        board().loadRegister(Rd, Rb)
    }

    /**
     * Store the 32-bit value in Rd at the address specified by Rb
     */
    //% blockId=processorSTR
    //% block="STR d:%Rd |, |[ b:%Rb |]"
    export function str(Rd: Register, Rb: Register) {
        board().storeRegister(Rd, Rb)
    }
}

/**
 * Input/output
 */
//% color=#008002 weight=34
namespace pxsim.io {
    /**
     * Load into Rd the next 32-bit value in the input queue, if not empty.
     * If the input queue is empty, stop program execution.
     */
    //% blockId=processorIN
    //% block="IN d:%rd"
    export function queueIn(Rd: Register) {

    }

    /**
     * Store into the output queue the 32-bit value in Rd.
     */
    //% blockId=processorOUT
    //% block="OUT d:%rd"
    export function queueOut(Rd: Register) {

    }
}