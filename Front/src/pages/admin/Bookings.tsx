import { useCallback, useEffect, useState, type FC, type Key } from 'react';
import { Table, Button, Tag, message, Space, Popover, Tooltip, Popconfirm, Typography, Select, Input, DatePicker, TimePicker, InputNumber } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, BookOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnType, TableProps } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import axiosInstance, { getErrorMessage } from '../../api/axiosInstance';
import type { Booking, Hall } from '../../types/ui';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

type BookingFilters = {
  movieTitle?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  halls?: string[];
  seats?: string;
  statuses?: Booking['status'][];
  showtimeDateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  showtimeTimeRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  minPrice?: number;
  maxPrice?: number;
};

type BookingSort = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

const statusColor = (status: string) => (status === 'bought' ? 'red' : 'orange');

const getListData = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const paged = payload as Partial<PagedResult<T>> | undefined;
  return paged?.items ?? [];
};

const encodeDateRange = (dateRange?: BookingFilters['showtimeDateRange']) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return undefined;
  return `${dateRange[0].format('YYYY-MM-DD')}|${dateRange[1].format('YYYY-MM-DD')}`;
};

const decodeDateRange = (value?: Key | boolean): BookingFilters['showtimeDateRange'] => {
  if (typeof value !== 'string') return null;
  const [start, end] = value.split('|');
  return start && end ? [dayjs(start), dayjs(end)] : null;
};

const encodeTimeRange = (timeRange?: BookingFilters['showtimeTimeRange']) => {
  if (!timeRange?.[0] || !timeRange?.[1]) return undefined;
  return `${timeRange[0].format('HH:mm')}|${timeRange[1].format('HH:mm')}`;
};

const decodeTimeRange = (value?: Key | boolean): BookingFilters['showtimeTimeRange'] => {
  if (typeof value !== 'string') return null;
  const [start, end] = value.split('|');
  return start && end ? [dayjs(start, 'HH:mm'), dayjs(end, 'HH:mm')] : null;
};

const encodePriceRange = (minPrice?: number, maxPrice?: number) => {
  if (minPrice == null && maxPrice == null) return undefined;
  return `${minPrice ?? ''}|${maxPrice ?? ''}`;
};

const decodePriceRange = (value?: Key | boolean) => {
  if (typeof value !== 'string') return {};
  const [minPrice, maxPrice] = value.split('|');
  return {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };
};

const showtimeDate = (showtime: string) => showtime?.split(' ')[0] ?? '';
const showtimeTime = (showtime: string) => showtime?.split(' ')[1] ?? '';

const isDateInRange = (value: string, dateRange?: BookingFilters['showtimeDateRange']) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return true;
  const current = dayjs(value);
  return (
    (current.isAfter(dateRange[0], 'day') || current.isSame(dateRange[0], 'day')) &&
    (current.isBefore(dateRange[1], 'day') || current.isSame(dateRange[1], 'day'))
  );
};

const isTimeInRange = (value: string, timeRange?: BookingFilters['showtimeTimeRange']) => {
  if (!timeRange?.[0] || !timeRange?.[1]) return true;
  const current = dayjs(value, 'HH:mm');
  return (
    (current.isAfter(timeRange[0]) || current.isSame(timeRange[0])) &&
    (current.isBefore(timeRange[1]) || current.isSame(timeRange[1]))
  );
};

const includesText = (value: string | undefined, search: string | undefined) =>
  !search || (value ?? '').toLowerCase().includes(search.toLowerCase());

const FilterButtons = ({ confirm, clearFilters, hasFilter }: { confirm: () => void; clearFilters?: () => void; hasFilter: boolean }) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
    <Button onClick={() => { clearFilters?.(); confirm(); }} size="small" style={{ width: 90 }} disabled={!hasFilter}>Reset</Button>
    <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>OK</Button>
  </Space>
);

const textColumnSearch = (placeholder: string): Pick<ColumnType<Booking>, 'filterDropdown' | 'filterIcon'> => ({
  filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Input
        autoFocus
        placeholder={placeholder}
        value={selectedKeys[0] as string}
        onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ width: 200, marginBottom: 8, display: 'block' }}
      />
      <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
    </div>
  ),
  filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
});

