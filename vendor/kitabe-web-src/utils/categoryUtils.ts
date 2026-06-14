export const placeMatchesCategoryFilter = (
    placeCategory: any,
    selectedCategories: string[]
): boolean => {
    if (!selectedCategories || selectedCategories.length === 0) return true;
    if (!placeCategory) return false;

    let placeCategories: string[] = [];

    if (Array.isArray(placeCategory)) {
        placeCategories = placeCategory.map(c =>
            typeof c === 'string' ? c : (c.tr || c.en || '')
        );
    } else if (typeof placeCategory === 'object') {
        if (placeCategory.main && Array.isArray(placeCategory.main)) {
            // New hierarchical structure: { main: [...], sub: {...} }
            const mainCats = placeCategory.main.map((c: any) =>
                typeof c === 'string' ? c : (c.tr || c.en || '')
            );

            let subCats: string[] = [];
            if (placeCategory.sub && typeof placeCategory.sub === 'object') {
                // Collect all sub-category texts
                Object.values(placeCategory.sub).forEach((subArray: any) => {
                    if (Array.isArray(subArray)) {
                        const parsedSubs = subArray.map(c => typeof c === 'string' ? c : (c.tr || c.en || ''));
                        subCats = [...subCats, ...parsedSubs];
                    }
                });
                // Also consider the keys of the sub object as categories (main category IDs)
                subCats = [...subCats, ...Object.keys(placeCategory.sub)];
            }

            placeCategories = [...mainCats, ...subCats];
        } else {
            // Legacy structure: { tr: [...], en: [...] }
            placeCategories = placeCategory.tr || placeCategory.en || [];
        }
    }

    // Filter out falsy values and make lowercase for comparison
    const normalizedPlaceCats = placeCategories
        .filter(Boolean)
        .map(c => String(c).trim().toLowerCase());

    // Check if ANY of the selected categories match
    return selectedCategories.some(selectedCat => {
        const normalizedSelected = String(selectedCat).trim().toLowerCase();
        return normalizedPlaceCats.some(pc =>
            pc === normalizedSelected ||
            pc.includes(normalizedSelected) ||
            normalizedSelected.includes(pc)
        );
    });
};
