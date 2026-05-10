/* eslint-disable react-refresh/only-export-components */
import { Button, DatePicker, Input, Slider, Space, TimePicker, Divider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { Key } from 'react';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

// Reusable filter/reset button row
const FilterButtons = ({ confirm, clearFilters, hasFilter }: { confirm: () => void; clearFilters?: () => void; hasFilter?: boolean }) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
    <Button onClick={() => { clearFilters?.(); confirm(); }} size="small" style={{ width: 90 }} disabled={!hasFilter}>Reset</Button>
    <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>OK</Button>
  </Space>
);

/** Date range column filter. Pass a function that extracts the date string from the record. */
export function dateRangeFilter<T>(getDate: (record: T) => string) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <DatePicker.RangePicker
          popupClassName="single-month-range-picker"
          value={selectedKeys[0] as unknown as [Dayjs, Dayjs] | null}
          onChange={(dates) => setSelectedKeys(dates ? [dates as unknown as Key] : [])}
          style={{ marginBottom: 8, display: 'flex' }}
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
      </div>
    ),
    onFilter: (value: boolean | Key, record: T) => {
      const [start, end] = value as unknown as [Dayjs, Dayjs];
      if (!start || !end) return true;
      return dayjs(getDate(record)).isBetween(start, end, 'day', '[]');
    },
  };
}

/** Time range column filter. Pass a function that extracts the time string (HH:mm) from the record. */
export function timeRangeFilter<T>(getTime: (record: T) => string) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <TimePicker.RangePicker
          format="HH:mm"
          minuteStep={5}
          value={selectedKeys[0] as unknown as [Dayjs, Dayjs] | null}
          onChange={(times) => setSelectedKeys(times ? [times as unknown as Key] : [])}
          style={{ marginBottom: 8, display: 'flex' }}
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
      </div>
    ),
    onFilter: (value: boolean | Key, record: T) => {
      const [start, end] = value as unknown as [Dayjs, Dayjs];
      if (!start || !end) return true;
      return dayjs(getTime(record), 'HH:mm').isBetween(start, end, 'minute', '[]');
    },
  };
}

/** Numeric slider range column filter. */
export function sliderRangeFilter<T>(getVal: (record: T) => number, min: number, max: number) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8, width: 250 }} onKeyDown={(e) => e.stopPropagation()}>
        <Slider
          range
          min={min}
          max={max}
          value={(selectedKeys[0] as unknown as [number, number]) || [min, max]}
          onChange={(val) => setSelectedKeys([val as unknown as Key])}
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
      </div>
    ),
    onFilter: (value: boolean | Key, record: T) => {
      const [lo, hi] = value as unknown as [number, number];
      const v = getVal(record);
      return v >= lo && v <= hi;
    },
  };
}

/** Text search column filter. */
export function textSearchFilter<T>(getText: (record: T) => string) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          value={selectedKeys[0] as string}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
          placeholder="Search..."
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value: boolean | Key, record: T) => getText(record).toLowerCase().includes((value as string).toLowerCase()),
  };
}

/** Seats search + quantity column filter. */
export function seatsFilter<T>(getSeats: (record: T) => string[]) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
      const state = (selectedKeys[0] as { search?: string; range?: [number, number] }) || {};
      
      const updateState = (updates: Partial<typeof state>) => {
        const newState = { ...state, ...updates };
        if (!newState.search && (!newState.range || (newState.range[0] === 1 && newState.range[1] === 10))) {
          setSelectedKeys([]);
        } else {
          setSelectedKeys([newState as unknown as Key]);
        }
      };

      return (
        <div style={{ padding: 12, width: 250 }} onKeyDown={(e) => e.stopPropagation()}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Search Exact Seat</div>
            <Input
              value={state.search || ''}
              onChange={(e) => updateState({ search: e.target.value })}
              onPressEnter={() => confirm()}
              placeholder="e.g., A2 or D7"
            />
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Filter by Quantity</div>
            <Slider
              range
              min={1}
              max={10}
              value={state.range || [1, 10]}
              onChange={(val) => updateState({ range: val as [number, number] })}
            />
          </div>

          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      );
    },
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value: boolean | Key, record: T) => {
      const { search, range } = value as { search?: string; range?: [number, number] };
      const seats = getSeats(record);
      
      if (search && !seats.some((s) => s.toLowerCase().includes(search.toLowerCase()))) {
        return false;
      }
      
      if (range) {
        const [min, max] = range;
        if (seats.length < min || seats.length > max) {
          return false;
        }
      }
      
      return true;
    },
  };
}

/** Sort deleted items to the bottom. */
export function sortDeletedLast<T extends { deleted?: boolean }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    if (a.deleted && !b.deleted) return 1;
    if (!a.deleted && b.deleted) return -1;
    return 0;
  });
}
