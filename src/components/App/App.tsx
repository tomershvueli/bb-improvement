import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ICol, IInPlaceFilters, IRefreshableFilters, IRow, IRowFilters, IUser } from '../../types';
import Row, { columns } from '../Row';
import { DARK_MODE_KEY, DRAWER_KEY, FILTER_KEY, RESULTS_PER_PAGE } from '../../api';
import UserSelector from '../UserSelector';
import { DownArrow, UpArrow } from '../Icons/Icons';
import DrawerFiltersInPlace from '../DrawerFilters/DrawerFiltersInPlace';
import ColumnFilter from '../ColumnFilter/ColumnFilter';
import Spinner from '../Spinner/Spinner';
import Drawer from '../Drawer/Drawer';
import Button from '../Button/Button';
import useData from '../../hooks/useData';
import { passesFilters } from '../../filters';
import { cx, sanitizeRegex } from '../../utils';
import DrawerFiltersReload from '../DrawerFilters/DrawerFiltersReload';
import DarkModeToggle from './DarkModeToggle';

const getSortedRows = (rows: IRow[], colType: string, isAsc?: boolean) => {
  const getValue = columns.find((col) => col.label === colType)?.getValue ?? (() => 'zzzz');
  rows.sort((a, b) => {
    const val1 = getValue(isAsc ? a : b);
    const val2 = getValue(isAsc ? b : a);
    if (typeof val2 === 'number') {
      // @ts-ignore: revisit?
      return val2 - val1;
    }
    return val2.localeCompare(val1 as string);
  });
  return [...rows];
};

type ColFilter = (row: IRow) => boolean;

const saveFilters = (newVal: IRowFilters) => {
  localStorage.setItem(
    FILTER_KEY,
    JSON.stringify({
      ...newVal,
      compiledRegex: undefined,
    }),
  );
};

interface IProps {
  isProd: boolean;
  loggedInUserUuid: string;
  defaultRefreshableFilters: IRefreshableFilters;
  defaultInPlaceFilters: IInPlaceFilters;
  savedFilters: IRowFilters;
}

