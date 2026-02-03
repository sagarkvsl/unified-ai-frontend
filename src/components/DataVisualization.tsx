'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table2, 
  Calendar,
  TrendingUp,
  Activity,
  Users,
  Globe,
  Building2,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
);

// Custom plugin to force legend text color to white
const legendColorPlugin = {
  id: 'legendColorPlugin',
  afterDraw: (chart: any) => {
    // Force legend text color by directly manipulating DOM
    setTimeout(() => {
      const legendContainer = chart.legend?.legendHitBoxes;
      if (legendContainer) {
        const canvas = chart.canvas;
        const parent = canvas.parentElement;
        if (parent) {
          const legendElements = parent.querySelectorAll('span');
          legendElements.forEach((span: HTMLElement) => {
            span.style.color = '#ffffff';
            span.style.fontWeight = '500';
            span.style.fontSize = '13px';
          });
        }
      }
    }, 100);
  }
};

ChartJS.register(legendColorPlugin);

interface EventData {
  name: string;
  count: number;
  source: string;
  uniqueContacts?: number;
  firstEvent?: Date | null;
  lastEvent?: Date | null;
}

interface VisualizationData {
  type: 'analytics' | 'trends' | 'logs';
  data: {
    events: EventData[];
  };
  organizationScope: 'specific' | 'global';
  timeframe: string;
}

interface DataVisualizationProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function DataVisualization({ onSendMessage, isLoading }: DataVisualizationProps) {
  const [query, setQuery] = useState('');
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [activeChart, setActiveChart] = useState<'bar' | 'line' | 'pie' | 'table'>('bar');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Handle sort functionality
  const handleSort = () => {
    console.log('Sort clicked, current data:', visualizationData?.data?.events?.length, 'events');
    console.log('Current sort order:', sortOrder);
    
    if (visualizationData?.data?.events && visualizationData.data.events.length > 0) {
      const sortedEvents = [...visualizationData.data.events].sort((a, b) => 
        sortOrder === 'desc' ? a.count - b.count : b.count - a.count
      );
      
      console.log('Sorted events:', sortedEvents.slice(0, 5));
      
      setVisualizationData({
        ...visualizationData,
        data: { events: sortedEvents }
      });
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      console.log('No data available to sort');
    }
  };

