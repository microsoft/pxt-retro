// Auto-generated from simulator. Do not edit.
declare namespace console {
    /**
     * Print out message
     */
    //%
    //% shim=console::log
    function log(msg: string): void;

}
declare namespace control {
    /**
     * a label to jump to 
     */
    //% blockId=processorLBL block="LBL %lbl"
    //% async
    //% shim=control::label
    function label(lbl: Label): void;

    /**
     * Compare contents of Rs and Rd
     */
    //% blockId=processorCMP 
    //% block="CMP d:%Rd |, s:%Rs"
    //% shim=control::cmp
    function cmp(Rd: Register, Rs: Register): void;

    /**
     * B = branch on condition
     */
    //% blockId=processorBEQ
    //% block="B%cond || %lbl"
    //% async
    //% shim=control::beq
    function beq(cond: Condition, lbl: Label): void;

}
declare namespace shift {
    /**
     * Shift Rs left by 5-bit immediate value C and place result in Rd
     */
    //% blockId=processorLSL
    //% block="LSL d:%Rd |, s:%Rs |, C:%Offset5"
    //% Offset5.min=0 Offset5.max=31
    //% shim=shift::lsl
    function lsl(Rd: Register, Rs: Register, Offset5: number): void;

    /**
     * Shift Rs right by 5-bit immediate value C and place result in Rd
     */
    //% blockId=processorLSR 
    //% block="LSR d:%Rd |, s:%Rs |, C:%Offset5"
    //% Offset5.min=0 Offset5.max=31
    //% shim=shift::lsr
    function lsr(Rd: Register, Rs: Register, Offset5: number): void;

}
declare namespace logical {
    /**
     * Logically negate of the contents of Rs and place result in Rd
     */
    //% blockId=processorNEG 
    //% block="NEG d:%Rd |, s:%Rs"
    //% shim=logical::neg
    function neg(Rd: Register, Rs: Register): void;

    /**
     * Logical AND the contents of Rd with the contents of Rs and place result in Rd
     */
    //% blockId=processorAND
    //% block="AND d:%Rd |, s:%Rs"
    //% shim=logical::and
    function and(Rd: Register, Rs: Register): void;

    /**
     * Logical OR the contents of Rd with the contents of Rs and place result in Rd
     */
    //% blockId=processorORR
    //% block="ORR d:%Rd |, s:%Rs"
    //% shim=logical::orr
    function orr(Rd: Register, Rs: Register): void;

    /**
     * Logical EOR the contents of Rd with the contents of Rs and place result in Rd
     */
    //% blockId=processorEOR
    //% block="EOR d:%Rd |, s:%Rs"
    //% shim=logical::eor
    function eor(Rd: Register, Rs: Register): void;

}
declare namespace arithmetic {
    //% blockId=processorMOVSIMM
    //% block="MOV d:%Rd |, C:%Offset8"
    //% weight=90
    //% Offset8.min=0 Offset8.max=255
    //% shim=arithmetic::movsImm
    function movsImm(Rd: Register, Offset8: number): void;

    /**
     * Add 8-bit immediate value C to contents of Rd and place result in Rd
     */
    //% blockId=processorADDIMM
    //% block="ADD d:%Rd |, C:%Offset8"
    //% weight=88 
    //% Offset8.min=0 Offset8.max=255
    //% shim=arithmetic::addImm
    function addImm(Rd: Register, Offset8: number): void;

    /**
     * Subtract 8-bit immediate value C from contents of Rd and place result in Rd
     */
    //% blockId=processorSUBIMM
    //% block="SUB d:%Rd |, C:%Offset8"
    //% weight=86
    //% Offset8.min=0 Offset8.max=255
    //% shim=arithmetic::subImm
    function subImm(Rd: Register, Offset8: number): void;

    /**
     * Add contents of Rs to contents of Rd and place result in Rd
     */
    //% blockId=processorADD
    //% block="ADD d:%Rd |, s:%Rs |, n:%Rn"
    //% weight=84
    //% shim=arithmetic::add
    function add(Rd: Register, Rs: Register, Rn: Register): void;

    /**
     * Subtract contents of Rs from contents of Rd and place result in Rd
     */
    //% blockId=processorSUB
    //% block="SUB d:%Rd |, s:%Rs |, n:%Rn"
    //% weight=82
    //% shim=arithmetic::sub
    function sub(Rd: Register, Rs: Register, Rn: Register): void;

}
declare namespace memory {
    /**
     * Load into Rd the 32-bit value at the address specified by Rb
     */
    //% blockId=processorLDR 
    //% block="LDR d:%Rd |, |[ b:%Rb |]"
    //% shim=memory::ldr
    function ldr(Rd: Register, Rb: Register): void;

    /**
     * Store the 32-bit value in Rd at the address specified by Rb
     */
    //% blockId=processorSTR
    //% block="STR d:%Rd |, |[ b:%Rb |]"
    //% shim=memory::str
    function str(Rd: Register, Rb: Register): void;

}
declare namespace io {
    /**
     * Load into Rd the next 32-bit value in the input queue, if not empty.
     * If the input queue is empty, stop program execution.
     */
    //% blockId=processorIN
    //% block="IN d:%rd"
    //% shim=io::queueIn
    function queueIn(Rd: Register): void;

    /**
     * Store into the output queue the 32-bit value in Rd.
     */
    //% blockId=processorOUT
    //% block="OUT d:%rd"
    //% shim=io::queueOut
    function queueOut(Rd: Register): void;

}

// Auto-generated. Do not edit. Really.
