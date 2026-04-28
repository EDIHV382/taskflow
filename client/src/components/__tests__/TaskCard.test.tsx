import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';
import { Task } from '../../store/taskStore';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  priority: 'HIGH',
  status: 'PENDING',
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TaskCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders without description', () => {
    const taskWithoutDesc = { ...mockTask, description: null };
    render(
      <TaskCard task={taskWithoutDesc} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('renders without due date', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: null };
    render(
      <TaskCard task={taskWithoutDueDate} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getByLabelText('Editar tarea');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByLabelText('Eliminar tarea');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('displays priority badge with correct styling', () => {
    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const priorityBadge = screen.getByText('HIGH');
    expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays status badge with correct styling', () => {
    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const statusBadge = screen.getByText('PENDING');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });
});