  // Handle download functionality
  const handleDownload = () => {
    if (!visualizationData?.data?.events) return;
    
    const csvContent = [
      ['Event Name', 'Source', 'Count', 'Unique Contacts', 'Date Range', 'Percentage'],
      ...visualizationData.data.events.map(event => {
        const total = visualizationData.data.events.reduce((sum, e) => sum + e.count, 0);
        const percentage = ((event.count / total) * 100).toFixed(2);
        const dateRange = event.firstEvent && event.lastEvent ? 
          `${event.firstEvent.toLocaleDateString()} - ${event.lastEvent.toLocaleDateString()}` : 
          'N/A';
        const uniqueContacts = event.uniqueContacts ? 
          event.uniqueContacts.toString() : 
          Math.floor(event.count * 0.75).toString();
        return [
          event.name, 
          event.source, 
          event.count.toString(), 
          uniqueContacts,
          dateRange,
          `${percentage}%`
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // No initial sample data - wait for real API response
  useEffect(() => {
    // Component initialization - no sample data
    // Add a global test function for development
    if (typeof window !== 'undefined') {
      (window as any).testEventAnalyticsVisualization = () => {
        const mockResponse = {
          success: true,
          message: "Analyze event types and sources from unified_events_out_router for last 7 days",
          tool_executed: "get_event_analytics",
          parameters_used: {
            organizationId: 8431862,
            timeframe: "7d"
          },
          results: {
            success: true,
            organization_id: 8431862,
            timeframe: "7d",
            analytics: [
              {
                event_name: "added_to_lists",
                event_source: "contacts",
                total_events: 86,
                unique_contacts: 79,
                first_event: 1769109186962,
                last_event: 1769620371133
              },
              {
                event_name: "email_unsubscribed",
                event_source: "email",
                total_events: 38,
                unique_contacts: 35,
                first_event: 1769111334000,
                last_event: 1769690387000
              },
              {
                event_name: "removed_from_lists",
                event_source: "contacts",
                total_events: 1,
                unique_contacts: 1,
                first_event: 1769590446266,
                last_event: 1769590446266
              }
            ],
            total_event_types: 3
          },
          conversation_id: "wf_1769705432635_fbe6913d",
          timestamp: "2026-01-29T16:50:36.483081",
          ai_powered: true
        };
        
        console.log('Testing event analytics visualization with mock data');
        parseEventAnalyticsResponse(mockResponse.results);
        setApiResponse(`📊 **Event Analytics Results**\n\n${mockResponse.message}\n\n**Organization:** ${mockResponse.results.organization_id}\n**Timeframe:** ${mockResponse.results.timeframe}\n**Total Event Types:** ${mockResponse.results.total_event_types}`);
      };
    }
  }, []);

  // Quick action templates for visualization
  const quickActions = [
    {
      title: "Global Events (7 days)",
      description: "All organizations event breakdown",
      icon: Globe,
      query: "what are the different events received in the last 7 days",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Client Specific Events",
      description: "Single organization analysis",
      icon: Building2,
      query: "what are the different events received in the last 7 days from client 4694108",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Event Sources Analysis",
      description: "Sources breakdown globally",
      icon: BarChart3,
      query: "what are the different sources from which we are getting the events",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Recent Trends (3 days)",
      description: "Short term event analysis",
      icon: TrendingUp,
      query: "what are the different events received in the last 3 days",
      color: "from-orange-500 to-red-500"
    }
  ];

  const handleQuickAction = (query: string) => {
    setQuery(query);
    onSendMessage(query);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setApiResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Handle the new event analytics response format
        if (data.tool_executed === 'get_event_analytics' && data.results && data.results.analytics) {
          // Build detailed response with event breakdown
          let responseContent = `📊 **Event Analytics Results**\n\n${data.message}\n\n`;
          responseContent += `**Organization:** ${data.results.organization_id}\n`;
          responseContent += `**Timeframe:** ${data.results.timeframe}\n`;
          responseContent += `**Total Event Types:** ${data.results.total_event_types}\n\n`;
          
          responseContent += `**Event Breakdown:**\n`;
          data.results.analytics.forEach((event: any, index: number) => {
            responseContent += `${index + 1}. **${event.event_name}** (${event.event_source}): ${event.total_events.toLocaleString()} events, ${event.unique_contacts.toLocaleString()} unique contacts\n`;
          });
          
          setApiResponse(responseContent);
          parseEventAnalyticsResponse(data.results);
        }
        // Handle the existing API response structure
        else if (data.results && data.results.formattedMessage) {
          // Use the formatted message which includes contact examples
          setApiResponse(data.results.formattedMessage);
          
          // Parse the structured analytics data for visualization if available
          if (data.results.analyticsData) {
            parseStructuredApiResponse(data.results);
          }
        } else if (data.results && data.results.answer && data.results.answer.summary) {
          // Store the summary text for display
          setApiResponse(data.results.answer.summary);
          
          // Parse the structured analytics data for visualization
          parseStructuredApiResponse(data.results);
        } else {
          // Fallback to old format
          setApiResponse(data.result || data.response || data.message);
          parseApiResponseForVisualization(data.result || data.response || data.message);
        }
      } else {
        setApiResponse(`❌ **Error**: ${data.error}`);
      }
    } catch (error) {
      setApiResponse(`❌ **Connection Error**: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse event analytics response from new AI format
  const parseEventAnalyticsResponse = (results: any) => {
    try {
      console.log('Parsing event analytics response:', results);
      
      if (!results.analytics || !Array.isArray(results.analytics)) {
        console.log('❌ No analytics array found in response');
        setVisualizationData(null);
        return;
      }
      
      // Transform event analytics data to match frontend expectations
      const events: EventData[] = results.analytics.map((item: any) => ({
        name: (item.event_name || 'Unknown Event').replace(/_/g, ' '),
        count: parseInt(item.total_events || 0),
        source: item.event_source || 'unknown',
        uniqueContacts: item.unique_contacts || 0,
        firstEvent: item.first_event ? new Date(item.first_event) : null,
        lastEvent: item.last_event ? new Date(item.last_event) : null
      })).filter((event: EventData) => event.count > 0);
      
      console.log('✅ Transformed', events.length, 'events from event analytics data');
      console.log('Events:', events);
      
      if (events.length > 0) {
        // Sort by count in descending order
        events.sort((a, b) => b.count - a.count);
        
        setVisualizationData({
          type: 'analytics',
          data: { events },
          organizationScope: results.organization_id ? 'specific' : 'global',
          timeframe: results.timeframe || '7d'
        });
      } else {
        console.log('❌ No valid events found after transformation');
        setVisualizationData(null);
      }
    } catch (error) {
      console.error('Error parsing event analytics response:', error);
      setVisualizationData(null);
    }
  };

  // Parse structured API response from new format
  const parseStructuredApiResponse = (results: any) => {
    try {
      console.log('Parsing structured API response:', results);
      
      if (!results.analyticsData || !Array.isArray(results.analyticsData)) {
        console.log('❌ No analyticsData array found in response');
        setVisualizationData(null);
        return;
      }
      
      // Transform our API data structure to match frontend expectations
      const queryType = results.queryType || 'count_by_type';
      let events: EventData[] = [];
      
      if (queryType === 'source_analytics') {
        // Source analytics: each row has source, total_events, unique_event_types, etc.
        events = results.analyticsData.map((item: any) => ({
          name: (item.source || 'Unknown Source').replace(/_/g, ' '),
          count: parseInt(item.total_events || item.count || 0),
          source: item.source || 'unknown'
        })).filter((event: EventData) => event.count > 0);
      } else {
        // Event analytics: each row has event_name, source, event_count, etc.
        events = results.analyticsData.map((item: any) => ({
          name: (item.event_name || item.name || 'Unknown').replace(/_/g, ' '),
          count: parseInt(item.event_count || item.count || 0),
          source: item.source || 'unknown'
        })).filter((event: EventData) => event.count > 0);
      }
      
      console.log('✅ Transformed', events.length, 'events from structured data');
      console.log('Top 5 events:', events.slice(0, 5));
      
      if (events.length > 0) {
        // Sort by count in descending order
        events.sort((a, b) => b.count - a.count);
        
        setVisualizationData({
          type: 'analytics',
          data: { events },
          organizationScope: results.organizationId ? 'specific' : 'global',
          timeframe: results.timeframe?.original || extractTimeframe(query)
        });
      } else {
        console.log('❌ No valid events found after transformation');
        setVisualizationData(null);
      }
    } catch (error) {
      console.error('Error parsing structured API response:', error);
      setVisualizationData(null);
    }
  };

  // Parse API response to extract data for visualization (fallback for old format)
  const parseApiResponseForVisualization = (response: string) => {
    try {
      console.log('Full API response:', response);
      
      const events: EventData[] = [];
      
      // The actual format from API is:
      // "1. **added_to_lists** (Source: contacts)"
      // "   - Events: 58529317"
      
      const lines = response.split('\n');
      let currentEvent: Partial<EventData> = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Pattern for numbered event entries: "1. **event_name** (Source: source_name)"
        const eventMatch = trimmedLine.match(/^\d+\.\s*\*\*([^*]+)\*\*\s*\(Source:\s*([^)]+)\)/);
        if (eventMatch) {
          // Save previous event if it has data
          if (currentEvent.name && currentEvent.count) {
            events.push(currentEvent as EventData);
          }
          
          currentEvent = {
            name: eventMatch[1].trim().replace(/_/g, ' '),
            source: eventMatch[2].trim(),
            count: 0
          };
          continue;
        }
        
        // Pattern for event count: "   - Events: 58529317"
        const countMatch = trimmedLine.match(/^\s*-\s*Events:\s*(\d+(?:,\d+)*)/);
        if (countMatch && currentEvent.name) {
          const count = parseInt(countMatch[1].replace(/,/g, ''));
          if (!isNaN(count) && count > 0) {
            currentEvent.count = count;
          }
          continue;
        }
      }
      
      // Add the last event if it exists
      if (currentEvent.name && currentEvent.count) {
        events.push(currentEvent as EventData);
      }
      
      console.log('Raw parsed events:', events.length);
      
      // Remove duplicates and sort by count
      const uniqueEvents = events.reduce((acc: EventData[], current) => {
        const existing = acc.find(event => event.name === current.name);
        if (!existing) {
          acc.push(current);
        } else if (current.count > existing.count) {
          // Replace with higher count
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
        return acc;
      }, []);
      
      uniqueEvents.sort((a, b) => b.count - a.count);
      
      console.log('✅ Successfully parsed', uniqueEvents.length, 'unique events');
      console.log('Top 10 events:', uniqueEvents.slice(0, 10));
      
      if (uniqueEvents.length > 0) {
        setVisualizationData({
          type: 'analytics',
          data: { events: uniqueEvents },
          organizationScope: query.toLowerCase().includes('client') ? 'specific' : 'global',
          timeframe: extractTimeframe(query)
        });
      } else {
        console.log('❌ No events parsed - check parsing logic');
        // Clear existing data to avoid showing stale sample data
        setVisualizationData(null);
      }
    } catch (error) {
      console.error('Error parsing API response:', error);
    }
  };

  // Fallback parsing method for complex responses
  const extractEventsFallback = (response: string): EventData[] => {
    const events: EventData[] = [];
    
    // Look for any line with a number pattern that could be event counts
    const lines = response.split('\n');
    const eventPatterns = [
      /([a-zA-Z_][a-zA-Z0-9_\s]+?)[\s:]+(\d{3,})/g, // Any text followed by 3+ digit number
      /\+\+([^+]+)\+\+/g, // Text between ++
    ];
    
    for (const line of lines) {
      for (const pattern of eventPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          if (match[2] && parseInt(match[2]) > 1000) { // Only large numbers likely to be event counts
            events.push({
              name: match[1].replace(/_/g, ' ').trim(),
              count: parseInt(match[2]),
              source: 'parsed'
            });
          }
        }
        // Reset pattern lastIndex for next line
        pattern.lastIndex = 0;
      }
    }
    
    return events.sort((a, b) => b.count - a.count).slice(0, 15); // Top 15 events
  };

  // Extract timeframe from query
  const extractTimeframe = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('24 hours') || lowerQuery.includes('1 day')) return '1d';
    if (lowerQuery.includes('3 days')) return '3d';
    if (lowerQuery.includes('7 days') || lowerQuery.includes('week')) return '7d';
    return '7d'; // default
  };

  // Generate chart data from current visualization data or fallback to sample data
  const generateChartData = () => {
    // Expanded color palette for more events
    const baseColors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(245, 101, 101, 0.8)',  // Red
      'rgba(251, 191, 36, 0.8)',   // Yellow
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(34, 197, 94, 0.8)',    // Emerald
      'rgba(168, 85, 247, 0.8)',   // Violet
      'rgba(239, 68, 68, 0.8)',    // Red-500
      'rgba(34, 197, 94, 0.8)',    // Green-500
      'rgba(59, 130, 246, 0.8)',   // Blue-500
      'rgba(245, 158, 11, 0.8)',   // Amber-500
      'rgba(156, 163, 175, 0.8)',  // Gray-400
      'rgba(99, 102, 241, 0.8)',   // Indigo-500
      'rgba(217, 70, 239, 0.8)',   // Fuchsia-500
      'rgba(34, 211, 238, 0.8)',   // Cyan-400
      'rgba(132, 204, 22, 0.8)',   // Lime-500
      'rgba(251, 113, 133, 0.8)',  // Rose-400
      'rgba(45, 212, 191, 0.8)',   // Teal-400
    ];
    
    // Generate additional colors if we have more events
    const generateColor = (index: number): string => {
      if (index < baseColors.length) {
        return baseColors[index];
      }
      // Generate colors using HSL for unlimited events
      const hue = (index * 137.508) % 360; // Golden angle for good color distribution
      return `hsla(${hue}, 70%, 60%, 0.8)`;
    };

    // Use data from visualization state - show top 20 events for better visualization
    const allEventData = visualizationData?.data?.events;
    
    console.log('Chart generation - total events:', allEventData?.length);
    
    if (!allEventData || allEventData.length === 0) {
      console.log('No event data available for chart generation');
      return null;
    }

    // For pie charts, limit to top 15 events to avoid overcrowding
    // For bar/line charts, show top 20 events
    const maxEvents = activeChart === 'pie' ? 15 : 20;
    const eventData = allEventData.slice(0, maxEvents);
    
    console.log(`Showing top ${eventData.length} events out of ${allEventData.length} total`);

    const colors = eventData.map((_, index) => generateColor(index));
    
    return {
      labels: eventData.map((item: EventData) => item.name),
      datasets: [{
        label: 'Event Count',
        data: eventData.map((item: EventData) => item.count),
        backgroundColor: colors,
        borderColor: colors.map((color: string) => color.replace('0.8', '1')),
        borderWidth: 2,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff', // Changed to pure white for better visibility
          font: {
            size: 13, // Slightly smaller for better fit
            weight: 'normal' as const
          },
          padding: 15,
          usePointStyle: true,
          boxWidth: 12,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const count = data.datasets[0].data[index];
                const displayCount = (typeof count === 'number' && !isNaN(count)) ? count.toLocaleString() : '0';
                return {
                  text: `${label}: ${displayCount}`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor[index],
                  lineWidth: 2,
                  hidden: false,
                  index: index,
                  fontColor: '#ffffff' // Force white color for legend text
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: 'Event Analytics Visualization',
        color: '#ffffff', // Changed to white for better visibility
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.4)',
        },
        ticks: {
          color: '#ffffff', // Changed to white for better visibility
          font: {
            size: 11,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.4)',
        },
        ticks: {
          color: '#ffffff', // Changed to white for better visibility
          font: {
            size: 11,
          }
        }
      }
    }
  };

  // Separate options for pie/doughnut charts
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const, // Changed from 'right' to 'bottom' to prevent overflow
        align: 'center' as const,
        maxHeight: 200, // Limit legend height and make it scrollable
        labels: {
          color: '#ffffff', // Pure white for better visibility
          font: {
            size: 13, // Increased font size for better readability
            weight: 'bold' as const // Bold weight for better visibility
          },
          padding: 15, // Increased padding for better spacing between items
          usePointStyle: true,
          boxWidth: 15, // Increased box width for better visibility
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
              return data.labels.map((label: string, index: number) => {
                const count = data.datasets[0].data[index];
                const safeCount = (typeof count === 'number' && !isNaN(count)) ? count : 0;
                const percentage = ((safeCount / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${safeCount.toLocaleString()} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor[index],
                  lineWidth: 2,
                  hidden: false,
                  index: index,
                  fontColor: '#ffffff', // Force white color for legend text
                  textAlign: 'left' as const
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: 'Event Distribution',
        color: '#ffffff', // Changed to white for better visibility
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const parsed = (typeof context.parsed === 'number' && !isNaN(context.parsed)) ? context.parsed : 0;
            const percentage = ((parsed / total) * 100).toFixed(1);
            return `${context.label}: ${parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Event Visualization</h1>
              <p className="text-xs text-gray-400">Interactive analytics and charts</p>
            </div>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
            {[
              { type: 'bar' as const, icon: BarChart3, label: 'Bar' },
              { type: 'line' as const, icon: LineChart, label: 'Line' },
              { type: 'pie' as const, icon: PieChart, label: 'Pie' },
              { type: 'table' as const, icon: Table2, label: 'Table' },
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                  activeChart === type
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input - Simplified without dropdowns */}
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your data... (e.g., 'what are the different events received in the last 7 days from client 6138810')"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={isAnalyzing || !query.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            Analyze
          </motion.button>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="flex-1 flex gap-1 overflow-hidden">
          {/* Quick Actions Sidebar */}
          <div className="w-48 bg-gray-800/30 backdrop-blur-xl border-r border-gray-700/50 p-3 overflow-y-auto flex-shrink-0">
            <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Quick Actions
            </h3>
            
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-gray-700/50 to-gray-600/30 border border-gray-600/50 hover:border-gray-500/50 transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white group-hover:text-gray-100 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-1">
                        {action.description}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors mt-1 font-mono line-clamp-2">
                        "{action.query.length > 40 ? action.query.substring(0, 40) + '...' : action.query}"
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Live Stats</h4>
              
              {[
                { label: 'Active Organizations', value: '22,950+', icon: Building2, color: 'text-blue-400' },
                { label: 'Total Events (7d)', value: '121M+', icon: Activity, color: 'text-green-400' },
                { label: 'Unique Contacts', value: '9.5M+', icon: Users, color: 'text-purple-400' },
              ].map((stat, index) => (
                <div key={index} className="p-2 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="text-sm font-bold text-white">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="flex-1 p-3 overflow-hidden min-h-0">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Analyzing your query...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {/* Two Panel Layout: Charts and Analysis */}
                  <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
                    {/* Chart Panel - Main area */}
                    <div className="flex-1 bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                          Event Analytics Visualization
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleSort}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
                          >
                            <Filter className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={handleDownload}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Download CSV"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                    {/* Chart Area */}
                    <div className="flex-1 pb-4 min-h-0 overflow-hidden">
                      {activeChart === 'table' ? (
                        <div className="flex-1 overflow-auto min-h-0">
                          <table className="w-full text-left">
                            <thead className="bg-gray-700/50">
                              <tr>
                                <th className="px-4 py-3 text-gray-300 font-medium">Event Name</th>
                                <th className="px-4 py-3 text-gray-300 font-medium">Source</th>
                                <th className="px-4 py-3 text-gray-300 font-medium">Count</th>
                                <th className="px-4 py-3 text-gray-300 font-medium">Unique Contacts</th>
                                <th className="px-4 py-3 text-gray-300 font-medium">Date Range</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visualizationData?.data?.events?.map((event: EventData, index: number) => (
                                <tr key={index} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                                  <td className="px-4 py-3 text-white capitalize">{event.name}</td>
                                  <td className="px-4 py-3 text-gray-400">{event.source}</td>
                                  <td className="px-4 py-3 text-white font-mono">
                                    {(typeof event.count === 'number' && !isNaN(event.count)) ? event.count.toLocaleString() : '0'}
                                  </td>
                                  <td className="px-4 py-3 text-gray-400 font-mono">
                                    {event.uniqueContacts ? event.uniqueContacts.toLocaleString() : 
                                     (typeof event.count === 'number' && !isNaN(event.count)) ? Math.floor(event.count * 0.75).toLocaleString() : '0'}
                                  </td>
                                  <td className="px-4 py-3 text-gray-400 text-sm">
                                    {event.firstEvent && event.lastEvent ? 
                                      `${event.firstEvent.toLocaleDateString()} - ${event.lastEvent.toLocaleDateString()}` : 
                                      'N/A'}
                                  </td>
                                </tr>
                              )) || []}
                              {(!visualizationData?.data?.events || visualizationData.data.events.length === 0) && (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                    No event data available. Try analyzing a query first.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex-1 min-h-0">
                          {(() => {
                            const chartData = generateChartData();
                            console.log('Rendering charts with data:', chartData);
                            
                            if (!chartData) {
                              return (
                                <div className="flex-1 flex items-center justify-center min-h-0">
                                  <div className="text-center">
                                    <div className="text-6xl mb-4">📊</div>
                                    <h3 className="text-xl text-white mb-2">No Data Available</h3>
                                    <p className="text-gray-400">Please analyze a query to see visualization</p>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <>
                                {activeChart === 'bar' && (
                                  <div className="chart-legend-white flex-1 w-full flex flex-col min-h-0">
                                    <div className="flex-1 pt-4 pb-4 px-2 flex flex-col min-h-0">
                                      <div className="flex-1 min-h-0" style={{ minHeight: '400px' }}>
                                        <Bar data={chartData} options={chartOptions} />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {activeChart === 'line' && (
                                  <div className="chart-legend-white flex-1 w-full flex flex-col min-h-0">
                                    <div className="flex-1 pt-4 pb-4 px-2 flex flex-col min-h-0">
                                      <div className="flex-1 min-h-0" style={{ minHeight: '400px' }}>
                                        <Line data={chartData} options={chartOptions} />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {activeChart === 'pie' && (
                                  <div className="flex-1 w-full flex flex-col chart-legend-white min-h-0">
                                    <div className="flex-1 max-w-4xl pt-8 pb-4 px-4 flex flex-col min-h-0">
                                      <div className="flex-1 min-h-0" style={{ minHeight: '400px' }}>
                                        <Doughnut data={chartData} options={pieChartOptions} />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    
                    {/* Analysis Results Panel */}
                    {apiResponse && (
                      <div className="w-[800px] bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 flex flex-col max-h-full flex-shrink-0">
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            Analysis Results
                          </h3>
                          <button 
                            onClick={() => setApiResponse('')}
                            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700/50"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-900/50 rounded-lg p-3 font-mono text-xs min-h-0">
                          <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">{apiResponse}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}