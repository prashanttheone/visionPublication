'use client';

import { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { Result, Button, Typography, Space, Radio, Spin } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DocumentViewerProps {
  url: string;
}

export default function DocumentViewer({ url }: DocumentViewerProps) {
  const [viewerType, setViewerType] =
    useState<'default' | 'microsoft' | 'google'>('default');
  const [isLoading, setIsLoading] = useState(true);

  const fileExtension = url.split('.').pop()?.toLowerCase();
  const isOfficeDoc = ['pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls'].includes(
    fileExtension || ''
  );

  const absoluteUrl =
    typeof window !== 'undefined' && url.startsWith('/')
      ? `${window.location.origin}${url}`
      : url;

  const microsoftUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    absoluteUrl
  )}`;

  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    absoluteUrl
  )}&embedded=true`;

  useEffect(() => {
    setIsLoading(false);
  }, [url]);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isLocalhost && isOfficeDoc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black p-8">
        <Result
          status="info"
          title="Local Development Mode"
          subTitle="Office documents require public URL"
          extra={[
            <Button
              type="primary"
              key="download"
              icon={<DownloadOutlined />}
              href={url}
              download
            >
              Download to View
            </Button>,
          ]}
        />
      </div>
    );
  }

  const renderCustomViewer = () => {
    if (viewerType === 'microsoft') {
      return (
        <iframe
          src={microsoftUrl}
          className="w-full h-full border-none"
          style={{ overflow: 'auto' }}
          title="Microsoft Office Viewer"
        />
      );
    }

    if (viewerType === 'google') {
      return (
        <iframe
          src={googleUrl}
          className="w-full h-full border-none"
          style={{ overflow: 'auto' }}
          title="Google Docs Viewer"
        />
      );
    }

    return (
      <DocViewer
        documents={[{ uri: url }]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: { disableHeader: true },
          pdfVerticalScrollByDefault: true,
        }}
        style={{
          height: '100%',
          overflowY: 'auto',
        }}
      />
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Control Bar */}
      <div className="bg-zinc-900 p-2 flex flex-wrap items-center justify-between border-b border-zinc-800 gap-2">
        <Space>
          <Text className="text-white font-medium mr-2">Viewer:</Text>

          <Radio.Group
            value={viewerType}
            onChange={(e) => setViewerType(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="default">Auto</Radio.Button>

            {isOfficeDoc && (
              <>
                <Radio.Button value="microsoft">
                  Microsoft
                </Radio.Button>
                <Radio.Button value="google">
                  Google
                </Radio.Button>
              </>
            )}
          </Radio.Group>
        </Space>

        <Space>
          {isOfficeDoc && (
            <Text className="text-zinc-500 text-xs hidden sm:inline">
              <InfoCircleOutlined className="mr-1" />
              If one viewer fails, try another.
            </Text>
          )}

          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            href={url}
            download
          >
            Download
          </Button>
        </Space>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div
        className="flex-1 relative overflow-y-auto"
        style={{
          height: 0, // IMPORTANT: allows flex scroll
        }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Spin size="large" tip="Loading document..." />
          </div>
        ) : (
          renderCustomViewer()
        )}
      </div>
    </div>
  );
}
