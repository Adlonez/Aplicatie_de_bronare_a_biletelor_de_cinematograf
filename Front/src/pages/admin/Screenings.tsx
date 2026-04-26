import { useCallback, useEffect, useState, type FC, type Key } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Space, message, Popconfirm, Tag, Popover, Tooltip, Typography, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, EyeOutlined, InfoCircleOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnType, TableProps } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axiosInstance';
import SeatMapModal from '../../components/admin/SeatMapModal';
import type { Screening, Booking, Hall, Films } from '../../types/ui';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type ScreeningFormValues = {
  movieId: number;
  hall: string;
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
};

type ScreeningPayload = {
  movieId: number;
  movieTitle: string;
  hall: string;
  date: string;
  time: string;
};

type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

type ScreeningFilters = {
  search?: string;
  halls?: string[];
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
};

type ScreeningSort = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

const getListData = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const paged = payload as Partial<PagedResult<T>> | undefined;
  return paged?.items ?? [];
};

const encodeDateRange = (dateRange?: ScreeningFilters['dateRange']) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return undefined;
  return `${dateRange[0].format('YYYY-MM-DD')}|${dateRange[1].format('YYYY-MM-DD')}`;
};

const decodeDateRange = (value?: Key | boolean): ScreeningFilters['dateRange'] => {
  if (typeof value !== 'string') return null;
  const [start, end] = value.split('|');
  return start && end ? [dayjs(start), dayjs(end)] : null;
};

const encodeTimeRange = (timeRange?: ScreeningFilters['timeRange']) => {
  if (!timeRange?.[0] || !timeRange?.[1]) return undefined;
  return `${timeRange[0].format('HH:mm')}|${timeRange[1].format('HH:mm')}`;
};

const decodeTimeRange = (value?: Key | boolean): ScreeningFilters['timeRange'] => {
  if (typeof value !== 'string') return null;
  const [start, end] = value.split('|');
  return start && end ? [dayjs(start, 'HH:mm'), dayjs(end, 'HH:mm')] : null;
};

const FilterButtons = ({ confirm, clearFilters, hasFilter }: { confirm: () => void; clearFilters?: () => void; hasFilter: boolean }) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
    <Button onClick={() => { clearFilters?.(); confirm(); }} size="small" style={{ width: 90 }} disabled={!hasFilter}>Reset</Button>
    <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>OK</Button>
  </Space>
);

