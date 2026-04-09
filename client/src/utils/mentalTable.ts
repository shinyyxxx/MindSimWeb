import * as XLSX from 'xlsx';
import { toMindSlug } from './mindSlug';
export type MentalTableRow = {
    id: string;
    name: string;
    group?: string;
    description: string;
    highlights: string[];
    totalFactors?: number;
};
export async function loadMentalTableRows(): Promise<MentalTableRow[]> {
    const response = await fetch(`${import.meta.env.BASE_URL}MentalTable.xlsx`);
    if (!response.ok) {
        throw new Error(`Failed to fetch MentalTable.xlsx (status ${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[1] ?? workbook.SheetNames[0];
    if (!sheetName)
        return [];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        raw: false,
        blankrows: false,
    });
    if (rows.length < 3)
        return [];
    let currentGroup = '';
    const result: MentalTableRow[] = [];
    rows.slice(2).forEach((row) => {
        if (!Array.isArray(row))
            return;
        const [groupCell, nameCell, ...rest] = row;
        if (typeof groupCell === 'string' && groupCell.trim()) {
            currentGroup = groupCell.trim();
        }
        const name = typeof nameCell === 'string' ? nameCell.trim() : '';
        if (!name)
            return;
        const highlights: string[] = [];
        rest.forEach((value, idx) => {
            if (highlights.length >= 3)
                return;
            const normalized = typeof value === 'string' ? value.trim() : value;
            if (normalized === '' || normalized === null || normalized === undefined)
                return;
            const numeric = Number(normalized);
            if (!Number.isNaN(numeric)) {
                const headerCell = rows[1]?.[idx + 2];
                const header = typeof headerCell === 'string' && headerCell.trim() ? headerCell.trim() : `Factor ${idx + 1}`;
                highlights.push(`${header}: ${numeric}`);
            }
        });
        const numericValues = rest
            .map((value) => (typeof value === 'string' && value.trim() === '' ? NaN : Number(value)))
            .filter((value) => Number.isFinite(value)) as number[];
        const totalFactors = numericValues.length
            ? numericValues.reduce((sum, value) => sum + value, 0)
            : undefined;
        if (!highlights.length && typeof totalFactors === 'number') {
            highlights.push(`รวมทั้งหมด ${totalFactors} ปรากฏร่วม (total associated factors)`);
        }
        if (!highlights.length) {
            highlights.push('Data imported from MentalTable.xlsx');
        }
        const descriptionPieces = [];
        if (currentGroup)
            descriptionPieces.push(currentGroup);
        if (typeof totalFactors === 'number') {
            descriptionPieces.push(`Includes ${totalFactors} factors from the table.`);
        }
        const description = descriptionPieces.join(' — ') || 'Imported from MentalTable.xlsx';
        result.push({
            id: toMindSlug(name),
            name,
            group: currentGroup,
            description,
            highlights,
            totalFactors,
        });
    });
    return result;
}
