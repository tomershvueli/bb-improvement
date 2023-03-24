import * as React from 'react';
import { ICol, IRow } from './types';
import RowTitle from './RowTitle';
import { formatDate } from './utils';

// https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript#9763769
function msToTime(s: number) {
  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const minutes = s % 60;
  const hours = (s - minutes) / 60;
  if (hours < 0) {
    return `${minutes} min`;
  }

  const days = hours > 24 ? `${Math.floor(hours / 24)} days ` : '';
  return `${days}${hours % 24} hours`;
}

export const columns: ICol[] = [
  {
    getValue: (val: IRow) => val.title,
    label: 'Name',
    getRendered: (val: IRow) => <RowTitle val={val} />,
    colSpan: 3,
    colClass: 'name-col',
  },
  {
    getValue: (val: IRow) => val.task_count,
    label: 'Tasks',
    getRendered: (val: IRow) => val.task_count || '',
    colClass: 'tasks-col',
  },
  {
    getValue: (val: IRow) => val.comment_count,
    label: 'Comments',
    getRendered: (val: IRow) => val.comment_count || '',
    colClass: 'comments-col',
  },
  {
    label: 'Build',
    getValue: (val: IRow) => (val.buildStatus === 'success' ? 1 : 0),
    getRendered: (val: IRow) => <BuildStatus val={val} />,
    colClass: 'build-col',
  },
  {
    label: 'Reviewers',
    getValue: (val: IRow) => val.participants.filter((p) => p.role === 'REVIEWER' && p.approved).length,
    getRendered: (val: IRow) => <Reviewers val={val} />,
    colClass: 'reviewers-col',
  },
  {
    getValue: (val: IRow) => val.updated_on,
    label: 'Last activity',
    getRendered: (val: IRow) => <LastActivity val={val} />,
    colClass: 'activity-col',
  },
];

const approvedSvg = (
  <svg width='16' height='16' viewBox='0 0 24 24' role='presentation' style={{ color: '#36B37E', opacity: '.9' }}>
    <g fillRule='evenodd'>
      <circle fill='currentColor' cx='12' cy='12' r='10'></circle>
      <path
        d='M9.707 11.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 10-1.414-1.414L11 12.586l-1.293-1.293z'
        fill='inherit'></path>
    </g>
  </svg>
);

const BuildStatus = ({ val }: IProps) => {
  return <div>{val.buildStatus === 'success' && approvedSvg}</div>;
};

// TODO: configurable columns

const imgSize = '24px';
const Reviewers = ({ val }: IProps) => {
  const reviewers = val.participants
    .filter((p) => p.role === 'REVIEWER')
    .sort((a, b) => {
      if (a.approved === b.approved) {
        return a.user.display_name.localeCompare(b.user.display_name);
      }
      return a.approved ? -1 : 1;
    });
  return (
    <div style={{ position: 'relative' }}>
      {reviewers.map((reviewer, index) => (
        <div
          className={'reviewerAvatar'}
          key={reviewer.user.uuid}
          style={{ left: `${(index ?? 0) * 15}px` }}>
          <img
            style={{
              clipPath: 'circle()',
              height: imgSize,
              width: imgSize,
              border: '1px solid black',
              borderRadius: '12px',
            }}
            src={reviewer.user.links.avatar.href}
            alt={reviewer.user.display_name}
          />
          {reviewer.approved && (
            <span style={{ position: 'absolute', left: '-5px', bottom: '-5px' }}>{approvedSvg}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const LastActivity = ({ val }: IProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '.9em' }}>{formatDate(val.updated_on)}</div>
      <div style={{ fontSize: '.7em' }}>Open for {msToTime(Date.now() - new Date(val.created_on).getTime())}</div>
    </div>
  );
};

interface IProps {
  val: IRow;
  index?: number;
}

const Row = ({ val, index }: IProps) => {
  return (
    <div
      style={{
        backgroundColor: `${(index ?? 0) % 2 === 0 ? 'rgba(236, 240, 241, .6)' : 'inherit'}`,
        display: 'flex',
        justifyContent: 'space-around',
      }}>
      {columns.map((col) => (
        <div
          key={col.label}
          style={{
            padding: '4px 8px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
          className={col.colClass}>
          {(col.getRendered ?? col.getValue)(val)}
        </div>
      ))}
    </div>
  );
};

export default Row;
