import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';
import { Pagination as PaginationType } from '../../store/taskStore';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createPagination = (overrides = {}): PaginationType => ({
    page: 1,
    limit: 10,
    total: 50,
    totalPages: 5,
    hasMore: true,
    ...overrides,
  });

  it('renders pagination info correctly', () => {
    render(
      <Pagination pagination={createPagination()} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText('Mostrando 1 - 10 de 50 tareas')).toBeInTheDocument();
  });

  it('renders page numbers', () => {
    render(
      <Pagination pagination={createPagination()} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination pagination={createPagination({ page: 1 })} onPageChange={mockOnPageChange} />
    );

    const prevButton = screen.getByLabelText('Página anterior');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        pagination={createPagination({ page: 5, hasMore: false })}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByLabelText('Página siguiente');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when page number is clicked', () => {
    render(
      <Pagination pagination={createPagination()} onPageChange={mockOnPageChange} />
    );

    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when next button is clicked', () => {
    render(
      <Pagination pagination={createPagination({ page: 2 })} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByLabelText('Página siguiente');
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when previous button is clicked', () => {
    render(
      <Pagination pagination={createPagination({ page: 3 })} onPageChange={mockOnPageChange} />
    );

    const prevButton = screen.getByLabelText('Página anterior');
    fireEvent.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('highlights current page', () => {
    render(
      <Pagination pagination={createPagination({ page: 2 })} onPageChange={mockOnPageChange} />
    );

    const page2Button = screen.getByText('2');
    expect(page2Button).toHaveClass('bg-blue-600');
  });

  it('does not render when only one page', () => {
    const { container } = render(
      <Pagination
        pagination={createPagination({ total: 5, totalPages: 1, hasMore: false })}
        onPageChange={mockOnPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
