import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HistoryList from './HistoryList';
import { collection, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

describe('HistoryList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders HistoryList component', () => {
    render(<HistoryList userId="testUser" />);
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  test('displays history items', async () => {
    const mockHistory = [
      { id: '1', text: 'History Item 1', removedAt: new Date(), userId: 'testUser' }
    ];
    onSnapshot.mockImplementationOnce((query, callback) => {
      callback({
        docs: mockHistory.map(item => ({
          id: item.id,
          data: () => item,
        }))
      });
      return jest.fn();
    });

    render(<HistoryList userId="testUser" />);

    await waitFor(() => {
      expect(screen.getByText('History Item 1')).toBeInTheDocument();
    });
  });

  test('clears selected history items', async () => {
    const mockHistory = [
      { id: '1', text: 'History Item 1', removedAt: new Date(), userId: 'testUser' }
    ];
    onSnapshot.mockImplementationOnce((query, callback) => {
      callback({
        docs: mockHistory.map(item => ({
          id: item.id,
          data: () => item,
        }))
      });
      return jest.fn();
    });

    render(<HistoryList userId="testUser" />);

    await waitFor(() => {
      expect(screen.getByText('History Item 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('History Item 1'));
    fireEvent.click(screen.getByText('X'));

    await waitFor(() => {
      expect(screen.getByText('Sure you want to clear selected task(s) from history?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
    });
  });
});
