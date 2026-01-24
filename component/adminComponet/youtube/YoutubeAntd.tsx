'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Form,
  Select,
  Switch,
  Modal,
  message,
  Tabs,
  Space,
  Typography,
  Tag,
  Card,
  Popconfirm,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface YouTubeCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

interface YouTubePlaylist {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  video_count: number;
  total_duration?: string;
  is_active: boolean;
  display_order: number;
}

interface YouTubeVideo {
  id: number;
  title: string;
  headline: string;
  video_id: string;
  thumbnail: string;
  duration: string;
  description?: string;
  playlist_id?: number;
  is_active: boolean;
}

export default function YoutubeAdmin() {
  const [categories, setCategories] = useState<YouTubeCategory[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<YouTubePlaylist | null>(null);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [playlistForm] = Form.useForm();
  const [videoForm] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/youtube/category');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      const response = await fetch('/api/youtube/playlist');
      const data = await response.json();
      if (data.success) {
        setPlaylists(data.data);
      } else {
        message.error(data.error || 'Failed to fetch playlists');
      }
    } catch (err) {
      message.error('Failed to fetch playlists');
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await fetch('/api/youtube');
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      } else {
        message.error(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      message.error('Failed to fetch videos');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchPlaylists();
    fetchVideos();
  }, [fetchCategories, fetchPlaylists, fetchVideos]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error('Please enter a category name');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/youtube/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, description: newCategoryDesc }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Category created successfully');
        setNewCategoryName('');
        setNewCategoryDesc('');
        setIsCategoryModalOpen(false);
        fetchCategories();
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/youtube/category?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        message.success('Category deleted successfully');
        fetchCategories();
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error('Failed to delete category');
    }
  };

  const showPlaylistModal = (playlist?: YouTubePlaylist) => {
    if (playlist) {
      setEditingPlaylist(playlist);
      playlistForm.setFieldsValue(playlist);
      setUploadedImageUrl(playlist.thumbnail);
    } else {
      setEditingPlaylist(null);
      playlistForm.resetFields();
      setUploadedImageUrl('');
    }
    setIsPlaylistModalOpen(true);
  };

  const handlePlaylistSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        thumbnail: uploadedImageUrl || values.thumbnail,
        id: editingPlaylist?.id,
      };

      const method = editingPlaylist ? 'PUT' : 'POST';

      const response = await fetch('/api/youtube/playlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        setIsPlaylistModalOpen(false);
        fetchPlaylists();
        playlistForm.resetFields();
        setUploadedImageUrl('');
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error('Failed to save playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    try {
      const response = await fetch(`/api/youtube/playlist?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        message.success('Playlist deleted successfully');
        fetchPlaylists();
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error('Failed to delete playlist');
    }
  };

  const showVideoModal = (video?: YouTubeVideo) => {
    if (video) {
      setEditingVideo(video);
      videoForm.setFieldsValue(video);
      setUploadedImageUrl(video.thumbnail);
    } else {
      setEditingVideo(null);
      videoForm.resetFields();
      setUploadedImageUrl('');
    }
    setIsVideoModalOpen(true);
  };

  const handleVideoSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        thumbnail: uploadedImageUrl || values.thumbnail,
      };

      const url = editingVideo
        ? `/api/youtube/${editingVideo.id}`
        : '/api/youtube';
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        setIsVideoModalOpen(false);
        fetchVideos();
        videoForm.resetFields();
        setUploadedImageUrl('');
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error('Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    try {
      const response = await fetch(`/api/youtube/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        message.success('Video deleted successfully');
        fetchVideos();
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error('Failed to delete video');
    }
  };

  const playlistColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      render: (url: string) => (
        <img src={url} alt="thumbnail" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    { title: 'Videos', dataIndex: 'video_count', key: 'video_count', width: 80, align: 'center' as const },
    { title: 'Duration', dataIndex: 'total_duration', key: 'total_duration', width: 100 },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: YouTubePlaylist) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showPlaylistModal(record)} />
          <Popconfirm
            title="Delete playlist?"
            description="This will delete all videos in this playlist"
            onConfirm={() => handleDeletePlaylist(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const videoColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      render: (url: string) => (
        <img src={url} alt="thumbnail" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Video ID', dataIndex: 'video_id', key: 'video_id', width: 150 },
    { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 100 },
    {
      title: 'Playlist',
      dataIndex: 'playlist_id',
      key: 'playlist_id',
      width: 150,
      render: (playlistId: number) => {
        const playlist = playlists.find((p) => p.id === playlistId);
        return playlist ? <Tag color="purple">{playlist.title}</Tag> : <Tag color="default">None</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: YouTubeVideo) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showVideoModal(record)} />
          <Popconfirm title="Delete video?" onConfirm={() => handleDeleteVideo(record.id)} okText="Yes" cancelText="No">
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Playlists',
      key: 'playlist_count',
      render: (_: any, record: YouTubeCategory) => {
        const count = playlists.filter(p => p.category === record.name).length;
        return <Tag color="blue">{count}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: YouTubeCategory) => {
        const hasPlaylists = playlists.some(p => p.category === record.name);
        return (
          <Popconfirm
            title="Delete category?"
            description={hasPlaylists ? "Cannot delete category with playlists" : "Are you sure?"}
            onConfirm={() => !hasPlaylists && handleDeleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={hasPlaylists}
          >
            <Button type="link" danger icon={<DeleteOutlined />} disabled={hasPlaylists} />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>YouTube Management</Title>

        <Tabs defaultActiveKey="playlists">
          <Tabs.TabPane tab="Playlists" key="playlists">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showPlaylistModal()}>
                Add Playlist
              </Button>
              <Button icon={<TagsOutlined />} onClick={() => setIsCategoryModalOpen(true)}>
                Manage Categories
              </Button>
            </Space>
            <Table columns={playlistColumns} dataSource={playlists} rowKey="id" pagination={{ pageSize: 10 }} />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Videos" key="videos">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showVideoModal()}>
                Add Video
              </Button>
            </Space>
            <Table columns={videoColumns} dataSource={videos} rowKey="id" pagination={{ pageSize: 10 }} />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Categories" key="categories">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCategoryModalOpen(true)}>
                Add Category
              </Button>
            </Space>
            <Table columns={categoryColumns} dataSource={categories} rowKey="id" pagination={{ pageSize: 10 }} />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Manage Categories"
        open={isCategoryModalOpen}
        onCancel={() => {
          setIsCategoryModalOpen(false);
          setNewCategoryName('');
          setNewCategoryDesc('');
        }}
        footer={null}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">Create a new category for organizing your playlists</Text>
          <Divider />
          <Input
            placeholder="Category Name (e.g., Pediatric Nursing)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />
          <Button type="primary" onClick={handleAddCategory} loading={loading} block icon={<PlusOutlined />}>
            Create Category
          </Button>
          <Divider>Existing Categories</Divider>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>{cat.name}</span>
                <Popconfirm
                  title="Delete this category?"
                  onConfirm={() => handleDeleteCategory(cat.id)}
                  disabled={playlists.some(p => p.category === cat.name)}
                >
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    disabled={playlists.some(p => p.category === cat.name)}
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        </Space>
      </Modal>

      <Modal
        title={editingPlaylist ? 'Edit Playlist' : 'Add Playlist'}
        open={isPlaylistModalOpen}
        onCancel={() => setIsPlaylistModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={playlistForm} layout="vertical" onFinish={handlePlaylistSubmit} initialValues={{ is_active: true }}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="Playlist title" />
          </Form.Item>

          <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter description' }]}>
            <TextArea rows={4} placeholder="Playlist description" />
          </Form.Item>

          <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select category' }]}>
            <Select
              placeholder="Select category"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 8px' }}>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setIsPlaylistModalOpen(false);
                        setIsCategoryModalOpen(true);
                      }}
                    >
                      Add New Category
                    </Button>
                  </div>
                </>
              )}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Total Duration" name="total_duration">
            <Input placeholder="e.g., 12h 30m" />
          </Form.Item>

          <Form.Item label="Thumbnail">
            <CloudinaryImageUpload onImageSelect={setUploadedImageUrl} />
            {uploadedImageUrl && (
              <img src={uploadedImageUrl} alt="preview" style={{ width: 200, marginTop: 12, borderRadius: 8 }} />
            )}
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsPlaylistModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPlaylist ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingVideo ? 'Edit Video' : 'Add Video'}
        open={isVideoModalOpen}
        onCancel={() => setIsVideoModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={videoForm} layout="vertical" onFinish={handleVideoSubmit} initialValues={{ is_active: true }}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="Video title" />
          </Form.Item>

          <Form.Item label="Headline" name="headline" rules={[{ required: true, message: 'Please enter headline' }]}>
            <Input placeholder="Video headline" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Video description" />
          </Form.Item>

          <Form.Item label="YouTube Video ID" name="video_id" rules={[{ required: true, message: 'Please enter video ID' }]}>
            <Input placeholder="e.g., dQw4w9WgXcQ" />
          </Form.Item>

          <Form.Item label="Duration" name="duration" rules={[{ required: true, message: 'Please enter duration' }]}>
            <Input placeholder="e.g., 12:45" />
          </Form.Item>

          <Form.Item label="Playlist" name="playlist_id" rules={[{ required: true, message: 'Please select a playlist' }]}>
            <Select placeholder="Select playlist">
              {playlists.map((playlist) => (
                <Select.Option key={playlist.id} value={playlist.id}>
                  {playlist.title} ({playlist.category})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Thumbnail">
            <CloudinaryImageUpload onImageSelect={setUploadedImageUrl} />
            {uploadedImageUrl && (
              <img src={uploadedImageUrl} alt="preview" style={{ width: 200, marginTop: 12, borderRadius: 8 }} />
            )}
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsVideoModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingVideo ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