function App({ isProd, loggedInUserUuid, defaultRefreshableFilters, defaultInPlaceFilters, savedFilters }: IProps) {
  const [sortType, setSortType] = useState<string>(`${columns[columns.length - 1].label}:asc`);
  const [sortedRows, setSortedRows] = useState<IRow[]>([]);
  const [colFilers, setColFilters] = useState<{ [colLabel: string]: ColFilter }>({});
  const [currentUser, setCurrentUser] = useState<IUser>({ uuid: loggedInUserUuid, display_name: 'Me' } as IUser);
  const [drawerOpen, setDrawerOpen] = useState(localStorage.getItem(DRAWER_KEY) !== 'false');
  const [rowFilters, setRowFilters] = useState<IRowFilters>(savedFilters);
  const [isDarkMode, setIsDarkMode] = useState(JSON.parse(localStorage.getItem(DARK_MODE_KEY) ?? 'false'));

  const { isLoading, summarized, pullRequests, allUsersById, refresh } = useData();

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === '[') {
        setDrawerOpen(!drawerOpen);
      }
    };
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [drawerOpen]);

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const nextSortType = sortType;
    const sortColumn = nextSortType.split(':')[0];
    setSortedRows(getSortedRows(pullRequests, sortColumn, nextSortType.split(':')[1] === 'asc'));
  }, [pullRequests, sortType]);

  useEffect(() => {
    setRowFilters((prevState) => {
      const newFilters = {
        ...prevState,
        userUuid: currentUser.uuid,
      };
      // if user changes, refresh data as well
      refresh(newFilters);
      return newFilters;
    });
  }, [currentUser]);

  useEffect(() => {
    saveFilters(rowFilters);
  }, [rowFilters]);

  useEffect(() => {
    setRowFilters((prevState: IRowFilters) => {
      return {
        ...prevState,
        compiledRegex: sanitizeRegex(prevState.regex),
      };
    });
  }, [rowFilters.regex]);

  useEffect(() => {
    localStorage.setItem(DRAWER_KEY, JSON.stringify(drawerOpen));
  }, [drawerOpen]);

  const onFilterType = useCallback((col: ICol, newVal: string) => {
    setColFilters((prevState) => ({
      ...prevState,
      [col.label]: (row: IRow) => col.matchFilter?.(newVal, row) ?? true,
    }));
  }, []);

  useEffect(() => {
    // only refresh if user actually changed from the original user *or* if not in prod
    if (!isProd || currentUser.links) {
      refresh(rowFilters);
    }
  }, [rowFilters.pageNum]);

  const onHeaderClick = (colType: string) => {
    const isAsc = sortType === `${colType}:asc`;
    setSortType(`${colType}:${isAsc ? 'desc' : 'asc'}`);
  };

  const onFilterSelect = (newVal: string, filterType: keyof IRowFilters) => {
    setRowFilters((prevState: IRowFilters) => ({
      ...prevState,
      [filterType]: newVal,
    }));
  };

  const onGoClick = async () => {
    await refresh(rowFilters);
  };

  const clearInPlaceFilters = () =>
    setRowFilters((prevState) => ({
      ...prevState,
      ...defaultInPlaceFilters,
      compiledRegex: undefined,
    }));

  const clearReloadFilters = () =>
    setRowFilters((prevState) => ({
      ...prevState,
      ...defaultRefreshableFilters,
    }));

  const visibleRows = sortedRows.filter(
    (row) => passesFilters(row, rowFilters) && Object.values(colFilers).every((colFilter) => colFilter(row)),
  );
  const possiblePages = Array.from({ length: Math.ceil(summarized.totalNumResults / RESULTS_PER_PAGE) }).map(
    (_, pageNum) => pageNum + 1,
  );
  const onPageClick = (pageNum: number) => {
    if (pageNum === summarized.pageNum) {
      return;
    }
    summarized.pageNum = pageNum;
    setRowFilters((prevState) => ({
      ...prevState,
      pageNum,
    }));
  };

  return (
    <div className={cx('app__root', isDarkMode && 'app__root--dark')}>
      <div className={'app__header'}>
        <div className={'app__user-section'}>
          <UserSelector loggedInUserUuid={loggedInUserUuid} onUserChange={setCurrentUser} allUsersById={allUsersById} />
          <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          {!isLoading && (
            <span className={'app__num-visible'}>
              {visibleRows.length} of {sortedRows.length} visible
            </span>
          )}
          {/*{!loading && (*/}
          {/*  <UserStats userUuid={currentUser.uuid} />*/}
          {/*)}*/}
        </div>
        <div className={'app__header-action-container'}>
          {sortedRows.length > 0 && (
            <>
              <span>Page</span>
              <div className={'app__page-selector'}>
                {possiblePages.map((pageNum) => (
                  <span
                    key={pageNum}
                    className={cx(
                      'app__page-selector__page',
                      'link',
                      summarized.pageNum === pageNum && 'app__page-selector__page--current',
                    )}
                    onClick={() => onPageClick(pageNum)}>
                    {pageNum}
                  </span>
                ))}
              </div>
            </>
          )}
          <Button onClick={() => refresh(rowFilters)} className={'app__refresh-btn'}>
            <span>&#8635; Refresh</span>
          </Button>
        </div>
      </div>
      <div className={'app__content'}>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerFiltersInPlace
            defaultFilters={defaultInPlaceFilters}
            rowFilters={rowFilters}
            summarized={summarized}
            onFilterSelect={onFilterSelect}
            clearFilters={clearInPlaceFilters}
            isLoading={isLoading}
          />
          <DrawerFiltersReload
            defaultFilters={defaultRefreshableFilters}
            rowFilters={rowFilters}
            onFilterSelect={onFilterSelect}
            clearFilters={clearReloadFilters}
            onGoClick={onGoClick}
            isLoading={isLoading}
          />
        </Drawer>
        <div className={'app__content-body'}>
          <div className={'app__content-header'}>
            {columns.map((col) => (
              <div key={col.label} className={`app__content-header-col ${col.colClass}`}>
                <span className={'app__content-header-label'}>{col.label}</span>
                <div className={'app__content-header-col-actions'}>
                  {col.matchFilter && <ColumnFilter onFilterChange={(newVal: string) => onFilterType(col, newVal)} />}
                  <SortArrow
                    onClick={() => onHeaderClick(col.label)}
                    sort={sortType?.substring(col.label.length + 1) as any}
                  />
                </div>
              </div>
            ))}
          </div>
          {isLoading && (
            <div className={'app__content-loading-container'}>
              <Spinner size={'64px'} />
            </div>
          )}
          {!isLoading && (
            <div className={'app__content-rows'}>
              {!isLoading &&
                visibleRows.map((val: IRow, index) => <Row key={index} val={val} currentUser={currentUser} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ISortArrowProps {
  onClick: () => void;
  sort?: 'asc' | 'desc';
}

const SortArrow = ({ onClick, sort }: ISortArrowProps) => {
  return (
    <div className={'app__sort-arrows'} onClick={onClick}>
      {<UpArrow selected={sort === 'asc'} />}
      {<DownArrow selected={sort === 'desc'} />}
    </div>
  );
};

export default App;
