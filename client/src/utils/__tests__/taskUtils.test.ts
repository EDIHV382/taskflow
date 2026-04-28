import { describe, it, expect } from 'vitest';
import {
  priorityColors,
  statusColors,
  statusLabels,
  priorityLabels,
  formatDate,
} from '../taskUtils';
import { Priority, Status } from '../../store/taskStore';

describe('taskUtils', () => {
  describe('priorityColors', () => {
    it('returns correct colors for HIGH priority', () => {
      expect(priorityColors.HIGH).toContain('bg-red-100');
      expect(priorityColors.HIGH).toContain('text-red-800');
    });

    it('returns correct colors for MEDIUM priority', () => {
      expect(priorityColors.MEDIUM).toContain('bg-yellow-100');
      expect(priorityColors.MEDIUM).toContain('text-yellow-800');
    });

    it('returns correct colors for LOW priority', () => {
      expect(priorityColors.LOW).toContain('bg-green-100');
      expect(priorityColors.LOW).toContain('text-green-800');
    });
  });

  describe('statusColors', () => {
    it('returns correct colors for PENDING status', () => {
      expect(statusColors.PENDING).toContain('bg-gray-100');
      expect(statusColors.PENDING).toContain('text-gray-800');
    });

    it('returns correct colors for IN_PROGRESS status', () => {
      expect(statusColors.IN_PROGRESS).toContain('bg-blue-100');
      expect(statusColors.IN_PROGRESS).toContain('text-blue-800');
    });

    it('returns correct colors for COMPLETED status', () => {
      expect(statusColors.COMPLETED).toContain('bg-purple-100');
      expect(statusColors.COMPLETED).toContain('text-purple-800');
    });
  });

  describe('statusLabels', () => {
    it('returns Spanish labels for all statuses', () => {
      expect(statusLabels.PENDING).toBe('Pendiente');
      expect(statusLabels.IN_PROGRESS).toBe('En progreso');
      expect(statusLabels.COMPLETED).toBe('Completada');
    });
  });

  describe('priorityLabels', () => {
    it('returns Spanish labels for all priorities', () => {
      expect(priorityLabels.HIGH).toBe('Alta');
      expect(priorityLabels.MEDIUM).toBe('Media');
      expect(priorityLabels.LOW).toBe('Baja');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = '2024-01-15T10:00:00.000Z';
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('returns empty string for null date', () => {
      expect(formatDate(null)).toBe('');
    });

    it('returns empty string for undefined date', () => {
      expect(formatDate(undefined as unknown as string)).toBe('');
    });
  });
});
