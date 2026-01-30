'use client';

import { Table, Button, Space, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Book, Course } from './types';

const { Text } = Typography;

interface BookTableProps {
  books: Book[];
  courses: Course[];
  isLoading: boolean;
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
  calculateDiscount: (actual: number, offer: number) => number;
}

export function BookTable({ 
  books, 
  courses, 
  isLoading, 
  onEdit, 
  onDelete, 
  calculateDiscount 
}: BookTableProps) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Book, b: Book) => a.name.localeCompare(b.name),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      sorter: (a: Book, b: Book) => a.author.localeCompare(b.author),
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Course/Period',
      key: 'coursePeriod',
      render: (_: any, record: Book) => {
        if (!record.courseMappings || record.courseMappings.length === 0) {
          return <Tag color="default">Not mapped</Tag>;
        }
        return (
          <Space direction="vertical" size="small">
            {record.courseMappings.slice(0, 2).map((m, idx) => (
              <Tag key={idx} color="purple">
                {m.course_name || courses.find(c => c.id === m.course_id)?.name || 'Unknown'} - {m.period_label || 'Unknown Period'}
              </Tag>
            ))}
            {record.courseMappings.length > 2 && (
              <Tag color="default">+{record.courseMappings.length - 2} more</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Actual Price',
      dataIndex: 'actual_price',
      key: 'actual_price',
      align: 'right' as const,
      render: (price: number) => `₹${price}`,
      sorter: (a: Book, b: Book) => a.actual_price - b.actual_price,
    },
    {
      title: 'Offer Price',
      dataIndex: 'offer_price',
      key: 'offer_price',
      align: 'right' as const,
      render: (price: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₹{price}
        </Text>
      ),
      sorter: (a: Book, b: Book) => a.offer_price - b.offer_price,
    },
    {
      title: 'Discount',
      key: 'discount',
      align: 'right' as const,
      render: (_: any, record: Book) => (
        <Tag color="green">{calculateDiscount(record.actual_price, record.offer_price)}%</Tag>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      align: 'right' as const,
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
      ),
      sorter: (a: Book, b: Book) => a.stock_quantity - b.stock_quantity,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Book) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id!)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={books}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} books`,
      }}
      scroll={{ x: 1200 }}
    />
  );
}
