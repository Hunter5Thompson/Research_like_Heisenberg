import React, { useState, useEffect } from 'react';
import { PhysicistSelector } from './components/PhysicistSelector';
import { PaperCard } from './components/PaperCard';
import { RagChat } from './components/RagChat';
import { Paper, PhysicistName, ViewMode } from './types';
import { fetchPapersByPhysicist } from './services/geminiService';
import { Library, Search, MessageSquare, BookOpen, Loader } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>('discover');
  const [selectedPhysicist, setSelectedPhysicist] = useState<PhysicistName | null>(null);
  
  // Data State
  const [collectedPapers, setCollectedPapers] = useState<Paper[]>([]);
  const [discoveredPapers, setDiscoveredPapers] = useState<Paper[]>([]);
  
  // Loading State
  const [isFetching, setIsFetching] = useState(false);

  // Load initial papers when a physicist is selected
  useEffect(() => {
    const loadPapers = async () => {
      if (selectedPhysicist) {
        setIsFetching(true);
        setDiscoveredPapers([]); // Clear previous
        const papers = await fetchPapersByPhysicist(selectedPhysicist);
        
        // Add ID and physicist info
        const formattedPapers: Paper[] = papers.map((p, idx) => ({
          ...p,
          id: `${selectedPhysicist}-${idx}-${Date.now()}`,
          physicist: selectedPhysicist
        }));
        
        setDiscoveredPapers(formattedPapers);
        setIsFetching(false);
      }
    };
    loadPapers();
  }, [selectedPhysicist]);

  const handleCollect = (paper: Paper) => {
    if (!collectedPapers.find(p => p.title === paper.title)) {
      setCollectedPapers([...collectedPapers, { ...paper, collectedAt: new Date().toISOString() }]);
    }
  };

  const handleRemove = (paperId: string) => {
    setCollectedPapers(prev => prev.filter(p => p.id !== paperId));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Quantum Archives</h1>
              <p className="text-xs text-slate-400">Heisenberg • Pauli • Schrödinger • Dirac</p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'discover' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Search size={16} /> Discover
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'collection' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Library size={16} /> Collection 
              {collectedPapers.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{collectedPapers.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <MessageSquare size={16} /> RAG Chat
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Explore Quantum Mechanics</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Select a physicist to retrieve their most influential papers using Gemini. 
                Collect them to build your personal RAG knowledge base.
              </p>
            </div>

            <PhysicistSelector 
              selected={selectedPhysicist} 
              onSelect={setSelectedPhysicist} 
            />

            {isFetching && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p>Retrieving papers from the archive...</p>
              </div>
            )}

            {!isFetching && discoveredPapers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discoveredPapers.map((paper) => (
                  <PaperCard 
                    key={paper.id} 
                    paper={paper} 
                    isCollected={collectedPapers.some(p => p.title === paper.title)}
                    onCollect={() => handleCollect(paper)}
                  />
                ))}
              </div>
            )}
            
            {!selectedPhysicist && (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <p className="text-slate-500">Select a physicist above to begin your research.</p>
              </div>
            )}
          </div>
        )}

        {/* COLLECTION TAB */}
        {activeTab === 'collection' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Library className="text-blue-400" /> Your Knowledge Base
            </h2>
            
            {collectedPapers.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800">
                <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300 mb-2">Collection is Empty</h3>
                <p className="text-slate-500 mb-6">Go to Discover to find and collect papers.</p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Start Discovering
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collectedPapers.map((paper) => (
                  <PaperCard 
                    key={paper.id} 
                    paper={paper} 
                    isCollected={true} 
                    onRemove={() => handleRemove(paper.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Deep Archive Search</h2>
              <p className="text-slate-400 text-sm">
                Chat with Gemini 2.5 using Google Search Grounding. The model is aware of the papers in your collection.
              </p>
            </div>
            <RagChat collectedPapers={collectedPapers} />
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Quantum Archives. Built with Google Gemini API & React.</p>
      </footer>
    </div>
  );
}