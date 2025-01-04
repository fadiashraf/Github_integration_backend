export const getSortObject = (sortModel) => {

    if (Object.keys(sortModel).length === 0) {
        return { createdAt: -1 };
    }
    const sortObject = sortModel.reduce((acc, { sort, colId }) => {
        acc[colId] = sort === 'asc' ? 1 : -1;
        return acc;
    }, {});

    return sortObject;
};

export const getGlobalSearchFilter = (model, search) => {
    if (!search) return {};

    const stringFields = Object.keys(model.schema.paths).filter(
        (path) => model.schema.paths[path].instance === 'String'
    );

    return {
        $or: stringFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' },
        })),
    };
};

export const getColumnFilters = (filterModel, mapFilter) => {
    return Object.entries(filterModel).reduce((filters, [key, filterItem]) => {
        const conditions = Array.isArray(filterItem?.conditions)
            ? filterItem.conditions.map((cond) => mapFilter(key, cond))
            : [mapFilter(key, filterItem)];

        if (filterItem.operator === 'AND') {
            filters.push({ $and: conditions });
        } else {
            filters.push({ $or: conditions });
        }

        return filters;
    }, []);
};

export const combineFilters = (globalSearchFilter, columnFilters) => {
    const combinedFilters = [];

    if (Object.keys(globalSearchFilter).length > 0) {
        combinedFilters.push(globalSearchFilter);
    }

    if (Object.keys(columnFilters).length > 0) {
        combinedFilters.push({ $and: columnFilters });
    }

    if (combinedFilters.length > 0) {
        return { $and: combinedFilters };
    }

    return {}
};
export const escapeRegex = (string) => {
    return string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const mapFilter = (key, item) => {
    const filterType = item?.filterType || 'text';

    if (filterType === 'date') return mapDateFilter(key, item);

    const operators = {
        equals: { [key]: item.filter },
        notEqual: { [key]: { $ne: item.filter } },
        contains: { [key]: { $regex: item.filter, $options: 'i' } },
        notContains: { [key]: { $not: { $regex: item.filter, $options: 'i' } } },
        startsWith: { [key]: { $regex: `^${escapeRegex(item.filter)}`, $options: 'i' } },
        endsWith: { [key]: { $regex: `${escapeRegex(item.filter)}$`, $options: 'i' } },
        greaterThan: { [key]: { $gt: item.filter } },
        greaterThanOrEqual: { [key]: { $gte: item.filter } },
        lessThan: { [key]: { $lt: item.filter } },
        lessThanOrEqual: { [key]: { $lte: item.filter } },
        inRange: { [key]: { $gte: item.filter, $lte: item.filterTo } },
        blank: { $or: [{ [key]: { $exists: false } }, { [key]: null }, { [key]: '' }] },
        notBlank: {
            $and: [
                { [key]: { $exists: true } },
                { [key]: { $ne: null } },
                { [key]: { $ne: '' } },
            ],
        },
    };

    return operators[item.type] || {};
};

export const mapDateFilter = (key, item) => {
    const dateFrom = item.dateFrom ? new Date(item.dateFrom) : null;
    const dateTo = item.dateTo ? new Date(item.dateTo) : null;

    const operators = {
        equals: { [key]: dateFrom },
        notEqual: { [key]: { $ne: dateFrom } },
        greaterThan: { [key]: { $gt: dateFrom } },
        greaterThanOrEqual: { [key]: { $gte: dateFrom } },
        lessThan: { [key]: { $lt: dateFrom } },
        lessThanOrEqual: { [key]: { $lte: dateFrom } },
        inRange: { [key]: { $gte: dateFrom, ...(dateTo && { $lte: dateTo }) } },
        blank: { $or: [{ [key]: { $exists: false } }, { [key]: null }] },
        notBlank: { [key]: { $exists: true, $ne: null } },
    };

    return operators[item.type] || {};
};