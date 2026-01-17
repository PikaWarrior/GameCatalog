import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ошибка перехвачена ErrorBoundary:', error, errorInfo);
    
    // Отправка ошибки в систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
    
    this.setState({ errorInfo });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Интеграция с Sentry, LogRocket и т.д.
    const errorData = {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // Отправка на сервер или в консоль
    console.error('Ошибка приложения:', errorData);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div 
          className="error-boundary" 
          role="alert" 
          aria-labelledby="error-title"
        >
          <h2 id="error-title">😔 Что-то пошло не так</h2>
          <p>Приложение столкнулось с неожиданной ошибкой.</p>
          
          <details>
            <summary>Подробности ошибки (для разработчиков)</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          
          <div className="error-actions">
            <button 
              onClick={this.handleReset}
              className="error-btn primary"
              aria-label="Попробовать снова"
            >
              Попробовать снова
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="error-btn secondary"
              aria-label="Перезагрузить приложение"
            >
              Перезагрузить приложение
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
