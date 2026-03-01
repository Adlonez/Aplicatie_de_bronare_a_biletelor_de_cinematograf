import { useState, type FC } from 'react';
import { Table, Button, Tag, message, Space, Popconfirm, Typography } from 'antd';
import { CheckCircleOutlined, StopOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import usersDataJson from '../../_mock/users.json';
import type { User } from '../../types/ui';
import { dateRangeFilter, textSearchFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>(usersDataJson as User[]);

  const toggleStatus = (id: number) => {
    setUsers(prev => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } : u,
    ));
    message.success('Status updated');
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.map((u) => (u.id === id ? { ...u, deleted: true } : u)));
    message.success('User marked as deleted');
  };

  const restoreUser = (id: number) => {
    setUsers(prev => prev.map((u) => (u.id === id ? { ...u, deleted: false } : u)));
    message.success('User restored');
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
          onClick={() => toggleStatus(u.id)}
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
          {u.deleted ? (
            <Button type="primary" onClick={() => restoreUser(u.id)} size="small" style={{ width: 90 }}>Restore</Button>
          ) : (
            <Popconfirm title="Delete this user?" onConfirm={() => deleteUser(u.id)} okText="Yes" cancelText="No">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ width: 90 }}>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Title level={2} style={{ marginBottom: '16px', marginTop: 0 }}><UserOutlined /> User Management</Title>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Table dataSource={sortDeletedLast(users)} columns={columns} rowKey="id" pagination={false} scroll={{ y: 'calc(100vh - 310px)' }} />
      </div>
    </div>
  );
};

export default Users;
