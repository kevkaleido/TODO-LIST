import React from 'react';

const HistoryList = ({ history, clearHistory }) => {
  // Handle the clearing of the history list after confirmation
  const handleClearHistory = () => {
    const confirmClear = window.confirm("Make sure you really want to clear list?");
    if (confirmClear) {
      clearHistory();
    }
  };

  return (
    <div>
      <ul className={history.length > 4 ? 'scrollable' : ''}>
        {history.map((item, index) => (
          <li key={index}>
            {item.text}
            <br />
            <small>{item.timestamp}</small>
          </li>
        ))}
      </ul>
      <button onClick={handleClearHistory}>Clear History</button>
    </div>
  );
};

export default HistoryList;