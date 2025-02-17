import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Calendar, 
  Hash, 
  Sparkles, 
  Compass, 
  Clock, 
  Settings, 
  ListFilter,
  Archive,
  Tag
} from 'lucide-react';

// Local storage key
const STORAGE_KEY = 'thoughtflow_notes';

// Helper function to load notes from localStorage
const loadNotes = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading notes:', e);
      return [];
    }
  }
  return [];
};

// Helper function to save notes to localStorage
const saveNotes = (notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export default function NoteApp() {
  const [notes, setNotes] = useState(() => loadNotes());
  const [currentNote, setCurrentNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [view, setView] = useState('capture');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = loadNotes();
    setNotes(savedNotes);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // AI tag suggestion system
  const suggestTags = (content) => {
    const keywords = {
      meeting: ['meetings', 'work'],
      task: ['tasks', 'todo'],
      idea: ['ideas', 'creativity'],
      research: ['research', 'learning'],
      project: ['projects', 'work']
    };

    const contentLower = content.toLowerCase();
    const suggestedTags = new Set();

    Object.entries(keywords).forEach(([keyword, tags]) => {
      if (contentLower.includes(keyword)) {
        tags.forEach(tag => suggestedTags.add(tag));
      }
    });

    return Array.from(suggestedTags);
  };

  // Find related notes based on content similarity
  const findRelatedNotes = (content) => {
    return notes
      .filter(note => {
        const contentWords = content.toLowerCase().split(' ');
        const noteWords = note.content.toLowerCase().split(' ');
        const commonWords = contentWords.filter(word => 
          word.length > 4 && noteWords.includes(word)
        );
        return commonWords.length > 0;
      })
      .slice(0, 3)
      .map(note => ({
        id: note.id,
        preview: note.content.slice(0, 100) + '...'
      }));
  };

  const handleNoteSave = () => {
    if (currentNote.trim()) {
      const suggestedTags = suggestTags(currentNote);
      const relatedNotes = findRelatedNotes(currentNote);
      
      const newNote = {
        id: Date.now(),
        content: currentNote,
        timestamp: new Date().toISOString(),
        tags: suggestedTags,
        related: relatedNotes
      };

      setNotes([newNote, ...notes]);
      setCurrentNote('');
      setShowSuggestions(true);
      setTimeout(() => setShowSuggestions(false), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleNoteSave();
    }
  };

  // Filter notes based on search and tags
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery.toLowerCase().split(' ').every(term =>
      note.content.toLowerCase().includes(term)
    );
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Get unique tags from all notes
  const allTags = Array.from(new Set(
    notes.flatMap(note => note.tags)
  )).sort();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Thoughtflow
          </h1>
          <div className="flex gap-4">
            {[
              { icon: Plus, id: 'capture', title: 'Capture' },
              { icon: Search, id: 'browse', title: 'Browse' },
              { icon: Compass, id: 'discover', title: 'Discover' },
              { icon: Clock, id: 'timeline', title: 'Timeline' },
              { icon: Settings, id: 'settings', title: 'Settings' }
            ].map(({ icon: Icon, id, title }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`p-2 rounded transition-colors ${
                  view === id 
                    ? 'bg-blue-100 text-blue-600' 
                    : darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={title}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Capture View */}
        {view === 'capture' && (
          <div className="space-y-4">
            <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <textarea
                className={`w-full h-32 p-4 text-lg border-none focus:ring-0 resize-none bg-transparent ${
                  darkMode ? 'text-white placeholder-gray-500' : 'text-gray-800'
                }`}
                placeholder="Just start typing..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex justify-between items-center text-sm mt-2 px-4">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Shift + Enter to save
                </span>
                {currentNote && (
                  <button
                    onClick={handleNoteSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                )}
              </div>
            </Card>

            {showSuggestions && notes.length > 0 && (
              <Card className={`p-4 ${
                darkMode 
                  ? 'bg-blue-900 border-blue-800' 
                  : 'bg-blue-50 border-blue-100'
              }`}>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Sparkles size={16} />
                  <span className="font-medium">AI Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {notes[0].tags.map((tag) => (
                    <span 
                      key={tag} 
                      className={`px-2 py-1 rounded-full text-sm ${
                        darkMode 
                          ? 'bg-blue-800 text-blue-200' 
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {notes[0].related.length > 0 && (
                  <div className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="font-medium mb-1">Related notes:</div>
                    {notes[0].related.map((note) => (
                      <div key={note.id} className="ml-2">• {note.preview}</div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className={`p-4 hover:shadow-md transition-shadow ${
                    darkMode ? 'bg-gray-800 border-gray-700' : ''
                  }`}
                >
                  <div className={darkMode ? 'text-white' : 'text-gray-800'}>
                    {note.content}
                  </div>
                  <div className={`flex items-center gap-4 mt-3 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(note.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash size={14} />
                      {note.tags.join(', ')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Browse View */}
        {view === 'browse' && (
          <div className="space-y-4">
            <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    className={`w-full p-2 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border'
                    }`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className={`p-2 rounded-lg ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <ListFilter size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? darkMode 
                          ? 'bg-blue-900 text-blue-200' 
                          : 'bg-blue-100 text-blue-600'
                        : darkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => {
                      setSelectedTags(
                        selectedTags.includes(tag)
                          ? selectedTags.filter((t) => t !== tag)
                          : [...selectedTags, tag]
                      );
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Settings View */}
        {view === 'settings' && (
          <div className="space-y-6">
            <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className={`font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Appearance
                  </h3>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Dark mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}