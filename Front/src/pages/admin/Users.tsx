import { useCallback, useEffect, useState, type FC, type Key } from 'react';
import { Grid, Table, Button, Card, Tag, message, Space, Popconfirm, Typography, Input, DatePicker } from 'antd';
import { CheckCircleOutlined, StopOutlined, DeleteOutlined, UserOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnType, TableProps } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance, { getErrorMessage } from '../../api/axiosInstance';
import type { User } from '../../types/ui';
import MobileCardList from '../../components/admin/MobileCardList';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

type UserFilters = {
  name?: string;
  email?: string;
  phone?: string;
  statuses?: User['status'][];
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
};

type UserSort = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

const encodeDateRange = (dateRange?: UserFilters['dateRange']) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return undefined;
  return `${dateRange[0].format('YYYY-MM-DD')}|${dateRange[1].format('YYYY-MM-DD')}`;
};

const decodeDateRange = (value?: Key | boolean): UserFilters['dateRange'] => {
  if (typeof value !== 'string') return null;
  const [start, end] = value.split('|');
  return start && end ? [dayjs(start), dayjs(end)] : null;
};

const FilterButtons = ({ confirm, clearFilters, hasFilter }: { confirm: () => void; clearFilters?: () => void; hasFilter: boolean }) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
    <Button onClick={() => { clearFilters?.(); confirm(); }} size="small" style={{ width: 90 }} disabled={!hasFilter}>Reset</Button>
    <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>OK</Button>
  </Space>
);

