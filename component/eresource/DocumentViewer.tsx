'use client';

import { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { Result, Button, Typography, Alert, Space, Radio, Spin } from 'antd';
import { DownloadOutlined, InfoCircleOutlined, ReloadOutlined, GlobalOutlined, DesktopOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DocumentViewerProps {
  url: string;
}

export default function DocumentViewer({ url }: DocumentViewerProps) {
  const [viewerType, setViewerType] = useState<'default' | 'microsoft' | 'google'>('default');
  const [isLoading, setIsLoading] = useState(true);
  
  const fileExtension = url.split('.').pop()?.toLowerCase();
  const isOfficeDoc = ['pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls'].includes(fileExtension || '');
  
  // Microsoft and Google viewers require absolute URLs
  // If the URL is relative (starts with /), we need to make it absolute
  const absoluteUrl = typeof window !== 'undefined' && url.startsWith('/') 
    ? `${window.location.origin}${url}` 
    : url;

  const microsoftUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;

  useEffect(() => {
    // If it's a PPTX, we might want to default to a specific viewer if the default one fails
    // But for now, let's keep 'default' which uses @cyntler/react-doc-viewer
    setIsLoading(false);
  }, [url]);

  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost && isOfficeDoc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black p-8">
        <Result
          status="info"
          title="Local Development Mode"
          subTitle="Office documents (PPTX, DOCX) require a public URL to render in online viewers. Microsoft and Google cannot access your localhost."
          extra={[
            <Button type="primary" key="download" icon={<DownloadOutlined />} href={url} download>
              Download to View
            </Button>
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
          title="Microsoft Office Viewer"
        />
      );
    }
    if (viewerType === 'google') {
      return (
        <iframe 
          src={googleUrl} 
          className="w-full h-full border-none" 
          title="Google Docs Viewer"
        />
      );
    }
    
    // Default uses the library
    return (
      <DocViewer
        documents={[{ uri: url }]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: { disableHeader: true },
          pdfVerticalScrollByDefault: true,
        }}
        style={{ height: '100%' }}
        theme={{
          primary: '#1890ff',
          secondary: '#000000',
          tertiary: '#1f1f1f',
          textPrimary: '#ffffff',
          textSecondary: '#a6a6a6',
          textTertiary: '#ffffff',
          disableThemeScrollbar: false,
        }}
      />
    );
  };

  return (
    <div 
      className="w-full h-full flex flex-col bg-black overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
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
                <Radio.Button value="microsoft">Microsoft</Radio.Button>
                <Radio.Button value="google">Google</Radio.Button>
              </>
            )}
          </Radio.Group>
        </Space>
        
        <Space>
          {isOfficeDoc && (
            <Text className="text-zinc-500 text-xs hidden sm:inline">
              <InfoCircleOutlined className="mr-1" />
              If one viewer fails, try the other.
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

      <div className="flex-1 w-full h-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Spin size="large" tip="Loading document..." />
          </div>
        ) : (
          renderCustomViewer()
        )}
      </div>
      
      <style jsx global>{`
        #react-doc-viewer #header-bar {
          display: none !important;
        }
        .proxy-container {
          background: #000 !important;
        }
        #react-doc-viewer {
          background: #000 !important;
        }
        #pdf-renderer {
          background: #000 !important;
        }
        #react-doc-viewer [class*="RendererProxy"] {
          background: #000 !important;
        }
      `}</style>
    </div>
  );
}
