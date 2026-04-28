import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskStore, Task, CreateTaskDto } from '../taskStore';
import { act } from '@testing-library/react';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock axios
vi.mock('../lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('taskStore', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: '2024-12-31T00:00:00.000Z',
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Reset store to initial state
    const store = useTaskStore.getState();
    act(() => {
      store.resetToDemo();
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial state', () => {
      const state = useTaskStore.getState();
      expect(state.tasks).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isDemoMode).toBe(true);
      expect(state.pagination.page).toBe(1);
      expect(state.pagination.limit).toBe(20);
    });
  });

  describe('setFilters', () => {
    it('updates filters correctly', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.setFilters({ status: 'COMPLETED' });
      });

      expect(useTaskStore.getState().filters.status).toBe('COMPLETED');
    });

    it('resets page to 1 when filters change', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.pagination.page = 5;
        store.setFilters({ priority: 'HIGH' });
      });

      expect(useTaskStore.getState().pagination.page).toBe(1);
    });
  });

  describe('setSorting', () => {
    it('updates sort configuration', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.setSorting('priority', 'asc');
      });

      expect(useTaskStore.getState().sortBy).toBe('priority');
      expect(useTaskStore.getState().order).toBe('asc');
    });
  });

  describe('setSearchQuery', () => {
    it('updates search query', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.setSearchQuery('test query');
      });

      expect(useTaskStore.getState().searchQuery).toBe('test query');
    });

    it('resets page to 1 when search changes', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.pagination.page = 3;
        store.setSearchQuery('new search');
      });

      expect(useTaskStore.getState().pagination.page).toBe(1);
    });
  });

  describe('getFilteredTasks', () => {
    beforeEach(() => {
      const store = useTaskStore.getState();
      act(() => {
        store.tasks = [
          { ...mockTask, id: '1', priority: 'HIGH', status: 'PENDING' },
          { ...mockTask, id: '2', priority: 'LOW', status: 'COMPLETED' },
          { ...mockTask, id: '3', priority: 'MEDIUM', status: 'IN_PROGRESS' },
        ];
      });
    });

    it('filters by status', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.setFilters({ status: 'COMPLETED' });
      });

      const filtered = store.getFilteredTasks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('filters by priority', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.setFilters({ priority: 'HIGH' });
      });

      const filtered = store.getFilteredTasks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('sorts by priority', () => {
      const store = useTaskStore.getState();
      
      act(() => {
        store.setSorting('priority', 'desc');
      });

      const filtered = store.getFilteredTasks();
      expect(filtered[0].priority).toBe('HIGH');
      expect(filtered[1].priority).toBe('MEDIUM');
      expect(filtered[2].priority).toBe('LOW');
    });
  });

  describe('createTask (demo mode)', () => {
    it('creates task in demo mode', () => {
      const store = useTaskStore.getState();
      const newTaskData: CreateTaskDto = {
        title: 'New Task',
        description: 'New description',
        priority: 'MEDIUM',
        status: 'PENDING',
      };

      act(() => {
        store.createTask(newTaskData);
      });

      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe('New Task');
      expect(state.tasks[0].userId).toBe('demo-user');
    });
  });

  describe('updateTask (demo mode)', () => {
    beforeEach(() => {
      const store = useTaskStore.getState();
      act(() => {
        store.tasks = [mockTask];
      });
    });

    it('updates task in demo mode', () => {
      const store = useTaskStore.getState();

      act(() => {
        store.updateTask('1', { title: 'Updated Title' });
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].title).toBe('Updated Title');
    });
  });

  describe('deleteTask (demo mode)', () => {
    beforeEach(() => {
      const store = useTaskStore.getState();
      act(() => {
        store.tasks = [mockTask];
      });
    });

    it('deletes task in demo mode', () => {
      const store = useTaskStore.getState();

      act(() => {
        store.deleteTask('1');
      });

      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(0);
    });
  });

  describe('updateStatus (demo mode)', () => {
    beforeEach(() => {
      const store = useTaskStore.getState();
      act(() => {
        store.tasks = [mockTask];
      });
    });

    it('updates task status in demo mode', () => {
      const store = useTaskStore.getState();

      act(() => {
        store.updateStatus('1', 'COMPLETED');
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].status).toBe('COMPLETED');
    });
  });
});
