const mindSlugOverrides: Record<string, string> = {
    'โลภมูล ดวงที่ 1': 'greed-rooted-1',
    'โลภมูล ดวงที่ 2': 'greed-rooted-2',
    'โลภมูล ดวงที่ 3': 'greed-rooted-3',
    'โลภมูล ดวงที่ 4': 'greed-rooted-4',
    'โลภมูล ดวงที่ 5': 'greed-rooted-5',
    'โลภมูล ดวงที่ 6': 'greed-rooted-6',
    'โลภมูล ดวงที่ 7': 'greed-rooted-7',
    'โลภมูล ดวงที่ 8': 'greed-rooted-8',
    'โทสะมูล ดวงที่ 1': 'hatred-rooted-1',
    'โทสะมูล ดวงที่ 2': 'hatred-rooted-2',
    'โมหมูล ดวงที่ 1': 'delusion-rooted-1',
    'โมหมูล ดวงที่ 2': 'delusion-rooted-2',
    'ทวิปัญจวิญญาณ 10': 'double-five-door-consciousness-10',
    'อุเบกขาสันตีรณ 2': 'investigating-with-equanimity-2',
    'มโนธาตุ 3': 'mind-element-3',
    'โสมนัสสันตีรณ 1': 'investigating-with-joy-1',
    'มโนทวาราวัชชน 1': 'mind-door-adverting-1',
    'หสิตุปปาท 1': 'smile-producing-1',
    'มหากุศล คู่ที่ 1': 'great-wholesome-pair-1',
    'มหากุศล คู่ที่ 2': 'great-wholesome-pair-2',
    'มหากุศล คู่ที่ 3': 'great-wholesome-pair-3',
    'มหากุศล คู่ที่ 4': 'great-wholesome-pair-4',
    'มหาวิปาก คู่ที่ 1': 'great-resultant-pair-1',
    'มหาวิปาก คู่ที่ 2': 'great-resultant-pair-2',
    'มหาวิปาก คู่ที่ 3': 'great-resultant-pair-3',
    'มหาวิปาก คู่ที่ 4': 'great-resultant-pair-4',
    'มหากิริยา คู่ที่ 1': 'great-functional-pair-1',
    'มหากิริยา คู่ที่ 2': 'great-functional-pair-2',
    'มหากิริยา คู่ที่ 3': 'great-functional-pair-3',
    'มหากิริยา คู่ที่ 4': 'great-functional-pair-4',
    'ปฐมฌาน 3': 'first-jhana-3',
    'ทุติยฌาน 3': 'second-jhana-3',
    'ตติยฌาน 3': 'third-jhana-3',
    'จตุตถฌาน 3': 'fourth-jhana-3',
    'ปัญจมฌาน 15': 'fifth-jhana-15',
    'ปฐมฌาน 8': 'first-jhana-8',
    'ทุติยฌาน 8': 'second-jhana-8',
    'ตติยฌาน 8': 'third-jhana-8',
    'จตุตถฌาน 8': 'fourth-jhana-8',
    'ปัญจมฌาน 8': 'fifth-jhana-8',
};
export const toMindSlug = (value: string): string => {
    const trimmed = value.trim();
    const override = mindSlugOverrides[trimmed];
    if (override)
        return override;
    const slug = trimmed
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return slug || 'mind';
};
export { mindSlugOverrides };
