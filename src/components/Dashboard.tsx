'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import branchesData from '@/data/branches.json';
import {
  Search,
  GitBranch,
  User,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  GitCommit,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  X,
  ChevronDown,
  FilterX,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  author: string;
  authorEmail: string;
  lastCommit: string;
  commitMessage: string;
  buildUrl: string;
  status: 'success' | 'failed' | 'building';
  protected: boolean;
  ahead: number;
  behind: number;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showProtectedOnly, setShowProtectedOnly] = useState(false);
  const [branches, setBranches] = useState<Branch[]>(branchesData.branches || []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

  const addNotification = (message: string, type: Notification['type'] = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAuthorSelect = (author: string) => {
    setAuthorFilter(author);
    setIsAuthorDropdownOpen(false);
    setAuthorSearchTerm('');
  };

  const clearAuthorFilter = () => {
    setAuthorFilter('');
    setIsAuthorDropdownOpen(false);
    setAuthorSearchTerm('');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setAuthorFilter('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setShowProtectedOnly(false);
    setIsAuthorDropdownOpen(false);
    setAuthorSearchTerm('');
  };

  // Close author dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isAuthorDropdownOpen && !target.closest('.author-dropdown')) {
        setIsAuthorDropdownOpen(false);
        setAuthorSearchTerm('');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAuthorDropdownOpen]);

  // Get unique authors for filter dropdown
  const uniqueAuthors = useMemo(() => {
    return Array.from(new Set(branches.map((b) => b.author)));
  }, [branches]);

  // Filter authors based on search term
  const filteredAuthors = useMemo(() => {
    return uniqueAuthors.filter(author =>
      author.toLowerCase().includes(authorSearchTerm.toLowerCase())
    );
  }, [uniqueAuthors, authorSearchTerm]);

  // Filter branches based on all criteria
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      // Search filter
      const matchesSearch =
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.commitMessage.toLowerCase().includes(searchTerm.toLowerCase());

      // Author filter
      const matchesAuthor = !authorFilter || branch.author === authorFilter;

      // Date filters
      const branchDate = parseISO(branch.lastCommit);
      const matchesDateFrom =
        !dateFrom || isAfter(branchDate, parseISO(dateFrom));
      const matchesDateTo =
        !dateTo || isBefore(branchDate, parseISO(dateTo + 'T23:59:59'));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || branch.status === statusFilter;

      // Protected filter
      const matchesProtected = !showProtectedOnly || branch.protected;

      return (
        matchesSearch &&
        matchesAuthor &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesStatus &&
        matchesProtected
      );
    });
  }, [
    searchTerm,
    authorFilter,
    dateFrom,
    dateTo,
    statusFilter,
    showProtectedOnly,
    branches,
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'building':
        return <Loader className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    const paymentGatewayBranch = branches.find(b => b.name === 'feature/payment-gateway');
    const newStatus = paymentGatewayBranch?.status === 'building' ? 'success' : 'building';

    setBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.name === 'feature/payment-gateway'
          ? {
              ...branch,
              status: newStatus as 'success' | 'failed' | 'building'
            }
          : branch
      )
    );

    addNotification('Branch data refreshed successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GitBranch className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                GitHub Branches Dashboard
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Author Filter */}
            <div className="relative author-dropdown">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <div className="relative">
                <button
                  onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
                >
                  <span className={authorFilter ? 'text-gray-900' : 'text-gray-500'}>
                    {authorFilter || 'All Authors'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isAuthorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAuthorDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search authors..."
                        value={authorSearchTerm}
                        onChange={(e) => setAuthorSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        onClick={clearAuthorFilter}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-700"
                      >
                        All Authors
                      </button>
                      {filteredAuthors.map((author) => (
                        <button
                          key={author}
                          onClick={() => handleAuthorSelect(author)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                            authorFilter === author ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {author}
                        </button>
                      ))}
                      {filteredAuthors.length === 0 && authorSearchTerm && (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No authors found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date From */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="building">Building</option>
            </select>

            {/* Protected Filter */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showProtectedOnly}
                onChange={(e) => setShowProtectedOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Protected Only</span>
            </label>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Branches</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredBranches.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Success Builds</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredBranches.filter((b) => b.status === 'success').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Failed Builds</div>
            <div className="text-2xl font-bold text-red-600">
              {filteredBranches.filter((b) => b.status === 'failed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Protected Branches</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredBranches.filter((b) => b.protected).length}
            </div>
          </div>
        </div>

        {/* Branches List */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                Branches ({filteredBranches.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <GitBranch className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {branch.name}
                        </h3>
                        {branch.protected && (
                          <Shield
                            className="h-4 w-4 text-yellow-500 ml-2"
                            title="Protected branch"
                          />
                        )}
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                            branch.status
                          )}`}
                        >
                          {branch.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{branch.author}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {format(parseISO(branch.lastCommit), 'PPp')}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <GitCommit className="h-4 w-4 mr-2" />
                            <span className="truncate">
                              {branch.commitMessage}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-green-600">
                              <ArrowUp className="h-4 w-4 mr-1" />
                              <span>{branch.ahead} ahead</span>
                            </div>
                            <div className="flex items-center text-red-600">
                              <ArrowDown className="h-4 w-4 mr-1" />
                              <span>{branch.behind} behind</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center ml-4">
                      {getStatusIcon(branch.status)}
                      {branch.status === 'success' ? (
                        <a
                          href={branch.buildUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Build
                        </a>
                      ) : (
                        <button
                          disabled
                          className="ml-4 flex items-center px-4 py-2 bg-gray-400 text-gray-600 rounded-lg cursor-not-allowed"
                          title={`Build is ${branch.status}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Build
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredBranches.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No branches found matching your filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0
              ${notification.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${notification.type === 'info' ? 'bg-blue-500 text-white' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
              ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}
            `}
          >
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
