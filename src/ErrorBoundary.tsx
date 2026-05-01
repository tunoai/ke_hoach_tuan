import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Lỗi ứng dụng:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#ef4444', fontFamily: 'sans-serif' }}>
          <h3>Đã xảy ra lỗi trên thiết bị này:</h3>
          <p style={{ fontWeight: 'bold' }}>{this.state.error}</p>
          <p style={{ marginTop: '10px' }}>
            Vui lòng mở bằng Safari/Chrome thay vì trình duyệt của Zalo/Messenger.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
