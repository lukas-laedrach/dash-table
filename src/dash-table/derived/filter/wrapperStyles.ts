import * as R from 'ramda';

import { memoizeOneFactory } from 'core/memoizer';

import { VisibleColumns } from 'dash-table/components/Table/props';

import { IConvertedStyle } from '../style';
import { getFilterCellStyle, getFilterOpCellStyle } from '../edges';
import { traverseMap2 } from 'core/math/matrixZipMap';

const getter = (
    columns: VisibleColumns,
    filterStyles: IConvertedStyle[]
) => R.map(
    column => getFilterCellStyle(column)(filterStyles),
    columns
);

const opGetter = (
    rows: number,
    columns: number,
    columnStyles: IConvertedStyle[]
) => traverseMap2(
    R.range(0, rows),
    R.range(0, columns),
    () => getFilterOpCellStyle()(columnStyles)
);

export default memoizeOneFactory(getter);
export const derivedFilterOpStyles = memoizeOneFactory(opGetter);