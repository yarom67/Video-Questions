import React, { useState } from 'react';

interface UserInfoModalProps {
  onSubmit: (name: string, employeeId: string) => void;
}

export default function UserInfoModal({ onSubmit }: UserInfoModalProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim()) {
      setError('Please fill all fields'); // "Please fill all fields"
      return;
    }
    onSubmit(name, employeeId);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Welcome</h2> {/* Welcome */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label> {/* Full Name */}
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div className="input-group">
            <label htmlFor="employeeId">Employee Number</label> {/* Employee Number */}
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter employee number"
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="tool-btn">
            Start
          </button> {/* Start */}
        </form>
      </div>
    </div>
  );
}
