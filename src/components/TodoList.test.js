import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TodoList from './TodoList';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(),
}));

describe('TodoList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders TodoList component', () => {
    render(<TodoList userId="testUser" />);
    expect(screen.getByPlaceholderText('Add a new todo')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    addDoc.mockResolvedValueOnce({});
    render(<TodoList userId="testUser" />);
    
    const input = screen.getByPlaceholderText('Add a new todo');
    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: 'New Todo',
          completed: false,
          userId: 'testUser'
        })
      );
    });
  });

  test('toggles todo completion', async () => {
    const mockTodos = [
      { id: '1', text: 'Todo 1', completed: false, timestamp: new Date().toISOString() }
    ];
    onSnapshot.mockImplementationOnce((query, callback) => {
      callback({
        docs: mockTodos.map(todo => ({
          id: todo.id,
          data: () => todo,
        }))
      });
      return jest.fn();
    });

    render(<TodoList userId="testUser" />);

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Todo 1'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { completed: true }
      );
    });
  });
});
