import { useEffect, useState, type FC } from 'react';
import { Table, Button, Tag, message, Space, Popconfirm, Typography } from 'antd';
import { CheckCircleOutlined, StopOutlined, DeleteOutlined, UserOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import axiosInstance from '../../api/axiosInstance';
import type { User } from '../../types/ui';
import { dateRangeFilter, textSearchFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/users/list');
      setUsers((data?.data ?? []) as User[]);
    } catch {
      setUsers([]);
      message.error('Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (user: User) => {
    const nextStatus: User['status'] = user.status === 'active' ? 'inactive' : 'active';

    try {
      setLoading(true);
      await axiosInstance.put(`/api/users/${user.id}/status`, nextStatus, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.success('Status updated');
      await loadUsers();
    } catch {
      message.error('Unable to update user status');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/users/${id}`);
      message.success('User deleted');
      await loadUsers();
    } catch {
      message.error('Unable to delete user');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnType<User>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...textSearchFilter<User>((r) => r.name),
      render: (text: string, u: User) => (
        <Space>
          {text}
          {u.deleted && <Tag color="red">Deleted</Tag>}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      ...textSearchFilter<User>((r) => r.email),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      ...textSearchFilter<User>((r) => r.phone),
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      sorter: (a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime(),
      ...dateRangeFilter<User>((r) => r.registrationDate),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string, u: User) => (
        <Button
          type="primary"
          icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
          size="small"
          onClick={() => toggleStatus(u)}
          disabled={u.deleted}
          style={{
            backgroundColor: status === 'active' ? '#52c41a' : '#ff4d4f',
            borderColor: status === 'active' ? '#52c41a' : '#ff4d4f',
            width: 110,
          }}
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </Button>
      ),
      filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      render: (_: unknown, u: User) => (
        <Space>
          <Popconfirm title="Delete this user?" onConfirm={() => deleteUser(u.id)} okText="Yes" cancelText="No" disabled={u.deleted}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ width: 90 }} disabled={u.deleted}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><UserOutlined /> User Management</Title>
        <Button icon={<ClearOutlined />} onClick={() => setTableKey(k => k + 1)}>Reset All Filters</Button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Table key={tableKey} dataSource={sortDeletedLast(users)} columns={columns} rowKey="id" pagination={false} scroll={{ y: 'calc(100vh - 310px)' }} loading={loading} />
      </div>
    </div>
  );
};

export default Users;
