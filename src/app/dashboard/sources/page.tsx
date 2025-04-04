'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SourcesPage() {
  const [activeTab, setActiveTab] = useState<'documents' | 'websites' | 'apis'>('documents');
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Knowledge Sources</h2>
          <p className="text-secondary">Manage the data sources that power your chatbot responses</p>
        </div>
        
        {/* Tab navigation */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'documents', label: 'Documents' },
              { id: 'websites', label: 'Websites' },
              { id: 'apis', label: 'APIs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'documents' | 'websites' | 'apis')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-secondary hover:border-border hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Add new source button */}
        <div className="mb-6 flex justify-between">
          <button className="flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New {activeTab === 'documents' ? 'Document' : activeTab === 'websites' ? 'Website' : 'API'}
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search sources..."
              className="w-64 rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'documents' && (
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
              {/* Left column - Document List */}
              <div className="p-4">
                <h3 className="mb-4 text-lg font-medium text-primary">Your Documents</h3>
                <div className="space-y-4">
                  <DocumentItem 
                    name="Company FAQ.pdf" 
                    type="PDF" 
                    size="2.4 MB" 
                    uploadDate="May 8, 2023" 
                    status="processed" 
                    isActive
                  />
                  <DocumentItem 
                    name="Product Manual.docx" 
                    type="DOCX" 
                    size="4.1 MB" 
                    uploadDate="May 6, 2023" 
                    status="processed" 
                    isActive={false}
                  />
                  <DocumentItem 
                    name="Pricing Tables.xlsx" 
                    type="XLSX" 
                    size="1.2 MB" 
                    uploadDate="May 5, 2023" 
                    status="processed" 
                    isActive
                  />
                  <DocumentItem 
                    name="Customer Survey Results.csv" 
                    type="CSV" 
                    size="3.5 MB" 
                    uploadDate="May 3, 2023" 
                    status="error" 
                    isActive={false}
                  />
                  <DocumentItem 
                    name="Technical Specifications.pdf" 
                    type="PDF" 
                    size="8.2 MB" 
                    uploadDate="May 1, 2023" 
                    status="processing" 
                    isActive={false}
                  />
                </div>
              </div>
              
              {/* Right column - Document Details & Settings */}
              <div className="p-4">
                <h3 className="mb-4 text-lg font-medium text-primary">Document Settings</h3>
                <div className="mb-6 rounded-lg bg-dark p-4">
                  <div className="mb-2 flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-primary">Company FAQ.pdf</h4>
                      <p className="text-xs text-secondary">Uploaded May 8, 2023</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-card/50 px-3 py-2">
                      <span className="text-secondary">Size:</span>
                      <span className="ml-1 text-primary">2.4 MB</span>
                    </div>
                    <div className="rounded-md bg-card/50 px-3 py-2">
                      <span className="text-secondary">Type:</span>
                      <span className="ml-1 text-primary">PDF</span>
                    </div>
                    <div className="rounded-md bg-card/50 px-3 py-2">
                      <span className="text-secondary">Pages:</span>
                      <span className="ml-1 text-primary">24</span>
                    </div>
                    <div className="rounded-md bg-card/50 px-3 py-2">
                      <span className="text-secondary">Status:</span>
                      <span className="ml-1 text-green-400">Processed</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Weight/Importance Setting */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      Relevance Weight
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        defaultValue="8"
                        className="h-2 w-full appearance-none rounded-lg bg-dark"
                      />
                      <span className="ml-3 w-8 text-sm text-primary">8/10</span>
                    </div>
                    <p className="mt-1 text-xs text-secondary">
                      Higher weight gives this document priority when answering related questions
                    </p>
                  </div>
                  
                  {/* Include in Training */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-primary">
                        Include in Training
                      </label>
                      <p className="text-xs text-secondary">
                        Use this document to train the chatbot&apos;s language model
                      </p>
                    </div>
                    <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-accent">
                      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-dark transition-all"></span>
                    </div>
                  </div>
                  
                  {/* Categories/Tags */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      Categories/Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-dark px-3 py-1 text-xs text-primary">
                        FAQ
                      </span>
                      <span className="rounded-full bg-dark px-3 py-1 text-xs text-primary">
                        Customer Support
                      </span>
                      <span className="rounded-full bg-dark px-3 py-1 text-xs text-primary">
                        Product
                      </span>
                      <span className="rounded-full bg-accent/20 px-3 py-1 text-xs text-accent">
                        + Add Tag
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <button className="rounded-md bg-dark px-4 py-2 text-sm text-primary hover:bg-dark/70">
                      Re-Process
                    </button>
                    <button className="rounded-md bg-dark px-4 py-2 text-sm text-primary hover:bg-dark/70">
                      Download
                    </button>
                    <button className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'websites' && (
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6">
              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Website cards */}
                <WebsiteCard 
                  url="https://example.com/support" 
                  title="Support Portal" 
                  lastCrawled="May 9, 2023" 
                  pageCount={42}
                  isActive
                />
                <WebsiteCard 
                  url="https://example.com/blog" 
                  title="Company Blog" 
                  lastCrawled="May 7, 2023" 
                  pageCount={67}
                  isActive
                />
                <WebsiteCard 
                  url="https://example.com/docs" 
                  title="Developer Documentation" 
                  lastCrawled="May 5, 2023" 
                  pageCount={124}
                  isActive={false}
                />
                
                {/* Add new website card */}
                <div className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-dark p-6 transition-colors hover:border-accent hover:bg-dark/80">
                  <div className="mb-2 rounded-full bg-accent/10 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-primary">Add New Website</span>
                  <span className="mt-1 text-xs text-secondary">Connect a website URL</span>
                </div>
              </div>
              
              {/* Crawl settings */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-4 text-lg font-medium text-primary">Crawl Settings</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      Crawl Frequency
                    </label>
                    <select className="w-full rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary focus:border-accent focus:outline-none">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Manual only</option>
                    </select>
                    <p className="mt-1 text-xs text-secondary">
                      How often to check for new content
                    </p>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      Crawl Depth
                    </label>
                    <select className="w-full rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary focus:border-accent focus:outline-none">
                      <option>Shallow (up to 2 levels)</option>
                      <option>Medium (up to 5 levels)</option>
                      <option>Deep (up to 10 levels)</option>
                      <option>Complete Site</option>
                    </select>
                    <p className="mt-1 text-xs text-secondary">
                      How many levels of links to follow
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80">
                    Save Settings
                  </button>
                  <button className="rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary hover:bg-dark/70">
                    Run Crawl Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'apis' && (
          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {/* API Connection Cards */}
              <ApiConnectionCard
                name="CRM System"
                status="connected"
                lastSync="10 minutes ago"
                endpoint="https://api.crm-example.com/v2/"
              />
              <ApiConnectionCard
                name="Product Database"
                status="error"
                lastSync="2 days ago"
                endpoint="https://products-api.example.com/"
              />
              <ApiConnectionCard
                name="Custom Knowledge Base"
                status="connected"
                lastSync="1 hour ago"
                endpoint="https://kb.example.com/api/"
              />
              
              {/* Add New API Connection */}
              <div className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-dark p-6 transition-colors hover:border-accent hover:bg-dark/80">
                <div className="mb-2 rounded-full bg-accent/10 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-primary">Add New Connection</span>
                <span className="mt-1 text-xs text-secondary">Connect an external API</span>
              </div>
            </div>
            
            {/* API Authentication */}
            <div className="rounded-lg border border-border p-4 mb-6">
              <h3 className="mb-4 text-lg font-medium text-primary">API Authentication</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    Authentication Type
                  </label>
                  <select className="w-full rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary focus:border-accent focus:outline-none">
                    <option>OAuth 2.0</option>
                    <option>API Key</option>
                    <option>Bearer Token</option>
                    <option>Basic Auth</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    API Key (Redacted)
                  </label>
                  <div className="flex">
                    <input
                      type="password"
                      disabled
                      className="w-full rounded-l-md border border-border bg-dark px-4 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                    />
                    <button className="rounded-r-md border border-l-0 border-border bg-dark px-4 py-2 text-sm text-primary hover:bg-dark/70">
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Webhook Setup */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-primary">Webhook Integration</h3>
                  <p className="text-sm text-secondary">
                    Allow external services to push data to your chatbot
                  </p>
                </div>
                <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-accent">
                  <span className="absolute left-0.5 h-5 w-5 rounded-full bg-dark transition-all"></span>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-primary">
                  Webhook URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value="https://api.beai.com/webhooks/ingest/a1b2c3d4e5f6"
                    readOnly
                    className="w-full rounded-l-md border border-border bg-dark px-4 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                  />
                  <button className="rounded-r-md border border-l-0 border-border bg-dark px-4 py-2 text-sm text-primary hover:bg-dark/70">
                    Copy
                  </button>
                </div>
                <p className="mt-1 text-xs text-secondary">
                  Send POST requests to this URL to add new data to your chatbot&apos;s knowledge base
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface DocumentItemProps {
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'processed' | 'processing' | 'error';
  isActive: boolean;
}

function DocumentItem({ name, type, size, uploadDate, status, isActive }: DocumentItemProps) {
  return (
    <div className={`cursor-pointer rounded-lg border ${isActive ? 'border-accent' : 'border-border'} bg-dark p-3 transition-colors hover:border-accent`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent/10 text-accent">
            {type === 'PDF' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            {type === 'DOCX' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {(type === 'XLSX' || type === 'CSV') && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="mb-1 text-sm font-medium text-primary">{name}</h4>
            <div className="flex items-center gap-2 text-xs text-secondary">
              <span>{size}</span>
              <span>•</span>
              <span>{uploadDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {status === 'processed' && (
            <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
              Processed
            </span>
          )}
          {status === 'processing' && (
            <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400">
              Processing
            </span>
          )}
          {status === 'error' && (
            <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-xs font-medium text-red-400">
              Failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface WebsiteCardProps {
  url: string;
  title: string;
  lastCrawled: string;
  pageCount: number;
  isActive: boolean;
}

function WebsiteCard({ url, title, lastCrawled, pageCount, isActive }: WebsiteCardProps) {
  return (
    <div className={`cursor-pointer rounded-lg border ${isActive ? 'border-accent' : 'border-border'} bg-dark p-4 transition-colors hover:border-accent`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-card">
          <span className={`absolute h-5 w-5 rounded-full transition-all ${isActive ? 'left-auto right-0.5 bg-accent' : 'left-0.5 bg-dark'}`}></span>
        </div>
      </div>
      <h3 className="mb-1 text-base font-medium text-primary">{title}</h3>
      <p className="mb-3 truncate text-xs text-secondary">{url}</p>
      <div className="flex justify-between border-t border-border pt-3 text-xs">
        <div>
          <span className="text-secondary">Last crawled:</span>
          <span className="ml-1 text-primary">{lastCrawled}</span>
        </div>
        <div>
          <span className="text-secondary">Pages:</span>
          <span className="ml-1 text-primary">{pageCount}</span>
        </div>
      </div>
    </div>
  );
}

interface ApiConnectionCardProps {
  name: string;
  status: 'connected' | 'error';
  lastSync: string;
  endpoint: string;
}

function ApiConnectionCard({ name, status, lastSync, endpoint }: ApiConnectionCardProps) {
  return (
    <div className="rounded-lg border border-border bg-dark p-4 transition-colors hover:border-accent">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {status === 'connected' ? (
          <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
            Connected
          </span>
        ) : (
          <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-xs font-medium text-red-400">
            Error
          </span>
        )}
      </div>
      <h3 className="mb-1 text-base font-medium text-primary">{name}</h3>
      <p className="mb-3 truncate text-xs text-secondary">{endpoint}</p>
      <div className="flex justify-between border-t border-border pt-3 text-xs">
        <div>
          <span className="text-secondary">Last sync:</span>
          <span className="ml-1 text-primary">{lastSync}</span>
        </div>
        <button className="text-accent hover:underline">
          Configure
        </button>
      </div>
    </div>
  );
} 