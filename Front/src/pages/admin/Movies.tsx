import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moviesDataJson from '../../_mock/films.json';

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  genre: string;
  releaseDate: string;
  screeningPeriod: {
    start: string;
    end: string;
  };
  poster: string;
  format?: string;
  languages?: string[];
  status?: string;
  toptier?: boolean;
}

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(moviesDataJson as Movie[]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form] = Form.useForm();

  const openModal = (movie?: Movie) => {
    setEditingMovie(movie || null);
    if (movie) {
      form.setFieldsValue({
        ...movie,
        screeningStart: movie.screeningPeriod.start,
        screeningEnd: movie.screeningPeriod.end,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const saveMovie = () => {
    form.validateFields().then((values) => {
      const movieData: Movie = {
        id: editingMovie?.id || Date.now(),
        ...values,
        screeningPeriod: { start: values.screeningStart, end: values.screeningEnd },
      };

      if (editingMovie) {
        setMovies(movies.map((m) => (m.id === editingMovie.id ? movieData : m)));
        message.success('Movie updated');
      } else {
        setMovies([...movies, movieData]);
        message.success('Movie added');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const deleteMovie = (id: number) => {
    setMovies(movies.filter((m) => m.id !== id));
    message.success('Movie deleted');
  };

  const columns = [
    {
      title: 'Poster',
      dataIndex: 'poster',
      width: 100,
      render: (url: string, movie: Movie) => (
        <img src={url} alt={movie.title} style={{ width: 60, height: 40, objectFit: 'cover' }} />
      ),
    },
    { title: 'Title', dataIndex: 'title' },
    { title: 'Genre', dataIndex: 'genre' },
    { title: 'Duration (min)', dataIndex: 'duration' },
    { title: 'Release Date', dataIndex: 'releaseDate' },
    {
      title: 'Actions',
      render: (_: any, movie: Movie) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openModal(movie)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this movie?"
            onConfirm={() => deleteMovie(movie.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const FormField = ({ name, label, required = true, children }: any) => (
    <Form.Item name={name} label={label} rules={required ? [{ required, message: `Enter ${label.toLowerCase()}` }] : []}>
      {children || <Input />}
    </Form.Item>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1>Movie Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Add Movie
        </Button>
      </div>

      <Table dataSource={movies} columns={columns} rowKey="id" />

      <Modal
        title={editingMovie ? 'Edit Movie' : 'Add Movie'}
        open={isModalVisible}
        onOk={saveMovie}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <FormField name="title" label="Title" />
          <FormField name="description" label="Description">
            <Input.TextArea rows={3} />
          </FormField>
          <FormField name="duration" label="Duration (minutes)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </FormField>
          <FormField name="genre" label="Genre" />
          <FormField name="releaseDate" label="Release Date">
            <Input type="date" />
          </FormField>
          <FormField name="screeningStart" label="Screening Start Date">
            <Input type="date" />
          </FormField>
          <FormField name="screeningEnd" label="Screening End Date">
            <Input type="date" />
          </FormField>
          <FormField name="poster" label="Poster URL" />
        </Form>
      </Modal>
    </div>
  );
};

export default Movies;
