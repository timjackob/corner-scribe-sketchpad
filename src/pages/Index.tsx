
import ClipboardManager from '@/components/ClipboardManager';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Clipboard Manager Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A lightweight, draggable clipboard manager that stays on top
          </p>
          <div className="bg-white rounded-lg shadow-sm p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Features:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Draggable window that stays on top
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Edit tab: Add/edit text snippets with plain or formatted text options
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Copy tab: Click any snippet to copy it to clipboard
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Lightweight and minimal design
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <ClipboardManager />
    </div>
  );
};

export default Index;
