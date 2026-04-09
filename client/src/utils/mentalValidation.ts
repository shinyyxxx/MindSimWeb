export type PersonType = 'puthujjana' | 'sotapanna' | 'sakadagami' | 'anagami' | 'arahant';
export const PERSON_TYPES: PersonType[] = [
    'puthujjana',
    'sotapanna',
    'sakadagami',
    'anagami',
    'arahant',
];
const UNIVERSAL_7 = new Set([
    'Contact',
    'Feeling',
    'Perception',
    'Intention',
    'Concentration',
    'Life Faculty',
    'Attention',
]);
const BAD_CETASIKAS = new Set([
    'Delusion',
    'Shamelessness',
    'Recklessness',
    'Restlessness',
    'Greed',
    'Wrong View',
    'Conceit',
    'Hatred',
    'Envy',
    'Stinginess',
    'Worry',
    'Sloth',
    'Torpor',
    'Doubt',
]);
const GOOD_CETASIKAS = new Set([
    'Faith',
    'Mindfulness',
    'Moral Shame',
    'Moral Dread',
    'Non-greed',
    'Non-hatred',
    'Equanimity',
    'Tranquility (Body)',
    'Tranquility (Mind)',
    'Lightness (Body)',
    'Lightness (Mind)',
    'Wieldiness (Body)',
    'Wieldiness (Mind)',
    'Proficiency (Body)',
    'Proficiency (Mind)',
    'Pliancy (Body)',
    'Pliancy (Mind)',
    'Rectitude (Body)',
    'Rectitude (Mind)',
    'Right Speech',
    'Right Action',
    'Right Livelihood',
    'Compassion',
    'Appreciative Joy',
    'Wisdom',
]);
const MOHA_4 = new Set(['Delusion', 'Shamelessness', 'Recklessness', 'Restlessness']);
const DOSA_GROUP = new Set(['Hatred', 'Envy', 'Stinginess', 'Worry']);
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export function validateMentalComposition(mentalNames: string[], personType: PersonType): ValidationResult {
    const errors: string[] = [];
    const nameSet = new Set(mentalNames);
    const missingUniversals: string[] = [];
    for (const u of UNIVERSAL_7) {
        if (!nameSet.has(u))
            missingUniversals.push(u);
    }
    if (missingUniversals.length > 0) {
        errors.push(`Missing required universal cetasika(s): ${missingUniversals.join(', ')}`);
    }
    const presentBad = mentalNames.filter((n) => BAD_CETASIKAS.has(n));
    const presentGood = mentalNames.filter((n) => GOOD_CETASIKAS.has(n));
    if (presentBad.length > 0 && presentGood.length > 0) {
        errors.push(`Akusala cetasika(s) [${presentBad.join(', ')}] cannot coexist with ` +
            `Sobhana cetasika(s) [${presentGood.join(', ')}]`);
    }
    if (presentBad.length > 0) {
        const hasBad = (n: string) => nameSet.has(n);
        if (hasBad('Greed') && hasBad('Hatred')) {
            errors.push('Greed (Lobha) and Hatred (Dosa) cannot coexist');
        }
        if (hasBad('Wrong View') && hasBad('Conceit')) {
            errors.push('Wrong View (Ditthi) and Conceit (Mana) cannot coexist');
        }
        const hasSloth = hasBad('Sloth');
        const hasTorpor = hasBad('Torpor');
        if (hasSloth !== hasTorpor) {
            errors.push('Sloth and Torpor must always appear together');
        }
        if (hasBad('Doubt')) {
            const otherBad = presentBad.filter((n) => n !== 'Doubt' && !MOHA_4.has(n));
            if (otherBad.length > 0) {
                errors.push(`Doubt (Vicikiccha) can only coexist with the Moha group ` +
                    `(Delusion, Shamelessness, Recklessness, Restlessness), ` +
                    `but found: ${otherBad.join(', ')}`);
            }
        }
        if (hasBad('Greed')) {
            const dosaPresent = presentBad.filter((n) => DOSA_GROUP.has(n));
            if (dosaPresent.length > 0) {
                errors.push(`Greed (Lobha) cannot coexist with Dosa-group cetasika(s): ${dosaPresent.join(', ')}`);
            }
        }
    }
    if (personType === 'sotapanna' || personType === 'sakadagami') {
        if (nameSet.has('Wrong View')) {
            errors.push(`${personType} cannot have Wrong View (eradicated at stream-entry)`);
        }
        if (nameSet.has('Doubt')) {
            errors.push(`${personType} cannot have Doubt (eradicated at stream-entry)`);
        }
    }
    else if (personType === 'anagami') {
        const forbidden = ['Wrong View', 'Doubt', 'Hatred', 'Envy', 'Stinginess', 'Worry'];
        const found = forbidden.filter((n) => nameSet.has(n));
        if (found.length > 0) {
            errors.push(`anagami cannot have: ${found.join(', ')} (eradicated cetasikas)`);
        }
    }
    else if (personType === 'arahant') {
        if (presentBad.length > 0) {
            errors.push(`arahant cannot have ANY akusala cetasika(s): ${presentBad.join(', ')}`);
        }
    }
    return { valid: errors.length === 0, errors };
}
