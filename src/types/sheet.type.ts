export type AFFSheet = {
    id: number;
    name: string;
    notes: string;
    sections: Array<AFFSheetSection>;
}

export type AFFSheetSection = {
    id: number;
    name: string;
    stats: Array<AFFSheetStats>;
}

export type AFFSheetStats = {
    id: number;
    name: string;
    value: string;
}