const textColumnSearch = (placeholder: string): Pick<ColumnType<User>, 'filterDropdown' | 'filterIcon'> => ({
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

const Users: FC = () => {
  const { isDemoAdmin } = useAuth();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<UserFilters>({});
  const [sort, setSort] = useState<UserSort>({});
  const [tableKey, setTableKey] = useState(0);

  const loadUsers = useCallback(async (
    pageNumber: number,
    pageSize: number,
    nextFilters: UserFilters,
    nextSort: UserSort,
  ) => {
    try {
      setLoading(true);
      const params = {
        pageNumber,
        pageSize,
        name: nextFilters.name || undefined,
        email: nextFilters.email || undefined,
        phone: nextFilters.phone || undefined,
        status: nextFilters.statuses?.length === 1 ? nextFilters.statuses[0] : undefined,
        dateFrom: nextFilters.dateRange?.[0]?.format('YYYY-MM-DD'),
        dateTo: nextFilters.dateRange?.[1]?.format('YYYY-MM-DD'),
        sortBy: nextSort.sortBy,
        sortDirection: nextSort.sortDirection,
      };

      const { data } = await axiosInstance.get('/api/users/list', { params });
      const result = data?.data as PagedResult<User> | User[] | undefined;

      if (Array.isArray(result)) {
        setUsers(result);
        setPagination((prev) => ({ ...prev, current: 1, total: result.length }));
        return;
      }

      setUsers(result?.items ?? []);
      setPagination({
        current: result?.pageNumber ?? pageNumber,
        pageSize: result?.pageSize ?? pageSize,
        total: result?.totalCount ?? 0,
      });
    } catch (err) {
      setUsers([]);
      message.error(getErrorMessage(err, 'Unable to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(1, 10, {}, {});
  }, [loadUsers]);

  const resetFilters = async () => {
    const emptyFilters: UserFilters = {};
    const emptySort: UserSort = {};
    setFilters(emptyFilters);
    setSort(emptySort);
    setTableKey(k => k + 1);
    await loadUsers(1, pagination.pageSize, emptyFilters, emptySort);
  };

  const toggleStatus = async (user: User) => {
    if (isDemoAdmin) {
      message.error('Action denied: Demo user cannot modify data.');
      return;
    }
    const nextStatus: User['status'] = user.status === 'active' ? 'inactive' : 'active';

    try {
      setLoading(true);
      await axiosInstance.put(`/api/users/${user.id}/status`, nextStatus, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.success('Status updated');
      await loadUsers(pagination.current, pagination.pageSize, filters, sort);
    } catch (err) {
      message.error(getErrorMessage(err, 'Unable to update user status'));
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (isDemoAdmin) {
      message.error('Action denied: Demo user cannot modify data.');
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/users/${id}`);
      message.success('User deleted');
      await loadUsers(pagination.current, pagination.pageSize, filters, sort);
    } catch (err) {
      message.error(getErrorMessage(err, 'Unable to delete user'));
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnType<User>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      filteredValue: filters.name ? [filters.name] : null,
      ...textColumnSearch('Search name'),
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
      sorter: true,
      filteredValue: filters.email ? [filters.email] : null,
      ...textColumnSearch('Search email'),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: true,
      filteredValue: filters.phone ? [filters.phone] : null,
      ...textColumnSearch('Search phone'),
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      sorter: true,
      filteredValue: encodeDateRange(filters.dateRange) ? [encodeDateRange(filters.dateRange) as string] : null,
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
          <RangePicker
            value={decodeDateRange(selectedKeys[0])}
            onChange={(dateRange) => {
              const encoded = encodeDateRange(dateRange as UserFilters['dateRange']);
              setSelectedKeys(encoded ? [encoded] : []);
            }}
            style={{ marginBottom: 8, display: 'flex' }}
          />
          <FilterButtons confirm={confirm} clearFilters={clearFilters} hasFilter={selectedKeys.length > 0} />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string, u: User) => (
        <Button
          type="primary"
          icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
          size="small"
          onClick={() => toggleStatus(u)}
          disabled={u.deleted || isDemoAdmin}
          style={{
            backgroundColor: status === 'active' ? '#52c41a' : '#ff4d4f',
            borderColor: status === 'active' ? '#52c41a' : '#ff4d4f',
            width: 110,
          }}
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </Button>
      ),
      filteredValue: filters.statuses ?? null,
      filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
      filterMultiple: true,
    },
    {
      title: 'Actions',
      fixed: 'end',
      render: (_: unknown, u: User) => (
        <Space>
          <Popconfirm title="Delete this user?" onConfirm={() => deleteUser(u.id)} okText="Yes" cancelText="No" disabled={u.deleted || isDemoAdmin}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ width: 90 }} disabled={u.deleted || isDemoAdmin}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const visibleUsers = filters.statuses && filters.statuses.length > 1
    ? users.filter((user) => filters.statuses?.includes(user.status))
    : users;

  const handleTableChange: TableProps<User>['onChange'] = async (nextPagination, tableFilters, sorter) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const nextSort: UserSort = activeSorter?.order
      ? {
          sortBy: String(activeSorter.field),
          sortDirection: activeSorter.order === 'descend' ? 'desc' : 'asc',
        }
      : {};
    const nextFilters: UserFilters = {
      name: typeof tableFilters.name?.[0] === 'string' ? tableFilters.name[0] : undefined,
      email: typeof tableFilters.email?.[0] === 'string' ? tableFilters.email[0] : undefined,
      phone: typeof tableFilters.phone?.[0] === 'string' ? tableFilters.phone[0] : undefined,
      statuses: tableFilters.status?.map((status) => String(status) as User['status']),
      dateRange: decodeDateRange(tableFilters.registrationDate?.[0]),
    };

    setFilters(nextFilters);
    setSort(nextSort);
    await loadUsers(nextPagination.current ?? 1, nextPagination.pageSize ?? 10, nextFilters, nextSort);
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'scroll' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <Title level={2} style={{ margin: 0 }}><UserOutlined /> User Management</Title>
        <Button icon={<ClearOutlined />} onClick={resetFilters}>Reset All Filters</Button>
      </div>
      <div style={{ flex: 1, overflow: 'scroll' }}>
        {isMobile ? (
          <MobileCardList
            items={visibleUsers}
            rowKey={(u) => u.id}
            loading={loading}
            emptyText="No users found."
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, ps) => loadUsers(page, ps, filters, sort),
            }}
            renderCard={(u) => (
              <Card size="small">
                <Space wrap size={4} style={{ marginBottom: 4 }}>
                  <Typography.Text strong style={{ fontSize: 15 }}>{u.name}</Typography.Text>
                  {u.deleted && <Tag color="red">Deleted</Tag>}
                </Space>
                <div style={{ color: 'var(--ant-color-text-secondary, #666)', fontSize: 13, marginBottom: 8 }}>
                  {u.email && <div>{u.email}</div>}
                  {u.phone && <div>{u.phone}</div>}
                  {u.registrationDate && <div>{u.registrationDate}</div>}
                </div>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={u.status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
                    size="small"
                    onClick={() => toggleStatus(u)}
                    disabled={u.deleted || isDemoAdmin}
                    style={{ backgroundColor: u.status === 'active' ? '#52c41a' : undefined, borderColor: u.status === 'active' ? '#52c41a' : undefined }}
                  >
                    {u.status === 'active' ? 'Active' : 'Inactive'}
                  </Button>
                  <Popconfirm title="Delete this user?" onConfirm={() => deleteUser(u.id)} okText="Yes" cancelText="No" disabled={u.deleted || isDemoAdmin}>
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ width: 90 }} disabled={u.deleted || isDemoAdmin}>Delete</Button>
                  </Popconfirm>
                </Space>
              </Card>
            )}
          />
        ) : (
          <Table
            key={tableKey}
            dataSource={visibleUsers}
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
        )}
      </div>
    </div>
  );
};

export default Users;
