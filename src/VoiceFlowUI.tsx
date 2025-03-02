import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
// import '@xyflow/react/dist/style.css';
import './index.css';

// Custom node component
const CustomNode = ({ data, isConnectable, selected }) => {
  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 shadow-md ${
      data.active ? 'shadow-lg scale-105' : ''
    } ${data.style}`}>
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${data.iconBg}`}>
          {data.icon}
        </div>
        <div className="font-medium text-foreground">{data.label}</div>
        {data.subtitle && (
          <div className="text-xs text-muted-foreground mt-1">{data.subtitle}</div>
        )}
      </div>
      {data.active && (
        <div className="absolute inset-0 rounded-lg animate-pulse opacity-20 bg-primary" />
      )}
    </div>
  );
};

// Node types mapping
const nodeTypes = {
  custom: CustomNode,
};

const VoiceFlowUI = () => {
  const [activeState, setActiveState] = useState('idle'); // 'idle', 'user', 'llm'
  const [audioData, setAudioData] = useState([]);
  const [vumeterValues, setVumeterValues] = useState(Array(20).fill(0));
  const [confidence, setConfidence] = useState(0.95);
  
  // Initial nodes with styling based on your theme
  const initialNodes = [
    {
      id: 'user',
      type: 'custom',
      position: { x: 100, y: 300 },
      data: {
        label: 'You',
        active: false,
        style: 'bg-card border-border',
        iconBg: 'bg-primary/10 text-primary',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      }
    },
    {
      id: 'processing',
      type: 'custom',
      position: { x: 400, y: 150 },
      data: {
        label: 'Processing',
        active: false,
        style: 'bg-card border-border',
        iconBg: 'bg-chart-4/10 text-chart-4',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      }
    },
    {
      id: 'memory',
      type: 'custom',
      position: { x: 700, y: 150 },
      data: {
        label: 'Memory',
        active: false,
        style: 'bg-card border-border',
        iconBg: 'bg-chart-2/10 text-chart-2',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      }
    },
    {
      id: 'llm',
      type: 'custom',
      position: { x: 700, y: 300 },
      data: {
        label: 'AI Assistant',
        active: false,
        style: 'bg-card border-border',
        iconBg: 'bg-chart-5/10 text-chart-5',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      }
    },
    {
      id: 'context',
      type: 'custom',
      position: { x: 400, y: 450 },
      data: {
        label: 'Context',
        active: false,
        style: 'bg-card border-border',
        iconBg: 'bg-chart-1/10 text-chart-1',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    }
  ];

  // Initial edges with styling
  const initialEdges = [
    {
      id: 'user-to-processing',
      source: 'user',
      target: 'processing',
      animated: false,
      style: { stroke: 'var(--chart-4)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--chart-4)',
      },
    },
    {
      id: 'processing-to-llm',
      source: 'processing',
      target: 'llm',
      animated: false,
      style: { stroke: 'var(--chart-2)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--chart-2)',
      },
    },
    {
      id: 'llm-to-user',
      source: 'llm',
      target: 'user',
      animated: false,
      style: { stroke: 'var(--chart-5)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--chart-5)',
      },
    },
    {
      id: 'memory-to-llm',
      source: 'memory',
      target: 'llm',
      animated: false,
      style: { stroke: 'var(--chart-2)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--chart-2)',
      },
    },
    {
      id: 'llm-to-memory',
      source: 'llm',
      target: 'memory',
      animated: false,
      style: { stroke: 'var(--chart-5)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--chart-5)',
      },
    },
    {
      id: 'context-to-processing',
      source: 'context',
      target: 'processing',
      animated: false,
      style: { stroke: 'var(--chart-1)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--chart-1)',
      },
    },
    {
      id: 'user-to-context',
      source: 'user',
      target: 'context',
      animated: false,
      style: { stroke: 'var(--primary)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--primary)',
      },
    }
  ];

  // Set up nodes and edges with React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Simulate audio data
  useEffect(() => {
    const generateAudioData = () => {
      const baseFrequency = activeState === 'user' ? 0.05 : 0.03;
      const baseAmplitude = activeState === 'user' ? 40 : 30;
      const complexity = activeState === 'user' ? 3 : 5;
      
      return Array.from({ length: 150 }, (_, i) => {
        let value = 0;
        for (let j = 1; j <= complexity; j++) {
          value += Math.sin(i * baseFrequency * j) * (baseAmplitude / j);
        }
        return value + (activeState === 'idle' ? 0 : (Math.random() * 15 - 7.5));
      });
    };
    
    const intervalId = setInterval(() => {
      if (activeState !== 'idle') {
        setAudioData(generateAudioData());
        
        // Update VU meter values
        setVumeterValues(prev => {
          const newValue = activeState === 'idle' ? 0 : 
                          activeState === 'user' ? 0.3 + Math.random() * 0.7 : 
                          0.2 + Math.random() * 0.5;
          return [...prev.slice(1), newValue];
        });
        
        // Randomly update confidence when user is speaking
        if (activeState === 'user' && Math.random() > 0.8) {
          setConfidence(0.75 + Math.random() * 0.2);
        }
      } else {
        setAudioData(Array(150).fill(0));
        setVumeterValues(prev => [...prev.slice(1), 0]);
      }
    }, 50);
    
    return () => clearInterval(intervalId);
  }, [activeState]);

  // Update nodes based on active state
  useEffect(() => {
    let activeNodeIds = [];
    let animatedEdgeIds = [];
    
    if (activeState === 'user') {
      activeNodeIds = ['user', 'processing', 'context'];
      animatedEdgeIds = ['user-to-processing', 'user-to-context'];
    } else if (activeState === 'llm') {
      activeNodeIds = ['llm', 'processing', 'memory'];
      animatedEdgeIds = ['processing-to-llm', 'memory-to-llm', 'llm-to-user'];
    }
    
    // Update node activity states
    setNodes(nds => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        active: activeNodeIds.includes(node.id),
        subtitle: getNodeSubtitle(node.id, activeState)
      }
    })));
    
    // Update edge animation states
    setEdges(eds => eds.map(edge => ({
      ...edge,
      animated: animatedEdgeIds.includes(edge.id),
      style: {
        ...edge.style,
        strokeWidth: animatedEdgeIds.includes(edge.id) ? 3 : 2,
        opacity: animatedEdgeIds.includes(edge.id) ? 1 : 0.3,
      }
    })));
  }, [activeState, setNodes, setEdges]);
  
  // Helper function to get node subtitle based on state
  const getNodeSubtitle = (nodeId, activeState) => {
    if (activeState === 'idle') return null;
    
    if (nodeId === 'user' && activeState === 'user') return 'Speaking...';
    if (nodeId === 'llm' && activeState === 'llm') return 'Responding...';
    if (nodeId === 'processing' && activeState !== 'idle') return 'Analyzing...';
    if (nodeId === 'memory' && activeState === 'llm') return 'Retrieving...';
    if (nodeId === 'context' && activeState === 'user') return 'Building...';
    
    return null;
  };
  
  // Toggle the active speaking state
  const toggleSpeakingState = useCallback(() => {
    setActiveState(current => {
      if (current === 'idle') return 'user';
      if (current === 'user') return 'llm';
      return 'idle';
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-background">
      {/* Main visualization area */}
      <div className="relative w-full h-screen overflow-hidden bg-background">
        {/* Status indicator */}
        <div className="absolute top-4 left-4 z-30 bg-card bg-opacity-80 rounded-lg p-3 shadow-md flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              activeState === 'idle' ? 'bg-muted' : 
              activeState === 'user' ? 'bg-chart-4 animate-pulse' : 
              'bg-chart-5 animate-pulse'
            }`} />
            <span className="text-lg font-medium text-foreground">
              {activeState === 'idle' ? 'System Idle' : 
               activeState === 'user' ? 'Listening...' : 
               'AI Responding...'}
            </span>
          </div>
          
          {/* VU meter */}
          <div className="h-5 flex items-end space-x-1">
            {vumeterValues.map((value, i) => (
              <div 
                key={i} 
                className="w-2 rounded-t transition-all duration-100"
                style={{
                  height: `${value * 100}%`,
                  backgroundColor: activeState === 'user' 
                    ? `hsl(43 74% ${66 - value * 30}%)` 
                    : `hsl(27 87% ${67 - value * 30}%)`
                }}
              />
            ))}
          </div>
          
          {/* Confidence meter - only show when user is speaking */}
          {activeState === 'user' && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">Recognition Confidence</div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-chart-2 transition-all duration-300"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{Math.round(confidence * 100)}%</div>
            </div>
          )}
        </div>
        
        {/* Wave visualization */}
        <div className="absolute top-4 right-4 w-1/3 h-24 bg-card bg-opacity-30 rounded-lg flex items-center justify-center overflow-hidden z-20">
          <svg width="100%" height="100%" viewBox="0 0 1200 100">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={activeState === 'user' ? 'var(--chart-4)' : 'var(--chart-5)'} />
                <stop offset="100%" stopColor={activeState === 'user' ? 'var(--chart-3)' : 'var(--chart-1)'} />
              </linearGradient>
            </defs>
            <path 
              d={`M 0,50 ${audioData.map((v, i) => `L ${i * 8},${50 - v}`).join(' ')}`}
              fill="none" 
              stroke="url(#waveGradient)" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeState === 'idle' ? 0.3 : 0.8}
            />
          </svg>
        </div>
        
        {/* React Flow */}
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#ccc" gap={16} />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
      </div>
      
      {/* Control buttons */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-30">
        <button
          onClick={toggleSpeakingState}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-full transition-all font-medium text-lg shadow-lg flex items-center"
        >
          {activeState === 'idle' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Speaking
            </>
          ) : activeState === 'user' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Get AI Response
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Reset
            </>
          )}
        </button>
        
        <button
          onClick={() => setActiveState('idle')}
          className="px-6 py-4 bg-secondary text-secondary-foreground rounded-full transition-colors font-medium text-lg shadow-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Stop
        </button>
      </div>
    </div>
  );
};

export default VoiceFlowUI;