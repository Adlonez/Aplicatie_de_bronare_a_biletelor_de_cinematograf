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
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>,
      filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      sorter: (a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime(),
      ...dateRangeFilter<User>((r) => r.registrationDate),
    },
    {
      title: 'Actions',
      render: (_: any, u: User) => (
        <Space>
          <Button
            type={u.status === 'active' ? 'default' : 'primary'}
            icon={u.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            size="small"
            onClick={() => toggleStatus(u.id)}
            disabled={u.deleted}
            style={{ width: 110 }}
          >
            {u.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
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
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '16px', marginTop: 0 }}><UserOutlined /> User Management</Title>
      <Table dataSource={sortDeletedLast(users)} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default Users;
