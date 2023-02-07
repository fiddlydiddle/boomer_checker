import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class DataArrayConverterService {
    convert(jsonArray: any[], visibleColumns: string[] | null): any[] {
        let result: any[] = [];

        if (jsonArray.length > 0) {
            jsonArray.forEach(row => {
                result.push(this.buildRecordRow(row, visibleColumns));
            });
        }

        return result;
    };

    buildRecordRow (arrayItem: any, visibleColumns: string[] | null): any[] {
        let newRow: any[] = [];
        let properties = Object.keys(arrayItem);
        properties.forEach(property => {
            // Only include value if it is in a visible column, or if there are no specified visible columns
            if (visibleColumns === null || visibleColumns.includes(property)) {
                newRow.push(arrayItem[property]);
            }
        });
        return newRow;
    };
}