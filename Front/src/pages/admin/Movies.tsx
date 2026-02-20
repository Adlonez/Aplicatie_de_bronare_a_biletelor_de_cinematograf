import { useState, type FC } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm, Tag, Row, Col, Select, DatePicker, Switch, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import moviesDataJson from '../../_mock/films.json';
import type { Films } from '../../types/ui';
import { dateRangeFilter, sliderRangeFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

const req = (label: string) => [{ required: true, message: `Enter ${label.toLowerCase()}` }];

const Movies: FC = () => {
  const [movies, setMovies] = useState<Films[]>(moviesDataJson as Films[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Films | null>(null);
  const [form] = Form.useForm();

  const allGenres = Array.from(new Set(movies.flatMap(m => m.genre ? m.genre.split(', ') : []))).map(g => ({ label: g, value: g }));

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

  const saveMovie = () => {
    form.validateFields().then((values) => {
      const { screeningStart, screeningEnd, ...rest } = values;
      const movieData: Films = {
        ...(editing ?? {} as Films),
        id: editing?.id || Date.now(),
        ...rest,
        genre: Array.isArray(values.genre) ? values.genre.join(', ') : values.genre,
        releaseDate: values.releaseDate ? dayjs(values.releaseDate).format('YYYY-MM-DD') : undefined,
        screeningPeriod: {
          start: screeningStart ? dayjs(screeningStart).format('YYYY-MM-DD') : '',
          end: screeningEnd ? dayjs(screeningEnd).format('YYYY-MM-DD') : '',
        },
      };

      if (editing) {
        setMovies(prev => prev.map((m) => (m.id === editing.id ? movieData : m)));
        message.success('Movie updated');
      } else {
        setMovies(prev => [...prev, movieData]);
        message.success('Movie added');
      }
      setModalOpen(false);
      form.resetFields();
    });
  };

  const deleteMovie = (id: number) => {
    setMovies(prev => prev.map((m) => m.id === id ? { ...m, deleted: true } : m));
    message.success('Movie marked as deleted');
  };

  const restoreMovie = (id: number) => {
    setMovies(prev => prev.map((m) => m.id === id ? { ...m, deleted: false } : m));
    message.success('Movie restored');
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
      sorter: (a, b) => a.title.localeCompare(b.title),
      filters: movies.map((m) => ({ text: m.title, value: m.title })),
      filterSearch: true,
      filterDropdownProps: { overlayStyle: { width: 250 } },
      onFilter: (value, record) => record.title === value,
      render: (text: string, movie: Films) => (
        <Space>
          <Tooltip title={text}>
            <div style={{ minWidth: 120 }}>{text}</div>
          </Tooltip>
          {movie.deleted && <Tag color="red">Deleted</Tag>}
        </Space>
      ),
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      sorter: (a, b) => (a.genre || '').localeCompare(b.genre || ''),
      filters: Array.from(new Set(movies.flatMap(m => (m.genre || '').split(', ')))).filter(Boolean).map(g => ({ text: g, value: g })),
      filterSearch: true,
      onFilter: (value, record) => (record.genre || '').includes(value as string),
    },
    {
      title: 'Duration (min)',
      dataIndex: 'duration',
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      ...sliderRangeFilter<Films>((r) => r.duration || 0, 30, 240),
    },
    {
      title: 'Release Date',
      dataIndex: 'releaseDate',
      sorter: (a, b) => new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime(),
      ...dateRangeFilter<Films>((r) => r.releaseDate || ''),
    },
    {
      title: 'Actions',
      render: (_: any, movie: Films) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openModal(movie)} disabled={movie.deleted}>
            Edit
          </Button>
          {movie.deleted ? (
            <Button type="primary" onClick={() => restoreMovie(movie.id)} size="small">Restore</Button>
          ) : (
            <Popconfirm title="Delete this movie?" onConfirm={() => deleteMovie(movie.id)} okText="Yes" cancelText="No">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small">Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><VideoCameraOutlined /> Movie Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Add Movie</Button>
      </div>

      <Table dataSource={sortDeletedLast(movies)} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Edit Movie' : 'Add Movie'} open={modalOpen} onOk={saveMovie} onCancel={() => setModalOpen(false)} width={800}>
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
