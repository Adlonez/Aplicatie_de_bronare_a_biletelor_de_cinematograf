import { useState } from 'react';
import { Empty, Pagination, Spin } from 'antd';

interface MobileCardListPagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

interface MobileCardListProps<T> {
  items: T[];
  rowKey: (item: T) => React.Key;
  renderCard: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyText?: string;
  /** Controlled (server-side) pagination. When omitted, client-side pagination is used. */
  pagination?: MobileCardListPagination;
}

const CLIENT_PAGE_SIZE = 8;

function MobileCardList<T>({
  items,
  rowKey,
  renderCard,
  loading = false,
  emptyText = 'No data',
  pagination,
}: MobileCardListProps<T>) {
  const [clientPage, setClientPage] = useState(1);

  const isControlled = !!pagination;
  const displayItems = isControlled
    ? items
    : items.slice((clientPage - 1) * CLIENT_PAGE_SIZE, clientPage * CLIENT_PAGE_SIZE);
  const total = isControlled ? pagination.total : items.length;
  const current = isControlled ? pagination.current : clientPage;
  const pageSize = isControlled ? pagination.pageSize : CLIENT_PAGE_SIZE;

  const handlePageChange = (page: number, ps: number) => {
    if (isControlled) {
      pagination.onChange(page, ps);
    } else {
      setClientPage(page);
    }
  };

  return (
    <Spin spinning={loading}>
      {displayItems.length === 0 && !loading ? (
        <Empty description={emptyText} style={{ padding: '32px 0' }} />
      ) : (
        <>
          {displayItems.map((item) => (
            <div key={rowKey(item)} style={{ marginBottom: 12 }}>
              {renderCard(item)}
            </div>
          ))}
          {total > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Pagination
                size="small"
                simple
                current={current}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </Spin>
  );
}

export default MobileCardList;
