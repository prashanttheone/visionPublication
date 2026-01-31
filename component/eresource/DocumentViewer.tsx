'use client';

import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { Result, Button, Typography, Alert } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DocumentViewerProps {
  url: string;
}

export default function DocumentViewer({ url }: DocumentViewerProps) {
  const docs = [{ uri: url }];
  
  // Check if we are on localhost and trying to view a PPTX/DOCX/XLSX file
  // Microsoft Office Online Viewer (used by the library for these types) cannot access localhost
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const fileExtension = url.split('.').pop()?.toLowerCase();
  const needsExternalViewer = ['pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls'].includes(fileExtension || '');
  const showLocalhostWarning = isLocalhost && needsExternalViewer;

  return (
    <div 
      className="w-full h-full flex flex-col bg-black overflow-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
      {showLocalhostWarning && (
        <div className="p-4">
          <Alert
            message="Local Development Note"
            description={
              <div>
                <p>Office documents (PPTX, DOCX) require a public URL to render in the viewer. Since you are on <strong>localhost</strong>, the Microsoft Office viewer cannot access this file.</p>
                <p className="mt-2 text-sm">This will work perfectly once the site is deployed to a live server.</p>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  href={url} 
                  download 
                  className="mt-2"
                >
                  Download to View Locally
                </Button>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </div>
      )}

      <div className="flex-1 w-full h-full">
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              disableHeader: true,
            },
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
      `}</style>
    </div>
  );
}
