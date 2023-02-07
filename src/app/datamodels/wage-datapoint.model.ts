export interface WageDataPoint {
    date: string;
    cpiValue: number;
    minimumWage: number;
    cpiAdjustedMinWage: number;
    medianWage: number;
    cpiAdjustedMedianWage: number;
    ceoCompensation: number;
    cpiAdjustedCeoCompensation: number;
}