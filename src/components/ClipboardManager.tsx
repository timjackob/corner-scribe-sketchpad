import React, { useState, useRef, useEffect } from 'react';
import { Plus, Copy, Check, Trash2, Save, Upload } from 'lucide-react';
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

interface Configuration {
  items: TextItem[];
  timestamp: number;
  name: string;
}

const ClipboardManager = () => {
  const [textItems, setTextItems] = useState<TextItem[]>([
    { id: '1', content: 'Hello World!', isFormatted: false },
    { id: '2', content: '<strong>Bold Text</strong>', isFormatted: true }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 320, height: 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const deleteItem = (id: string) => {
    setTextItems(items => items.filter(item => item.id !== id));
    toast.success('Item deleted');
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

  const saveConfiguration = () => {
    const config: Configuration = {
      items: textItems,
      timestamp: Date.now(),
      name: `Config_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${config.name}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Configuration saved!');
  };

  const loadConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config: Configuration = JSON.parse(content);
        
        if (config.items && Array.isArray(config.items)) {
          setTextItems(config.items);
          toast.success('Configuration loaded successfully!');
        } else {
          toast.error('Invalid configuration file format');
        }
      } catch (error) {
        toast.error('Failed to load configuration file');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    } else if (target.closest('.resize-handle')) {
      const resizeType = target.closest('.resize-handle')?.getAttribute('data-resize');
      if (resizeType) {
        setIsResizing(resizeType);
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: size.width,
          height: size.height,
          posX: position.x,
          posY: position.y
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        switch (isResizing) {
          case 'right':
            newWidth = Math.max(280, resizeStart.width + deltaX);
            break;
          case 'bottom':
            newHeight = Math.max(300, resizeStart.height + deltaY);
            break;
          case 'corner':
          case 'bottom-right':
            newWidth = Math.max(280, resizeStart.width + deltaX);
            newHeight = Math.max(300, resizeStart.height + deltaY);
            break;
          case 'left':
            newWidth = Math.max(280, resizeStart.width - deltaX);
            newX = resizeStart.posX + (resizeStart.width - newWidth);
            break;
          case 'top':
            newHeight = Math.max(300, resizeStart.height - deltaY);
            newY = resizeStart.posY + (resizeStart.height - newHeight);
            break;
          case 'top-left':
            newWidth = Math.max(280, resizeStart.width - deltaX);
            newHeight = Math.max(300, resizeStart.height - deltaY);
            newX = resizeStart.posX + (resizeStart.width - newWidth);
            newY = resizeStart.posY + (resizeStart.height - newHeight);
            break;
          case 'top-right':
            newWidth = Math.max(280, resizeStart.width + deltaX);
            newHeight = Math.max(300, resizeStart.height - deltaY);
            newY = resizeStart.posY + (resizeStart.height - newHeight);
            break;
          case 'bottom-left':
            newWidth = Math.max(280, resizeStart.width - deltaX);
            newHeight = Math.max(300, resizeStart.height + deltaY);
            newX = resizeStart.posX + (resizeStart.width - newWidth);
            break;
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, position, size]);

  return (
    <div
      ref={containerRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: '320px',
        minHeight: '350px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handles */}
      <div className="resize-handle absolute top-0 left-0 w-2 h-2 cursor-nw-resize" data-resize="top-left" />
      <div className="resize-handle absolute top-0 right-0 w-2 h-2 cursor-ne-resize" data-resize="top-right" />
      <div className="resize-handle absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize" data-resize="bottom-left" />
      <div className="resize-handle absolute bottom-0 right-0 w-2 h-2 cursor-se-resize" data-resize="bottom-right" />
      <div className="resize-handle absolute top-0 left-2 right-2 h-1 cursor-n-resize" data-resize="top" />
      <div className="resize-handle absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" data-resize="bottom" />
      <div className="resize-handle absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" data-resize="left" />
      <div className="resize-handle absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" data-resize="right" />

      <div className="drag-handle cursor-move bg-gray-50 px-3 py-2 border-b border-gray-200 rounded-t-lg flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Tim's Stupendous Copy/Paste-A-Thon</span>
        <div className="flex space-x-1">
          <Button
            onClick={saveConfiguration}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
            title="Save Configuration"
          >
            <Save className="w-3 h-3" />
          </Button>
          <Button
            onClick={triggerFileInput}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-500 hover:text-green-600"
            title="Load Configuration"
          >
            <Upload className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={loadConfiguration}
        className="hidden"
      />

      <Tabs defaultValue="edit" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-2 mb-0">
          <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
          <TabsTrigger value="copy" className="text-xs">Copy</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="p-3 space-y-3 flex-1 overflow-y-auto">
          {textItems.map((item) => (
            <div key={item.id} className="space-y-2 p-2 border border-gray-100 rounded">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={item.isFormatted}
                  onCheckedChange={(checked) => updateItemFormat(item.id, checked)}
                  className="scale-75"
                />
                <span className="text-xs text-gray-600 flex-1">
                  {item.isFormatted ? 'Formatted' : 'Plain'}
                </span>
                <Button
                  onClick={() => deleteItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
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

        <TabsContent value="copy" className="p-3 space-y-2 flex-1 overflow-y-auto">
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
