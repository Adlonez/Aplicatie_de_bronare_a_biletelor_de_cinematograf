import { useCallback, useEffect, useState, type FC, type Key } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm, Tag, Row, Col, Select, DatePicker, Switch, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnType, TableProps } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axiosInstance';
import type { Films } from '../../types/ui';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const req = (label: string) => [{ required: true, message: `Enter ${label.toLowerCase()}` }];

type MovieFormValues = Omit<Films, 'id' | 'genre' | 'releaseDate' | 'screeningPeriod'> & {
  genre?: string[];
  releaseDate?: dayjs.Dayjs;
  screeningStart?: dayjs.Dayjs;
  screeningEnd?: dayjs.Dayjs;
};

type FilmPayload = {
  title: string;
  poster: string;
  image: string;
  description: string;
  href: string;
  format: string;
  languages: string[];
  status: string;
  toptier: boolean;
  duration?: number;
  genre?: string;
  releaseDate?: string;
  screeningPeriodStart?: string;
  screeningPeriodEnd?: string;
};

type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

type MovieFilters = {
  search?: string;
  status?: Films['status'];
  format?: Films['format'];
  genre?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  minDuration?: number;
  maxDuration?: number;
};

type MovieSort = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

const encodeDateRange = (dateRange?: MovieFilters['dateRange']) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return undefined;
  return `${dateRange[0].format('YYYY-MM-DD')}|${dateRange[1].format('YYYY-MM-DD')}`;
};

const decodeDateRange = (value?: Key | boolean): MovieFilters['dateRange'] => {
  if (typeof value !== 'string') return null;
  const [start, end] = value.split('|');
  return start && end ? [dayjs(start), dayjs(end)] : null;
};

const encodeDurationRange = (minDuration?: number, maxDuration?: number) => {
  if (minDuration == null && maxDuration == null) return undefined;
  return `${minDuration ?? ''}|${maxDuration ?? ''}`;
};

const decodeDurationRange = (value?: Key | boolean) => {
  if (typeof value !== 'string') return {};
  const [minDuration, maxDuration] = value.split('|');
  return {
    minDuration: minDuration ? Number(minDuration) : undefined,
    maxDuration: maxDuration ? Number(maxDuration) : undefined,
  };
};

const FilterButtons = ({ confirm, clearFilters, hasFilter }: { confirm: () => void; clearFilters?: () => void; hasFilter: boolean }) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
    <Button onClick={() => { clearFilters?.(); confirm(); }} size="small" style={{ width: 90 }} disabled={!hasFilter}>Reset</Button>
    <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>OK</Button>
  </Space>
);

const toFilmPayload = (values: MovieFormValues): FilmPayload => ({
  title: values.title,
  poster: values.poster || '',
  image: values.image,
  description: values.description,
  href: values.href || '',
  format: values.format || '2D',
  languages: values.languages || [],
  status: values.status || 'progress',
  toptier: Boolean(values.toptier),
  duration: values.duration,
  genre: Array.isArray(values.genre) ? values.genre.join(', ') : values.genre,
  releaseDate: values.releaseDate ? dayjs(values.releaseDate).format('YYYY-MM-DD') : undefined,
  screeningPeriodStart: values.screeningStart ? dayjs(values.screeningStart).format('YYYY-MM-DD') : undefined,
  screeningPeriodEnd: values.screeningEnd ? dayjs(values.screeningEnd).format('YYYY-MM-DD') : undefined,
});

