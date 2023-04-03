import * as React from 'react';
import { ICol, IRow, IUser } from '../types';
import RowTitle from './RowTitle/RowTitle';
import LastActivity from './LastActivity';
import Reviewers from './Reviewers';
// import BuildStatus from './components/BuildStatus';

export const columns: ICol[] = [
  {
    label: 'Name',
    getValue: (val: IRow) => val.title,
    getRendered: (val: IRow) => <RowTitle val={val} />,
    colClass: 'name-col',
    matchFilter: (newVal: string, row: IRow) =>
      row.author.display_name.toLowerCase().includes(newVal) || row.title.toLowerCase().includes(newVal),
  },
  {
    label: 'Tasks',
    getValue: (val: IRow) => val.task_count,
    getRendered: (val: IRow) => <span>{val.task_count || ''}</span>,
    colClass: 'tasks-col',
  },
  {
    label: 'Comments',
    getValue: (val: IRow) => val.comment_count,
    getRendered: (val: IRow) => <span>{val.comment_count || ''}</span>,
    colClass: 'comments-col',
  },
  // TODO: maybe replace at some point
  // {
  //   label: 'Build',
  //   getValue: (val: IRow) => (val.buildStatus === 'success' ? 1 : 0),
  //   getRendered: (val: IRow) => <BuildStatus val={val} />,
  //   colClass: 'build-col',
  // },
  {
    label: 'Reviewers',
    getValue: (val: IRow) => val.participants.filter((p) => p.role === 'REVIEWER' && p.approved).length,
    getRendered: (val: IRow, currentUser: IUser) => <Reviewers val={val} currentUser={currentUser} />,
    colClass: 'reviewers-col',
  },
  {
    label: 'Last activity',
    getValue: (val: IRow) => val.updated_on,
    getRendered: (val: IRow) => <LastActivity val={val} />,
    colClass: 'activity-col',
  },
];

// TODO: configurable columns

interface IProps {
  val: IRow;
  currentUser: IUser;
}

const Row = ({ val, currentUser }: IProps) => {
  return (
    <div className={'row'}>
      {columns.map((col) => (
        <div key={col.label} className={`row-col ${col.colClass}`}>
          {(col.getRendered ?? col.getValue)(val, currentUser)}
        </div>
      ))}
    </div>
  );
};

export default Row;