import * as R from 'ramda';

import { memoizeOne } from 'core/memoizer';
import memoizerCache from 'core/cache/memoizer';

import {
    IConditionalDropdown
} from 'dash-table/components/CellDropdown/types';

import {
    Data,
    Datum,
    VisibleColumns,
    ColumnId,
    Indices,
    IBaseVisibleColumn,
    IVisibleColumn,
    IDataDropdowns,
    IColumnDropdown,
    IConditionalColumnDropdown,
    IDropdown
} from 'dash-table/components/Table/props';
import { QuerySyntaxTree } from 'dash-table/syntax-tree';

const mapData = R.addIndex<Datum, (IDropdown | undefined)[]>(R.map);

export default () => new Dropdowns().get;

class Dropdowns {
    /**
     * Return the dropdown for each cell in the table.
     */
    get = memoizeOne((
        columns: VisibleColumns,
        data: Data,
        indices: Indices,
        columnConditionalDropdown: IConditionalColumnDropdown[],
        columnStaticDropdown: IColumnDropdown[],
        dropdown_properties: IDataDropdowns
    ) => mapData((datum, rowIndex) => R.map(column => {
        const applicable = this.applicable.get(column.id, rowIndex)(
            column,
            indices[rowIndex],
            columnConditionalDropdown,
            columnStaticDropdown,
            dropdown_properties
        );

        return this.dropdown.get(column.id, rowIndex)(
            applicable,
            column,
            datum
        );
    }, columns), data));

    /**
     * Returns the list of applicable dropdowns for a cell.
     */
    private readonly applicable = memoizerCache<[ColumnId, number]>()((
        column: IBaseVisibleColumn,
        realIndex: number,
        columnConditionalDropdown: IConditionalColumnDropdown[],
        columnStaticDropdown: IColumnDropdown[],
        dropdown_properties: IDataDropdowns
    ): [IDropdown | null, IConditionalDropdown[]] => {
        const legacyDropdown =
            dropdown_properties &&
            dropdown_properties[column.id] &&
            dropdown_properties[column.id].length > realIndex &&
            dropdown_properties[column.id][realIndex] &&
            dropdown_properties[column.id][realIndex];

        const conditional = columnConditionalDropdown.find((cs: any) => cs.id === column.id);
        const base = columnStaticDropdown.find((ss: any) => ss.id === column.id);

        return [
            legacyDropdown || base || null,
            (conditional && conditional.dropdowns) || []
        ];
    });

    /**
     * Returns the highest priority dropdown from the
     * applicable dropdowns.
     */
    private readonly dropdown = memoizerCache<[ColumnId, number]>()((
        applicableDropdowns: [IDropdown | null, IConditionalDropdown[]],
        column: IVisibleColumn,
        datum: Datum
    ) => {
        const [staticDropdown, conditionalDropdowns] = applicableDropdowns;

        const matches: IDropdown[] = [];

        if (staticDropdown) {
            matches.push(staticDropdown);
        }

        matches.push(...R.map(
            ([cd]) => cd,
            R.filter<[IConditionalDropdown, number]>(
                ([cd, i]) => this.evaluation.get(column.id, i)(
                    this.ast.get(column.id, i)(cd.condition),
                    datum
                ),
                R.addIndex<IConditionalDropdown, [IConditionalDropdown, number]>(R.map)(
                    (cd, i) => [cd, i],
                    conditionalDropdowns
                ))
        ));

        return matches.length ? matches.slice(-1)[0] : undefined;
    });

    /**
     * Get the query's AST.
     */
    private readonly ast = memoizerCache<[ColumnId, number]>()((
        query: string
    ) => new QuerySyntaxTree(query));

    /**
     * Evaluate if the query matches the cell's data.
     */
    private readonly evaluation = memoizerCache<[ColumnId, number]>()((
        ast: QuerySyntaxTree,
        datum: Datum
    ) => ast.evaluate(datum));
}