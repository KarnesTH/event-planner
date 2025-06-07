import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();
  const mockOnFilter = vi.fn();

  const renderSearchBar = (props = {}) => {
    return render(
      <SearchBar 
        onSearch={mockOnSearch} 
        onFilter={mockOnFilter}
        {...props}
      />
    );
  };

  it('rendert Suchfeld und Filter', () => {
    renderSearchBar();
    expect(screen.getByPlaceholderText('Nach Events suchen...')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Kategorie' })).toBeInTheDocument();
  });

  it('ruft onSearch mit Suchbegriff auf', async () => {
    renderSearchBar();
    const searchInput = screen.getByPlaceholderText('Nach Events suchen...');
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Workshop' } });
    });
    
    expect(mockOnSearch).toHaveBeenCalledWith('Workshop');
  });

  it('ruft onFilter mit ausgewählter Kategorie auf', async () => {
    renderSearchBar();
    const categorySelect = screen.getByRole('combobox', { name: 'Kategorie' });
    
    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: 'Workshop' } });
    });
    
    expect(mockOnFilter).toHaveBeenCalledWith('Workshop');
  });

  it('zeigt initiale Werte für Filter an', () => {
    renderSearchBar({ initialSearchTerm: 'Test', initialCategory: 'Workshop' });
    const searchInput = screen.getByPlaceholderText('Nach Events suchen...');
    const categorySelect = screen.getByRole('combobox', { name: 'Kategorie' });
    expect(searchInput).toHaveValue('Test');
    expect(categorySelect).toHaveValue('Workshop');
  });

  it('aktualisiert Werte wenn sich Props ändern', async () => {
    const { rerender } = renderSearchBar({ initialSearchTerm: 'Test', initialCategory: 'Workshop' });
    
    await act(async () => {
      rerender(
        <SearchBar 
          onSearch={mockOnSearch} 
          onFilter={mockOnFilter}
          initialSearchTerm="Neuer Test"
          initialCategory="Konzert"
        />
      );
    });

    const searchInput = screen.getByPlaceholderText('Nach Events suchen...');
    const categorySelect = screen.getByRole('combobox', { name: 'Kategorie' });
    expect(searchInput).toHaveValue('Neuer Test');
    expect(categorySelect).toHaveValue('Konzert');
  });

  it('resettet Filter bei Klick auf Reset-Button', async () => {
    renderSearchBar({ initialSearchTerm: 'Test', initialCategory: 'Workshop' });
    const resetButton = screen.getByRole('button', { name: 'Filter zurücksetzen' });
    
    await act(async () => {
      fireEvent.click(resetButton);
    });
    
    expect(mockOnFilter).toHaveBeenCalledWith('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });
}); 