import * as React from 'react';
import { FilterType } from '../filters';
import FilterDropdown from './FilterDropdown';

interface IProps {
  allBranches: string[];
  onFilterSelect: (newVal: string, filterType: FilterType) => void;
  onRefreshClick: () => void;
}

const taskOptions = [
  { label: 'Any tasks', value: 'any' },
  { label: 'Has open tasks', value: 'yes' },
  { label: 'No open tasks', value: 'no' },
];

const reviewOptions = [
  { label: 'All', value: 'any' },
  { label: 'I have approved', value: 'yes' },
  { label: 'I have not approved', value: 'no' },
];

const HeaderOptions = ({ allBranches, onFilterSelect, onRefreshClick }: IProps) => {
  const targets = allBranches.map((b) => ({ label: b, value: b }));
  targets.unshift({ label: 'All', value: 'any' });
  return (
    <div className={'header-options__root'}>
      <FilterDropdown
        label={'Target'}
        options={targets}
        onSelect={(newVal: string) => onFilterSelect(newVal, 'branch')}
      />
      <FilterDropdown
        label={'Open tasks'}
        options={taskOptions}
        onSelect={(newVal: string) => onFilterSelect(newVal, 'tasks')}
        width={'150px'}
      />
      <FilterDropdown
        label={'My approval'}
        options={reviewOptions}
        onSelect={(newVal: string) => onFilterSelect(newVal, 'needsReview')}
        width={'170px'}
      />
      <button className={'header-options__refresh'} onClick={() => onRefreshClick()} title={'Refresh'}>
        <span>&#8635;</span>
      </button>
    </div>
  );
};

export default HeaderOptions;