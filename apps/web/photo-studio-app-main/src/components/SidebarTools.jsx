import React from 'react';
import { 
  MousePointer, 
  Crop,
  Pencil, 
  Type, 
  Square, 
  SlidersHorizontal,
  ImagePlus,
  FileCode,
  Film
} from 'lucide-react';

export default function SidebarTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'select', name: 'Seç / Taşı', icon: MousePointer },
    { id: 'crop', name: 'Kırp', icon: Crop },
    { id: 'adjustments', name: 'Ayarlar', icon: SlidersHorizontal },
    { id: 'brush', name: 'Çizim', icon: Pencil },
    { id: 'text', name: 'Metin', icon: Type },
    { id: 'overlay', name: 'Görsel Ekle', icon: ImagePlus },
    { id: 'video', name: 'Video Modu', icon: Film },
    { id: 'metadata', name: 'Metadata', icon: FileCode },
  ];

  return (
    <aside className="tools-sidebar">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id || (tool.id === 'brush' && activeTool === 'eraser');
        return (
          <button
            key={tool.id}
            className={`tool-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
            title={tool.name}
          >
            <Icon size={20} />
            <span>{tool.name}</span>
          </button>
        );
      })}
    </aside>
  );
}
