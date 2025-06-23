
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface TextItem {
  id: string;
  content: string;
  isFormatted: boolean;
}

const ClipboardManager = () => {
  const [textItems, setTextItems] = useState<TextItem[]>([
    { id: '1', content: 'Hello World!', isFormatted: false },
    { id: '2', content: '<strong>Bold Text</strong>', isFormatted: true }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const addNewItem = () => {
    const newItem: TextItem = {
      id: Date.now().toString(),
      content: '',
      isFormatted: false
    };
    setTextItems([...textItems, newItem]);
  };

  const updateItemContent = (id: string, content: string) => {
    setTextItems(items => 
      items.map(item => 
        item.id === id ? { ...item, content } : item
      )
    );
  };

  const updateItemFormat = (id: string, isFormatted: boolean) => {
    setTextItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isFormatted } : item
      )
    );
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 1000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={containerRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg w-80 z-50 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        maxHeight: '400px'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="drag-handle cursor-move bg-gray-50 px-3 py-2 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Clipboard Manager</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 m-2 mb-0">
          <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
          <TabsTrigger value="copy" className="text-xs">Copy</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="p-3 space-y-3 max-h-80 overflow-y-auto">
          {textItems.map((item) => (
            <div key={item.id} className="space-y-2 p-2 border border-gray-100 rounded">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={item.isFormatted}
                  onCheckedChange={(checked) => updateItemFormat(item.id, checked)}
                  className="scale-75"
                />
                <span className="text-xs text-gray-600">
                  {item.isFormatted ? 'Formatted' : 'Plain'}
                </span>
              </div>
              <Input
                value={item.content}
                onChange={(e) => updateItemContent(item.id, e.target.value)}
                placeholder="Enter text..."
                className="text-sm"
              />
            </div>
          ))}
          <Button
            onClick={addNewItem}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Row
          </Button>
        </TabsContent>

        <TabsContent value="copy" className="p-3 space-y-2 max-h-80 overflow-y-auto">
          {textItems.filter(item => item.content.trim()).map((item) => (
            <button
              key={item.id}
              onClick={() => copyToClipboard(item.content, item.id)}
              className="w-full p-2 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {item.isFormatted ? (
                    <div 
                      className="text-sm truncate"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  ) : (
                    <div className="text-sm truncate">{item.content}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {item.isFormatted ? 'Formatted' : 'Plain text'}
                  </div>
                </div>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
          ))}
          {textItems.filter(item => item.content.trim()).length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              No text items to copy
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClipboardManager;