const Bookings: FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<BookingFilters>({});
  const [sort, setSort] = useState<BookingSort>({});
  const [tableKey, setTableKey] = useState(0);

  const loadBookingData = useCallback(async (
    pageNumber: number,
    pageSize: number,
    nextFilters: BookingFilters,
    nextSort: BookingSort,
  ) => {
    try {
      setLoading(true);
      const firstSearch = nextFilters.movieTitle || nextFilters.customerName || nextFilters.customerEmail || nextFilters.customerPhone || undefined;
      const params = {
        pageNumber,
        pageSize,
        search: firstSearch,
        hall: nextFilters.halls?.length === 1 ? nextFilters.halls[0] : undefined,
        status: nextFilters.statuses?.length === 1 ? nextFilters.statuses[0] : undefined,
        minPrice: nextFilters.minPrice,
        maxPrice: nextFilters.maxPrice,
        sortBy: nextSort.sortBy,
        sortDirection: nextSort.sortDirection,
      };

      const [bookingsRes, hallsRes] = await Promise.all([
        axiosInstance.get('/api/bookings/list', { params }),
        axiosInstance.get('/api/halls/list'),
      ]);

      const bookingsResult = bookingsRes.data?.data as PagedResult<Booking> | Booking[] | undefined;
      if (Array.isArray(bookingsResult)) {
        setBookings(bookingsResult);
        setPagination((prev) => ({ ...prev, current: 1, total: bookingsResult.length }));
      } else {
        setBookings(bookingsResult?.items ?? []);
        setPagination({
          current: bookingsResult?.pageNumber ?? pageNumber,
          pageSize: bookingsResult?.pageSize ?? pageSize,
          total: bookingsResult?.totalCount ?? 0,
        });
      }

      setHalls(getListData<Hall>(hallsRes.data?.data));
    } catch (err) {
      setBookings([]);
      setHalls([]);
      message.error(getErrorMessage(err, 'Unable to load bookings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookingData(1, 10, {}, {});
  }, [loadBookingData]);

  const resetFilters = async () => {
    const emptyFilters: BookingFilters = {};
    const emptySort: BookingSort = {};
    setFilters(emptyFilters);
    setSort(emptySort);
    setTableKey(k => k + 1);
    await loadBookingData(1, pagination.pageSize, emptyFilters, emptySort);
  };

  const changeBookingStatus = async (id: number, status: Booking['status']) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/bookings/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.success('Booking status updated');
      await loadBookingData(pagination.current, pagination.pageSize, filters, sort);
    } catch (err) {
      message.error(getErrorMessage(err, 'Unable to update booking status'));
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id: number) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/bookings/${id}`);
      message.success('Booking deleted');
      await loadBookingData(pagination.current, pagination.pageSize, filters, sort);
    } catch (err) {
      message.error(getErrorMessage(err, 'Unable to delete booking'));
    } finally {
      setLoading(false);
    }
  };

  const visibleBookings = bookings.filter((booking) => {
    const matchesText =
      includesText(booking.movieTitle, filters.movieTitle) &&
      includesText(booking.customerName, filters.customerName) &&
      includesText(booking.customerEmail, filters.customerEmail) &&
      includesText(booking.customerPhone, filters.customerPhone);
    const matchesHall = !filters.halls?.length || filters.halls.includes(booking.hall);
    const matchesSeats = !filters.seats || booking.seats.some((seat) => seat.toLowerCase().includes(filters.seats!.toLowerCase()));
    const matchesStatus = !filters.statuses?.length || filters.statuses.includes(booking.status);
    const matchesShowtimeDate = isDateInRange(showtimeDate(booking.showtime), filters.showtimeDateRange);
    const matchesShowtimeTime = isTimeInRange(showtimeTime(booking.showtime), filters.showtimeTimeRange);
    const matchesPrice =
      (filters.minPrice == null || booking.totalPrice >= filters.minPrice) &&
      (filters.maxPrice == null || booking.totalPrice <= filters.maxPrice);

    return matchesText && matchesHall && matchesSeats && matchesStatus && matchesShowtimeDate && matchesShowtimeTime && matchesPrice;
  });

  const columns: ColumnType<Booking>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'start',
      width: 80,
      sorter: true,
    },
    {
      title: 'Title',
      dataIndex: 'movieTitle',
      sorter: true,
      filteredValue: filters.movieTitle ? [filters.movieTitle] : null,
      ...textColumnSearch('Search title'),
      render: (text: string, b: Booking) => (
        <Space>
          <Tooltip title={text}>
            <div style={{ minWidth: 120 }}>{text}</div>
          </Tooltip>
          {b.deleted && <Tag color="red">Cancelled</Tag>}
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'customerName',
      sorter: true,
      filteredValue: filters.customerName ? [filters.customerName] : null,
      ...textColumnSearch('Search name'),
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      sorter: true,
      filteredValue: filters.customerEmail ? [filters.customerEmail] : null,
      ...textColumnSearch('Search email'),
    },
    {
      title: 'Phone',
      dataIndex: 'customerPhone',
      sorter: true,
      filteredValue: filters.customerPhone ? [filters.customerPhone] : null,
      ...textColumnSearch('Search phone'),
    },
    {
      title: 'Hall',
      dataIndex: 'hall',
      sorter: true,
      filteredValue: filters.halls ?? null,
      filters: halls.map((h) => ({ text: h.name, value: h.name })),
      filterMultiple: true,
      render: (hall: string) => <Tag color="blue">{hall}</Tag>,
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      filteredValue: filters.seats ? [filters.seats] : null,
      ...textColumnSearch('Search seat'),
      render: (seats: string[]) => seats.join(', '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filteredValue: filters.statuses ?? null,
      render: (status: string) => <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>,
      filters: [{ text: 'Bought', value: 'bought' }, { text: 'Booked', value: 'booked' }],
      filterMultiple: true,
    },
    {
      title: 'Showtime Date',
      key: 'showtimeDate',
      dataIndex: 'showtime',
      filteredValue: encodeDateRange(filters.showtimeDateRange) ? [encodeDateRange(filters.showtimeDateRange) as string] : null,
      render: (s: string) => showtimeDate(s),
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <RangePicker
            value={decodeDateRange(selectedKeys[0])}
            onChange={(dateRange) => {
              const encoded = encodeDateRange(dateRange as BookingFilters['showtimeDateRange']);
              setSelectedKeys(encoded ? [encoded] : []);
            }}
            style={{ marginBottom: 8, display: 'flex' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
    },
    {
      title: 'Showtime Time',
      key: 'showtimeTime',
      dataIndex: 'showtime',
      filteredValue: encodeTimeRange(filters.showtimeTimeRange) ? [encodeTimeRange(filters.showtimeTimeRange) as string] : null,
      render: (s: string) => showtimeTime(s),
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <TimePicker.RangePicker
            format="HH:mm"
            minuteStep={5}
            value={decodeTimeRange(selectedKeys[0])}
            onChange={(timeRange) => {
              const encoded = encodeTimeRange(timeRange as BookingFilters['showtimeTimeRange']);
              setSelectedKeys(encoded ? [encoded] : []);
            }}
            style={{ marginBottom: 8, display: 'flex' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      sorter: true,
      filteredValue: encodePriceRange(filters.minPrice, filters.maxPrice) ? [encodePriceRange(filters.minPrice, filters.maxPrice) as string] : null,
      render: (price: number) => `$${price.toFixed(2)}`,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
        const { minPrice, maxPrice } = decodePriceRange(selectedKeys[0]);
        const updateKeys = (nextMin?: number, nextMax?: number) => {
          const encoded = encodePriceRange(nextMin, nextMax);
          setSelectedKeys(encoded ? [encoded] : []);
        };

        return (
          <div style={{ padding: 8, width: 220 }} onKeyDown={(event) => event.stopPropagation()}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber min={0} placeholder="Min price" value={minPrice} onChange={(value) => updateKeys(value ?? undefined, maxPrice)} style={{ width: '100%' }} />
              <InputNumber min={0} placeholder="Max price" value={maxPrice} onChange={(value) => updateKeys(minPrice, value ?? undefined)} style={{ width: '100%' }} />
            </Space>
            <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
          </div>
        );
      },
    },
    {
      title: 'Actions',
      fixed: 'end',
      render: (_: unknown, b: Booking) => (
        <Space>
          <Select
            value={b.status}
            size="small"
            style={{ width: 112 }}
            disabled={b.deleted}
            options={[{ value: 'booked', label: 'Booked' }, { value: 'bought', label: 'Bought' }]}
            onChange={(status) => changeBookingStatus(b.id, status)}
          />
          <Popconfirm title="Delete this booking?" onConfirm={() => deleteBooking(b.id)} okText="Yes" cancelText="No" disabled={b.deleted}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" disabled={b.deleted}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange: TableProps<Booking>['onChange'] = async (nextPagination, tableFilters, sorter) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const nextSort: BookingSort = activeSorter?.order
      ? {
          sortBy: String(activeSorter.field),
          sortDirection: activeSorter.order === 'descend' ? 'desc' : 'asc',
        }
      : {};
    const priceRange = decodePriceRange(tableFilters.totalPrice?.[0]);
    const nextFilters: BookingFilters = {
      movieTitle: typeof tableFilters.movieTitle?.[0] === 'string' ? tableFilters.movieTitle[0] : undefined,
      customerName: typeof tableFilters.customerName?.[0] === 'string' ? tableFilters.customerName[0] : undefined,
      customerEmail: typeof tableFilters.customerEmail?.[0] === 'string' ? tableFilters.customerEmail[0] : undefined,
      customerPhone: typeof tableFilters.customerPhone?.[0] === 'string' ? tableFilters.customerPhone[0] : undefined,
      halls: tableFilters.hall?.map(String),
      seats: typeof tableFilters.seats?.[0] === 'string' ? tableFilters.seats[0] : undefined,
      statuses: tableFilters.status?.map((status) => String(status) as Booking['status']),
      showtimeDateRange: decodeDateRange(tableFilters.showtimeDate?.[0]),
      showtimeTimeRange: decodeTimeRange(tableFilters.showtimeTime?.[0]),
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
    };

    setFilters(nextFilters);
    setSort(nextSort);
    await loadBookingData(nextPagination.current ?? 1, nextPagination.pageSize ?? 10, nextFilters, nextSort);
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'scroll' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><BookOutlined /> Booking & Ticket Management</Title>
        <Space>
          <Button icon={<ClearOutlined />} onClick={resetFilters}>Reset All Filters</Button>
          <Popover
            title="Status Legend"
            content={
              <Space direction="vertical">
                <div><Tag color="red">BOUGHT</Tag> = Paid</div>
                <div><Tag color="orange">BOOKED</Tag> = Reserved</div>
              </Space>
            }
          >
            <Button icon={<InfoCircleOutlined />}>Status Info</Button>
          </Popover>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'scroll' }}>
        <Table
          key={tableKey}
          dataSource={visibleBookings}
          columns={columns}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
};

export default Bookings;