const Screenings: FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Films[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [editing, setEditing] = useState<Screening | null>(null);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<ScreeningFilters>({});
  const [sort, setSort] = useState<ScreeningSort>({});
  const [form] = Form.useForm();
  const [tableKey, setTableKey] = useState(0);

  const loadScreeningData = useCallback(async (
    pageNumber: number,
    pageSize: number,
    nextFilters: ScreeningFilters,
    nextSort: ScreeningSort,
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      });
      if (nextFilters.search) params.set('search', nextFilters.search);
      nextFilters.halls?.forEach((hall) => params.append('halls', hall));
      if (nextFilters.dateRange?.[0]) params.set('dateFrom', nextFilters.dateRange[0].format('YYYY-MM-DD'));
      if (nextFilters.dateRange?.[1]) params.set('dateTo', nextFilters.dateRange[1].format('YYYY-MM-DD'));
      if (nextFilters.timeRange?.[0]) params.set('timeFrom', nextFilters.timeRange[0].format('HH:mm'));
      if (nextFilters.timeRange?.[1]) params.set('timeTo', nextFilters.timeRange[1].format('HH:mm'));
      if (nextSort.sortBy) params.set('sortBy', nextSort.sortBy);
      if (nextSort.sortDirection) params.set('sortDirection', nextSort.sortDirection);

      const [screeningsRes, filmsRes, hallsRes, bookingsRes] = await Promise.all([
        axiosInstance.get('/api/screenings/list', { params }),
        axiosInstance.get('/api/films/list'),
        axiosInstance.get('/api/halls/list'),
        axiosInstance.get('/api/bookings/list'),
      ]);

      const screeningsResult = screeningsRes.data?.data as PagedResult<Screening> | Screening[] | undefined;

      if (Array.isArray(screeningsResult)) {
        setScreenings(screeningsResult);
        setPagination((prev) => ({ ...prev, current: 1, total: screeningsResult.length }));
      } else {
        setScreenings(screeningsResult?.items ?? []);
        setPagination({
          current: screeningsResult?.pageNumber ?? pageNumber,
          pageSize: screeningsResult?.pageSize ?? pageSize,
          total: screeningsResult?.totalCount ?? 0,
        });
      }

      setMovies(getListData<Films>(filmsRes.data?.data));
      setHalls(getListData<Hall>(hallsRes.data?.data));
      setBookings(getListData<Booking>(bookingsRes.data?.data));
    } catch {
      setScreenings([]);
      setMovies([]);
      setHalls([]);
      setBookings([]);
      message.error('Unable to load screenings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScreeningData(1, 10, {}, {});
  }, [loadScreeningData]);

  const resetFilters = async () => {
    const emptyFilters: ScreeningFilters = {};
    const emptySort: ScreeningSort = {};
    setFilters(emptyFilters);
    setSort(emptySort);
    setTableKey(k => k + 1);
    await loadScreeningData(1, pagination.pageSize, emptyFilters, emptySort);
  };

  const openModal = (screening?: Screening) => {
    setEditing(screening || null);
    if (screening) {
      form.setFieldsValue({
        movieId: screening.movieId,
        hall: screening.hall,
        date: dayjs(screening.date),
        time: dayjs(screening.time, 'HH:mm'),
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const saveScreening = async () => {
    try {
      const values = await form.validateFields() as ScreeningFormValues;
      const movie = movies.find((m) => m.id === values.movieId);
      const dateStr = values.date.format('YYYY-MM-DD');
      const timeStr = values.time.format('HH:mm');
      const payload: ScreeningPayload = {
        movieId: values.movieId,
        movieTitle: movie?.title || '',
        hall: values.hall,
        date: dateStr,
        time: timeStr,
      };

      const conflict = screenings.find(
        (s) => !s.deleted && s.id !== editing?.id && s.hall === payload.hall && s.date === payload.date && s.time === payload.time,
      );

      const doSave = async () => {
        try {
          setSaving(true);
          if (editing) {
            await axiosInstance.put(`/api/screenings/${editing.id}`, payload);
            message.success('Screening updated');
          } else {
            await axiosInstance.post('/api/screenings/create', payload);
            message.success('Screening added');
          }
          setModalOpen(false);
          form.resetFields();
          await loadScreeningData(pagination.current, pagination.pageSize, filters, sort);
        } catch {
          message.error('Unable to save screening');
        } finally {
          setSaving(false);
        }
      };

      if (conflict) {
        Modal.confirm({
          title: 'Schedule Conflict',
          content: `"${conflict.movieTitle}" is already scheduled in ${payload.hall} at ${payload.time} on ${payload.date}. Save anyway?`,
          okText: 'Save Anyway',
          okType: 'danger',
          onOk: doSave,
        });
      } else {
        await doSave();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error('Unable to save screening');
    }
  };

  const deleteScreening = (id: number) => {
    const screening = screenings.find((s) => s.id === id);
    if (!screening) return;

    const activeBookings = bookings.filter(
      (b) => !b.deleted && b.movieTitle === screening.movieTitle && b.hall === screening.hall && b.showtime === `${screening.date} ${screening.time}`,
    );

    const doDelete = async () => {
      try {
        setLoading(true);
        await axiosInstance.delete(`/api/screenings/${id}`);
        message.success('Screening deleted');
        await loadScreeningData(pagination.current, pagination.pageSize, filters, sort);
      } catch {
        message.error('Unable to delete screening');
      } finally {
        setLoading(false);
      }
    };

    if (activeBookings.length > 0) {
      Modal.confirm({
        title: 'Active Bookings Found',
        content: `This screening has ${activeBookings.length} active booking(s). Deleting will not cancel them. Continue?`,
        okText: 'Delete Anyway',
        okType: 'danger',
        onOk: doDelete,
      });
    } else {
      doDelete();
    }
  };

  const columns: ColumnType<Screening>[] = [
    {
      title: 'Image',
      key: 'image',
      width: 100,
      render: (_: unknown, s: Screening) => {
        const movie = movies.find(m => m.title === s.movieTitle);
        if (movie?.image) {
          return <img src={movie.image} alt={s.movieTitle} style={{ width: 60, height: 80, objectFit: 'cover' }} />;
        }
        return <div style={{ width: 60, height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>;
      }
    },
    {
      title: 'Title',
      dataIndex: 'movieTitle',
      filteredValue: filters.search ? [filters.search] : null,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <Input
            autoFocus
            placeholder="Search title"
            value={selectedKeys[0] as string}
            onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 200, marginBottom: 8, display: 'block' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      render: (text: string, s: Screening) => (
        <Space>
          <Tooltip title={text}>
            <div style={{ minWidth: 120 }}>{text}</div>
          </Tooltip>
          {s.deleted && <Tag color="red">Deleted</Tag>}
        </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: true,
      filteredValue: encodeDateRange(filters.dateRange) ? [encodeDateRange(filters.dateRange) as string] : null,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <RangePicker
            value={decodeDateRange(selectedKeys[0])}
            onChange={(dateRange) => {
              const encoded = encodeDateRange(dateRange as ScreeningFilters['dateRange']);
              setSelectedKeys(encoded ? [encoded] : []);
            }}
            style={{ marginBottom: 8, display: 'flex' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      sorter: true,
      filteredValue: encodeTimeRange(filters.timeRange) ? [encodeTimeRange(filters.timeRange) as string] : null,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <TimePicker.RangePicker
            format="HH:mm"
            minuteStep={5}
            value={decodeTimeRange(selectedKeys[0])}
            onChange={(timeRange) => {
              const encoded = encodeTimeRange(timeRange as ScreeningFilters['timeRange']);
              setSelectedKeys(encoded ? [encoded] : []);
            }}
            style={{ marginBottom: 8, display: 'flex' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
    },
    {
      title: 'Hall',
      dataIndex: 'hall',
      render: (hall: string) => <Tag color="blue">{hall}</Tag>,
      filteredValue: filters.halls ?? null,
      filters: halls.map((h) => ({ text: h.name, value: h.name })),
      filterMultiple: true,
    },
    {
      title: 'Actions',
      fixed: 'end',
      width: '150px',
      render: (_: unknown, s: Screening) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => { setSelectedScreening(s); setSeatMapOpen(true); }} disabled={s.deleted}>Seats</Button>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openModal(s)} disabled={s.deleted}>Edit</Button>
          <Popconfirm title="Delete this screening?" onConfirm={() => deleteScreening(s.id)} okText="Yes" cancelText="No" disabled={s.deleted}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" disabled={s.deleted}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const visibleScreenings = screenings;

  const handleTableChange: TableProps<Screening>['onChange'] = async (nextPagination, tableFilters, sorter) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const nextSort: ScreeningSort = activeSorter?.order
      ? {
          sortBy: String(activeSorter.field),
          sortDirection: activeSorter.order === 'descend' ? 'desc' : 'asc',
        }
      : {};
    const nextFilters: ScreeningFilters = {
      search: typeof tableFilters.movieTitle?.[0] === 'string' ? tableFilters.movieTitle[0] : undefined,
      halls: tableFilters.hall?.map(String),
      dateRange: decodeDateRange(tableFilters.date?.[0]),
      timeRange: decodeTimeRange(tableFilters.time?.[0]),
    };

    setFilters(nextFilters);
    setSort(nextSort);
    await loadScreeningData(nextPagination.current ?? 1, nextPagination.pageSize ?? 10, nextFilters, nextSort);
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'scroll' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><CalendarOutlined /> Screening Schedule</Title>
        <Space>
          <Button icon={<ClearOutlined />} onClick={resetFilters}>Reset All Filters</Button>
          <Popover
            title="Available Halls"
            content={
              <Space orientation="vertical">
                {halls.map((h) => (
                  <Tag key={h.id} color="blue">{h.name} - Capacity: {h.capacity} - {h.features.join(', ')}</Tag>
                ))}
              </Space>
            }
          >
            <Button icon={<InfoCircleOutlined />}>Halls Info</Button>
          </Popover>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Add Screening</Button>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'scroll' }}>
        <Table
          key={tableKey}
          dataSource={visibleScreenings}
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

      {/* Screening Form Modal */}
      <Modal title={editing ? 'Edit Screening' : 'Add Screening'} open={modalOpen} onOk={saveScreening} confirmLoading={saving} onCancel={() => setModalOpen(false)} width={500}>
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="movieId" label="Movie" rules={[{ required: true, message: 'Select movie' }]}>
                <Select placeholder="Select movie" options={movies.map((m) => ({ value: m.id, label: m.title }))} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="hall" label="Hall" rules={[{ required: true, message: 'Select hall' }]}>
                <Select placeholder="Select hall" options={halls.map((h) => ({ value: h.name, label: `${h.name} (${h.capacity})` }))} />
              </Form.Item>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Select date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Select time' }]}>
                <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Seat Map + Booking Modal */}
      <SeatMapModal
        screening={selectedScreening}
        halls={halls}
        bookings={bookings}
        onBookingsChange={setBookings}
        open={seatMapOpen}
        onClose={() => setSeatMapOpen(false)}
      />
    </div>
  );
};

export default Screenings;