const Movies: FC = () => {
  const [movies, setMovies] = useState<Films[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Films | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<MovieFilters>({});
  const [sort, setSort] = useState<MovieSort>({});
  const [form] = Form.useForm();
  const [tableKey, setTableKey] = useState(0);

  const allGenres = Array.from(new Set(movies.flatMap(m => m.genre ? m.genre.split(', ') : []))).map(g => ({ label: g, value: g }));
  const dateFilterValue = encodeDateRange(filters.dateRange);
  const durationFilterValue = encodeDurationRange(filters.minDuration, filters.maxDuration);

  const loadMovies = useCallback(async (
    pageNumber: number,
    pageSize: number,
    nextFilters: MovieFilters,
    nextSort: MovieSort,
  ) => {
    try {
      setLoading(true);
      const params = {
        pageNumber,
        pageSize,
        search: nextFilters.search || undefined,
        status: nextFilters.status,
        format: nextFilters.format,
        genre: nextFilters.genre || undefined,
        dateFrom: nextFilters.dateRange?.[0]?.format('YYYY-MM-DD'),
        dateTo: nextFilters.dateRange?.[1]?.format('YYYY-MM-DD'),
        minDuration: nextFilters.minDuration,
        maxDuration: nextFilters.maxDuration,
        sortBy: nextSort.sortBy,
        sortDirection: nextSort.sortDirection,
      };

      const { data } = await axiosInstance.get('/api/films/list', { params });
      const result = data?.data as PagedResult<Films> | Films[] | undefined;

      if (Array.isArray(result)) {
        setMovies(result);
        setPagination((prev) => ({ ...prev, current: 1, total: result.length }));
        return;
      }

      setMovies(result?.items ?? []);
      setPagination({
        current: result?.pageNumber ?? pageNumber,
        pageSize: result?.pageSize ?? pageSize,
        total: result?.totalCount ?? 0,
      });
    } catch {
      setMovies([]);
      message.error('Unable to load movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies(1, 10, {}, {});
  }, [loadMovies]);

  const updateFilters = async (nextFilters: MovieFilters) => {
    setFilters(nextFilters);
    await loadMovies(1, pagination.pageSize, nextFilters, sort);
  };

  const resetFilters = async () => {
    const emptyFilters: MovieFilters = {};
    const emptySort: MovieSort = {};
    setFilters(emptyFilters);
    setSort(emptySort);
    setTableKey(k => k + 1);
    await loadMovies(1, pagination.pageSize, emptyFilters, emptySort);
  };

  const openModal = (movie?: Films) => {
    setEditing(movie || null);
    if (movie) {
      form.setFieldsValue({
        ...movie,
        genre: movie.genre ? movie.genre.split(', ') : [],
        releaseDate: movie.releaseDate ? dayjs(movie.releaseDate) : null,
        screeningStart: movie.screeningPeriod?.start ? dayjs(movie.screeningPeriod.start) : null,
        screeningEnd: movie.screeningPeriod?.end ? dayjs(movie.screeningPeriod.end) : null,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const saveMovie = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = toFilmPayload(values as MovieFormValues);
      if (editing) {
        await axiosInstance.put(`/api/films/${editing.id}`, payload);
        message.success('Movie updated');
      } else {
        await axiosInstance.post('/api/films/create', payload);
        message.success('Movie added');
      }
      setModalOpen(false);
      form.resetFields();
      await loadMovies(pagination.current, pagination.pageSize, filters, sort);
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error('Unable to save movie');
    } finally {
      setSaving(false);
    }
  };

  const deleteMovie = async (id: number) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/films/${id}`);
      message.success('Movie deleted');
      await loadMovies(pagination.current, pagination.pageSize, filters, sort);
    } catch {
      message.error('Unable to delete movie');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnType<Films>[] = [
    {
      title: 'Image',
      dataIndex: 'image',
      width: 100,
      render: (url: string, movie: Films) => (
        <img src={url} alt={movie.title} style={{ width: 60, height: 80, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: true,
      render: (text: string, movie: Films) => (
        <Space>
          <Tooltip title={text}>
            <div style={{ minWidth: 120 }}>{text}</div>
          </Tooltip>
          {movie.deleted && <Tag color="red">Deleted</Tag>}
        </Space>
      )
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      sorter: true,
    },
    {
      title: 'Duration (min)',
      dataIndex: 'duration',
      sorter: true,
      filteredValue: durationFilterValue ? [durationFilterValue] : null,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
        const { minDuration, maxDuration } = decodeDurationRange(selectedKeys[0]);

        const updateDurationKeys = (nextMin?: number, nextMax?: number) => {
          const encoded = encodeDurationRange(nextMin, nextMax);
          setSelectedKeys(encoded ? [encoded] : []);
        };

        return (
          <div style={{ padding: 8, width: 220 }} onKeyDown={(event) => event.stopPropagation()}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                min={1}
                placeholder="Min minutes"
                value={minDuration}
                onChange={(value) => updateDurationKeys(value ?? undefined, maxDuration)}
                style={{ width: '100%' }}
              />
              <InputNumber
                min={1}
                placeholder="Max minutes"
                value={maxDuration}
                onChange={(value) => updateDurationKeys(minDuration, value ?? undefined)}
                style={{ width: '100%' }}
              />
            </Space>
            <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
          </div>
        );
      },
    },
    {
      title: 'Release Date',
      dataIndex: 'releaseDate',
      sorter: true,
      filteredValue: dateFilterValue ? [dateFilterValue] : null,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <RangePicker
            value={decodeDateRange(selectedKeys[0])}
            onChange={(dateRange) => {
              const encoded = encodeDateRange(dateRange as MovieFilters['dateRange']);
              setSelectedKeys(encoded ? [encoded] : []);
            }}
            style={{ marginBottom: 8, display: 'flex' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
    },
    {
      title: 'Actions',
      fixed: 'end',
      render: (_: unknown, movie: Films) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openModal(movie)} disabled={movie.deleted}>
            Edit
          </Button>
          <Popconfirm title="Delete this movie?" onConfirm={() => deleteMovie(movie.id)} okText="Yes" cancelText="No" disabled={movie.deleted}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" disabled={movie.deleted}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange: TableProps<Films>['onChange'] = async (nextPagination, tableFilters, sorter) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const nextSort: MovieSort = activeSorter?.order
      ? {
          sortBy: String(activeSorter.field),
          sortDirection: activeSorter.order === 'descend' ? 'desc' : 'asc',
      }
      : {};
    const nextDateRange = decodeDateRange(tableFilters.releaseDate?.[0]);
    const nextDurationRange = decodeDurationRange(tableFilters.duration?.[0]);
    const nextFilters: MovieFilters = {
      ...filters,
      dateRange: nextDateRange,
      minDuration: nextDurationRange.minDuration,
      maxDuration: nextDurationRange.maxDuration,
    };

    setFilters(nextFilters);
    setSort(nextSort);
    await loadMovies(nextPagination.current ?? 1, nextPagination.pageSize ?? 10, nextFilters, nextSort);
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'scroll' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><VideoCameraOutlined /> Movie Management</Title>
        <Space>
          <Button icon={<ClearOutlined />} onClick={resetFilters}>Reset All Filters</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Add Movie</Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8} lg={6}>
          <Input.Search
            allowClear
            placeholder="Search title, genre, description"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            onSearch={(value) => updateFilters({ ...filters, search: value || undefined })}
          />
        </Col>
        <Col xs={12} md={4} lg={3}>
          <Select
            allowClear
            placeholder="Status"
            value={filters.status}
            onChange={(status) => updateFilters({ ...filters, status })}
            options={[{ value: 'progress', label: 'In Progress' }, { value: 'soon', label: 'Coming Soon' }]}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={12} md={4} lg={3}>
          <Select
            allowClear
            placeholder="Format"
            value={filters.format}
            onChange={(format) => updateFilters({ ...filters, format })}
            options={[{ value: '2D', label: '2D' }, { value: '3D', label: '3D' }]}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} md={8} lg={4}>
          <Input
            allowClear
            placeholder="Genre"
            value={filters.genre}
            onChange={(event) => setFilters((current) => ({ ...current, genre: event.target.value }))}
            onPressEnter={() => updateFilters(filters)}
            onBlur={() => updateFilters(filters)}
          />
        </Col>
      </Row>

      <div style={{ flex: 1, overflow: 'scroll' }}>
        <Table
          key={tableKey}
          dataSource={movies}
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

      <Modal title={editing ? 'Edit Movie' : 'Add Movie'} open={modalOpen} onOk={saveMovie} confirmLoading={saving} onCancel={() => setModalOpen(false)} width={800}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Title" rules={req('Title')}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="genre" label="Genre" rules={req('Genre')}>
                <Select mode="multiple" options={allGenres} placeholder="Select genres" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="duration" label="Duration (min)" rules={req('Duration')}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="format" label="Format">
                <Select options={[{ value: '2D', label: '2D' }, { value: '3D', label: '3D' }]} placeholder="Format" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="releaseDate" label="Release Date" rules={req('Release date')}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="Status">
                <Select options={[{ value: 'progress', label: 'In Progress' }, { value: 'soon', label: 'Coming Soon' }]} placeholder="Status" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="screeningStart" label="Screening Start"><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="screeningEnd" label="Screening End"><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="languages" label="Languages">
                <Select options={[{ value: 'RO', label: 'RO' }, { value: 'RU', label: 'RU' }, { value: 'EN', label: 'EN' }]}mode="tags" placeholder="e.g. RO, EN" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="toptier" label="Top Tier" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="image" label="Image URL" rules={req('Image URL')}><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="poster" label="Poster URL"><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="href" label="Slug / URL"><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description" rules={req('Description')}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Movies;
