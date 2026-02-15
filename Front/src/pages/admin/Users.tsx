import React, { useState } from 'react';
import { Table, Button, Tag, Input, message } from 'antd';
import { SearchOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import usersDataJson from '../../_mock/users.json';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  registrationDate: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(usersDataJson as User[]);
  const [searchText, setSearchText] = useState('');

  const filteredUsers = users.filter((user) =>
    searchText === '' ||
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phone.includes(searchText)
  );

  const toggleStatus = (id: number) => {
    setUsers(users.map((user) =>
      user.id === id ? { ...user, status: user.status === 'active' ? 'inactive' as const : 'active' as const } : user
    ));
    message.success('Status updated');
  };

  const columns: ColumnType<User>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      sorter: (a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime(),
    },
    {
      title: 'Actions',
      render: (_: any, user: User) => (
        <Button
          type={user.status === 'active' ? 'default' : 'primary'}
          icon={user.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
          size="small"
          onClick={() => toggleStatus(user.id)}
        >
          {user.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>User Management</h1>
      <Input
        placeholder="Search by name, email, or phone"
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
      <Table dataSource={filteredUsers} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default Users;
