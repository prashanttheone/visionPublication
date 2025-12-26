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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

const { TextArea } = Input;
const { Title } = Typography;

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
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<YouTubePlaylist | null>(null);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlistForm] = Form.useForm();
  const [videoForm] = Form.useForm();

  // Fetch playlists
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

  // Fetch videos
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
    fetchPlaylists();
    fetchVideos();
  }, [fetchPlaylists, fetchVideos]);

  // Playlist handlers
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

      const url = editingPlaylist
        ? '/api/youtube/playlist'
        : '/api/youtube/playlist';
      const method = editingPlaylist ? 'PUT' : 'POST';

      const response = await fetch(url, {
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

  // Video handlers
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

  // Table columns
  const playlistColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      render: (url: string) => (
        <img
          src={url}
          alt="thumbnail"
          style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Videos',
      dataIndex: 'video_count',
      key: 'video_count',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Duration',
      dataIndex: 'total_duration',
      key: 'total_duration',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: YouTubePlaylist) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showPlaylistModal(record)}
          />
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
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      render: (url: string) => (
        <img
          src={url}
          alt="thumbnail"
          style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Video ID',
      dataIndex: 'video_id',
      key: 'video_id',
      width: 150,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: 'Playlist',
      dataIndex: 'playlist_id',
      key: 'playlist_id',
      width: 120,
      render: (playlistId: number) => {
        const playlist = playlists.find((p) => p.id === playlistId);
        return playlist ? <Tag>{playlist.title}</Tag> : <Tag color="default">None</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: YouTubeVideo) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showVideoModal(record)}
          />
          <Popconfirm
            title="Delete video?"
            onConfirm={() => handleDeleteVideo(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>YouTube Management</Title>

        <Tabs defaultActiveKey="playlists">
          <Tabs.TabPane tab="Playlists" key="playlists">
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showPlaylistModal()}
              >
                Add Playlist
              </Button>
            </Space>

            <Table
              columns={playlistColumns}
              dataSource={playlists}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Videos" key="videos">
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showVideoModal()}
              >
                Add Video
              </Button>
            </Space>

            <Table
              columns={videoColumns}
              dataSource={videos}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Playlist Modal */}
      <Modal
        title={editingPlaylist ? 'Edit Playlist' : 'Add Playlist'}
        open={isPlaylistModalOpen}
        onCancel={() => setIsPlaylistModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={playlistForm}
          layout="vertical"
          onFinish={handlePlaylistSubmit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Playlist title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Playlist description" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="Clinical Nursing">Clinical Nursing</Select.Option>
              <Select.Option value="Mental Health">Mental Health</Select.Option>
              <Select.Option value="Public Health">Public Health</Select.Option>
              <Select.Option value="Basics">Basics</Select.Option>
              <Select.Option value="Medical Science">Medical Science</Select.Option>
              <Select.Option value="Surgical">Surgical</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Total Duration" name="total_duration">
            <Input placeholder="e.g., 12h 30m" />
          </Form.Item>

          <Form.Item label="Thumbnail">
            <CloudinaryImageUpload onImageSelect={setUploadedImageUrl} />
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="preview"
                style={{ width: 200, marginTop: 12, borderRadius: 8 }}
              />
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

      {/* Video Modal */}
      <Modal
        title={editingVideo ? 'Edit Video' : 'Add Video'}
        open={isVideoModalOpen}
        onCancel={() => setIsVideoModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={videoForm}
          layout="vertical"
          onFinish={handleVideoSubmit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Video title" />
          </Form.Item>

          <Form.Item
            label="Headline"
            name="headline"
            rules={[{ required: true, message: 'Please enter headline' }]}
          >
            <Input placeholder="Video headline" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Video description" />
          </Form.Item>

          <Form.Item
            label="YouTube Video ID"
            name="video_id"
            rules={[{ required: true, message: 'Please enter video ID' }]}
          >
            <Input placeholder="e.g., dQw4w9WgXcQ" />
          </Form.Item>

          <Form.Item
            label="Duration"
            name="duration"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input placeholder="e.g., 12:45" />
          </Form.Item>

          <Form.Item label="Playlist" name="playlist_id">
            <Select placeholder="Select playlist (optional)" allowClear>
              {playlists.map((playlist) => (
                <Select.Option key={playlist.id} value={playlist.id}>
                  {playlist.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Thumbnail">
            <CloudinaryImageUpload onImageSelect={setUploadedImageUrl} />
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="preview"
                style={{ width: 200, marginTop: 12, borderRadius: 8 }}
              />
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
