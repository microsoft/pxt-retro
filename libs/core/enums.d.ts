declare const enum Register {
    R0, R1, R2, R3, R4, R5, R6, R7
}

declare const enum Condition {
    EQ, NE, LT, GT, LE, GE
}

declare const enum Label {
    L1, L2, L3, L4, L5, L6, L7, L8, L9, L10
}

declare const enum Memory {
    M00, M04, M08, M0C, M10, M14, M18, M1C, M20, M24, M28, 
    M2C, M30, M34, M38, M3C, M40, M44, M48, M4C, M50, M54, 
    M58, M5C, M60, M64, M68, M6C, M70, M74, M78, M7C, M80, 
    M84, M88, M8C, M90, M94, M98, M9C, MA0, MA4, MA8, MAC, 
    MB0, MB4, MB8, MBC, MC0, MC4, MC8, MCC, MD0, MD4, MD8, 
    MDC, ME0, ME4, ME8, MEC, MF0, MF4, MF8, MFC 
}