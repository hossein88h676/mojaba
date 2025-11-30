// Important: DO NOT remove this `ErrorBoundary` component.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50" dir="rtl">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <div className="icon-alert-triangle text-red-600 text-3xl"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">خطایی رخ داده است</h1>
            <p className="text-gray-600 mb-6">متاسفانه مشکلی در برنامه پیش آمده. لطفاً صفحه را رفرش کنید.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
              بارگذاری مجدد
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    return (
      <div className="h-screen flex flex-col" data-name="app" data-file="app.js">
        <ChatInterface />
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);