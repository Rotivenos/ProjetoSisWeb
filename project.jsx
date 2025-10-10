import React, { useState, useRef } from 'react';
import { Upload, Image, Video, FileText, MapPin, Tag, Send, Heart, MessageCircle, User, Plus, Search, X } from 'lucide-react';

const API_URL = 'https://pl65pxj6t3sc3fw7bwzdcjth7u0nykbe.lambda-url.sa-east-1.on.aws/';

const MemoriesApp = () => {
  const [view, setView] = useState('feed');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    media_type: 'image',
    theme: '',
    location: '',
    description: '',
    file: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Detectar tipo de mídia
      if (file.type.startsWith('image/')) {
        setUploadForm(prev => ({ ...prev, media_type: 'image' }));
      } else if (file.type.startsWith('video/')) {
        setUploadForm(prev => ({ ...prev, media_type: 'video' }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && uploadForm.media_type !== 'text') {
      alert('Por favor, selecione um arquivo');
      return;
    }

    // Converter arquivo para base64
    let file_bytes_base64 = null;
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        file_bytes_base64 = reader.result.split(',')[1];
        
        const payload = {
          user_id: 'user123',
          media_type: uploadForm.media_type,
          theme: uploadForm.theme || 'general',
          location: uploadForm.location || '',
          description: uploadForm.description || '',
          file_name: selectedFile?.name || 'text-memory',
          file_bytes_base64: file_bytes_base64,
          content_type: selectedFile?.type || 'text/plain'
        };

        try {
  // Chamada real para sua API AWS
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Erro no upload');
  }

  const result = await response.json();
  
  // Adicionar a nova memória localmente
  const newMemory = {
    memory_id: result.memory_id,
    user_id: payload.user_id,
    media_type: payload.media_type,
    theme: payload.theme,
    location: payload.location,
    description: payload.description,
    created_at: Date.now(),
    likes: 0,
    comments: [],
    status: 'UPLOADED',
    tags: [],
    preview: previewUrl
  };
  
  setMemories(prev => [newMemory, ...prev]);
  setView('feed');
  
  // Limpar formulário
  setUploadForm({
    media_type: 'image',
    theme: '',
    location: '',
    description: '',
    file: null
  });
  setSelectedFile(null);
  setPreviewUrl(null);
  
  alert('Memória enviada com sucesso!');
} catch (error) {
  console.error('Erro ao enviar:', error);
  alert('Erro ao enviar memória: ' + error.message);
}
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // Upload apenas texto
      const payload = {
        user_id: 'user123',
        media_type: 'text',
        theme: uploadForm.theme || 'general',
        location: uploadForm.location || '',
        description: uploadForm.description || '',
      };
      
      const newMemory = {
        memory_id: `memory-${Date.now()}`,
        ...payload,
        created_at: Date.now(),
        likes: 0,
        comments: [],
        status: 'UPLOADED',
        tags: []
      };
      
      setMemories(prev => [newMemory, ...prev]);
      setView('feed');
      
      setUploadForm({
        media_type: 'image',
        theme: '',
        location: '',
        description: '',
        file: null
      });
      
      alert('Memória enviada com sucesso!');
    }
  };

  const handleLike = (memoryId) => {
    setMemories(prev => prev.map(m => 
      m.memory_id === memoryId 
        ? { ...m, likes: m.likes + 1 }
        : m
    ));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const MemoryCard = ({ memory }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{memory.user_id}</p>
            <p className="text-xs text-gray-500">{formatDate(memory.created_at)}</p>
          </div>
        </div>
        {memory.location && (
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{memory.location}</span>
          </div>
        )}
      </div>

      {/* Media */}
      {memory.media_type === 'image' && (
        <div className="bg-gray-100">
          {memory.preview ? (
            <img src={memory.preview} alt={memory.description} className="w-full h-96 object-cover" />
          ) : (
            <div className="w-full h-96 flex items-center justify-center">
              <Image className="w-24 h-24 text-gray-300" />
            </div>
          )}
        </div>
      )}
      
      {memory.media_type === 'video' && (
        <div className="bg-gray-900 w-full h-96 flex items-center justify-center">
          <Video className="w-24 h-24 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {memory.theme && (
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">#{memory.theme}</span>
          </div>
        )}
        
        {memory.description && (
          <p className="text-gray-800 mb-3">{memory.description}</p>
        )}

        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {memory.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-3 border-t">
          <button 
            onClick={() => handleLike(memory.memory_id)}
            className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{memory.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-700 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{memory.comments?.length || 0}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-700 hover:text-green-500 transition-colors ml-auto">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Memories
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-6 h-6 text-gray-700" />
              </button>
              <button 
                onClick={() => setView(view === 'upload' ? 'feed' : 'upload')}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all"
              >
                {view === 'upload' ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'feed' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Suas Memórias</h2>
            {memories.length === 0 ? (
              <div className="text-center py-16">
                <Image className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma memória ainda</p>
                <button 
                  onClick={() => setView('upload')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all"
                >
                  Criar sua primeira memória
                </button>
              </div>
            ) : (
              memories.map(memory => (
                <MemoryCard key={memory.memory_id} memory={memory} />
              ))
            )}
          </div>
        )}

        {view === 'upload' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova Memória</h2>
            
            {/* Tipo de mídia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Memória
              </label>
              <div className="flex gap-3">
                {['image', 'video', 'text'].map(type => (
                  <button
                    key={type}
                    onClick={() => setUploadForm(prev => ({ ...prev, media_type: type }))}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      uploadForm.media_type === type
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type === 'image' && <Image className="w-5 h-5 mx-auto mb-1" />}
                    {type === 'video' && <Video className="w-5 h-5 mx-auto mb-1" />}
                    {type === 'text' && <FileText className="w-5 h-5 mx-auto mb-1" />}
                    <span className="text-sm font-medium capitalize">{type === 'text' ? 'Texto' : type === 'image' ? 'Imagem' : 'Vídeo'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload de arquivo */}
            {uploadForm.media_type !== 'text' && (
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadForm.media_type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Clique para selecionar um arquivo</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {uploadForm.media_type === 'image' ? 'JPG, PNG ou GIF' : 'MP4 ou MOV'}
                      </p>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Tema */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <input
                type="text"
                value={uploadForm.theme}
                onChange={(e) => setUploadForm(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="ex: viagem, festa, família..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Localização */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={uploadForm.location}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Onde essa memória aconteceu?"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Conte a história dessa memória..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setView('feed')}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Publicar Memória
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MemoriesApp;