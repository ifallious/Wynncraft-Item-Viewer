import { useState, useMemo } from 'react';
import type { FilterState } from './types.js';
import { useItemData } from './hooks/useItemData.js';
import { filterItems } from './utils/filterUtils.js';
import { FilterPanel } from './components/FilterPanel.js';
import { SearchBar } from './components/SearchBar.js';
import { ItemGrid } from './components/ItemGrid.js';
import './App.css';

function App() {
  const { itemsArray, loading, error } = useItemData();
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: [],
    rarity: [],
    levelMin: 1,
    levelMax: 110,
    weaponTypes: [],
    armourTypes: [],
    accessoryTypes: [],
    strengthMin: 0,
    strengthMax: 150,
    dexterityMin: 0,
    dexterityMax: 150,
    intelligenceMin: 0,
    intelligenceMax: 150,
    defenceMin: 0,
    defenceMax: 150,
    agilityMin: 0,
    agilityMax: 150,
    hasIdentifications: false,
    hasMajorIds: false,
    selectedMajorIds: [],
    powderSlots: [],
    dpsMin: 0,
    dpsMax: 1300,
    damageElements: [],
    identificationFilters: [],
    attackSpeed: [],
    craftingProfessions: [],
    ingredientTiers: []
  });

  const filteredItems = useMemo(() => {
    return filterItems(itemsArray, filters);
  }, [itemsArray, filters]);

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading Wynncraft Items...</h2>
        <p>Fetching data from the Wynncraft API...</p>
      </div>
    );
  }

  if (error && itemsArray.length === 0) {
    return (
      <div className="error-container">
        <h2>Error Loading Items</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // If we have an error but items exist (mock fallback), show a non-blocking banner
  const showWarningBanner = !!error && itemsArray.length > 0;

  return (
    <div className="app">
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        items={itemsArray}
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
      />

      <main className={`main-content ${filterPanelOpen ? 'with-sidebar' : 'full-width'}`}>
        {showWarningBanner && (
          <div className="warning-banner" role="status">
            <span>Could not reach Wynncraft API. Showing mock data.</span>
            <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
          </div>
        )}
        <header className="app-header">
          <h1>Wynncraft Item Viewer</h1>
          <p>Browse and filter all items from the Wynncraft MMORPG</p>
        </header>

        <SearchBar
          searchTerm={filters.search}
          onSearchChange={handleSearchChange}
          resultCount={filteredItems.length}
          totalCount={itemsArray.length}
        />

        <ItemGrid items={filteredItems} />
      </main>
    </div>
  );
}

export default App;
