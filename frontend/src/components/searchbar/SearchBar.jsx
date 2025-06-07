import { useState, useEffect, useCallback } from 'react';

const SearchBar = ({ onSearch, onFilter, initialSearchTerm = '', initialCategory = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [category, setCategory] = useState(initialCategory);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setCategory(initialCategory);
  }, [initialSearchTerm, initialCategory]);

  const handleSearchChange = useCallback(async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      setIsSearching(true);
      try {
        await onSearch(value);
      } finally {
        setIsSearching(false);
      }
    }
  }, [onSearch]);

  const handleCategoryChange = useCallback(async (e) => {
    const value = e.target.value;
    setCategory(value);
    if (onFilter) {
      setIsFiltering(true);
      try {
        await onFilter(value);
      } finally {
        setIsFiltering(false);
      }
    }
  }, [onFilter]);

  const handleReset = useCallback(async () => {
    setSearchTerm('');
    setCategory('');
    if (onSearch || onFilter) {
      setIsSearching(true);
      setIsFiltering(true);
      try {
        await Promise.all([
          onSearch?.(''),
          onFilter?.('')
        ]);
      } finally {
        setIsSearching(false);
        setIsFiltering(false);
      }
    }
  }, [onSearch, onFilter]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Nach Events suchen..."
          disabled={isSearching || isFiltering}
          className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${
            isSearching || isFiltering ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={category}
          onChange={handleCategoryChange}
          disabled={isSearching || isFiltering}
          aria-label="Kategorie"
          className={`px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${
            isSearching || isFiltering ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <option value="">Alle Kategorien</option>
          <option value="Workshop">Workshop</option>
          <option value="Konzert">Konzert</option>
          <option value="Vortrag">Vortrag</option>
          <option value="Networking">Networking</option>
        </select>

        <button
          onClick={handleReset}
          disabled={isSearching || isFiltering}
          className={`px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 ${
            isSearching || isFiltering ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default SearchBar;