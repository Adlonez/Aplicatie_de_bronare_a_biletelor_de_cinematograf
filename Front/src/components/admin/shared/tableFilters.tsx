import { Button, DatePicker, Input, Slider, Space, TimePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

// Reusable filter/reset button row
const FilterButtons = ({ confirm, clearFilters }: { confirm: () => void; clearFilters?: () => void }) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
    <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>Filter</Button>
    <Button onClick={() => { clearFilters?.(); confirm(); }} size="small" style={{ width: 90 }}>Reset</Button>
  </Space>
);

/** Date range column filter. Pass a function that extracts the date string from the record. */
export function dateRangeFilter<T>(getDate: (record: T) => string) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <DatePicker.RangePicker
          popupClassName="single-month-range-picker"
          value={selectedKeys[0] as any}
          onChange={(dates) => setSelectedKeys(dates ? [dates as any] : [])}
          style={{ marginBottom: 8, display: 'flex' }}
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} />
      </div>
    ),
    onFilter: (value: any, record: T) => {
      const [start, end] = value as any;
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
          value={selectedKeys[0] as any}
          onChange={(times) => setSelectedKeys(times ? [times as any] : [])}
          style={{ marginBottom: 8, display: 'flex' }}
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} />
      </div>
    ),
    onFilter: (value: any, record: T) => {
      const [start, end] = value as any;
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
          onChange={(val) => setSelectedKeys([val as any])}
        />
        <FilterButtons confirm={confirm} clearFilters={clearFilters} />
      </div>
    ),
    onFilter: (value: any, record: T) => {
      const [lo, hi] = value as [number, number];
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
        <FilterButtons confirm={confirm} clearFilters={clearFilters} />
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value: any, record: T) => getText(record).toLowerCase().includes((value as string).toLowerCase()),
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
