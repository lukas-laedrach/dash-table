import * as R from 'ramda';

import { memoizeOneFactory } from 'core/memoizer';

import { VisibleColumns } from 'dash-table/components/Table/props';

import { IConvertedStyle } from '../style';
import { traverseMap2 } from 'core/math/matrixZipMap';
import { getHeaderCellStyle, getHeaderOpCellStyle } from '../edges';

const getter = (
    columns: VisibleColumns,
    headerRows: number,
    headerStyles: IConvertedStyle[]
) => traverseMap2(
    R.range(0, headerRows),
    columns,
    (i, column) => getHeaderCellStyle(i, column)(headerStyles)
);

const opGetter = (
    rows: number,
    columns: number,
    columnStyles: IConvertedStyle[]
) => traverseMap2(
    R.range(0, rows),
    R.range(0, columns),
    i => getHeaderOpCellStyle(i)(columnStyles)
);

export default memoizeOneFactory(getter);
export const derivedHeaderOpStyles = memoizeOneFactory(opGetter);