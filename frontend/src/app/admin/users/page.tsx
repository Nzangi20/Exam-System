"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trash2, Shield } from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface ResetRequest {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('TRAINER');
  const [addingUser, setAddingUser] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setMessage('');
    try {
      await api.post('/api/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setMessage('User created successfully');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('TRAINER');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch {
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const [resets, setResets] = useState<ResetRequest[]>([]);
  const [resetsLoading, setResetsLoading] = useState(true);

  const fetchResets = async () => {
    try {
      const res = await api.get('/api/users/password-resets');
      setResets(res.data);
    } catch {
      setMessage('Failed to load password resets');
    } finally {
      setResetsLoading(false);
    }
  };

  const approveReset = async (id: string) => {
    try {
      await api.put(`/api/users/password-resets/${id}/approve`);
      setMessage('Password reset approved successfully');
      fetchResets();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to approve password reset');
    }
  };

  const rejectReset = async (id: string) => {
    try {
      await api.put(`/api/users/password-resets/${id}/reject`);
      setMessage('Password reset request rejected');
      fetchResets();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to reject password reset');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchResets();
  }, []);

  const updateRole = async (id: string, role: string) => {
    try {
      await api.put(`/api/users/${id}/role`, { role });
      setMessage('Role updated');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update role');
    }
  };

  const archiveUser = async (id: string, name: string) => {
    if (!confirm(`Archive user "${name}"? They will be moved to the archive.`)) return;
    try {
      await api.delete(`/api/users/${id}`);
      setMessage('User archived');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to archive user');
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Never';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
        <p className="text-slate-500">View all users, change roles, and archive accounts.</p>
      </div>

      {message && (
        <div className="p-3 bg-violet-50 text-violet-700 text-sm rounded-lg border border-violet-100">
          {message}
        </div>
      )}

      {/* Add New User Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Jane Tutor"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-slate-950 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-slate-950 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-slate-950 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-violet-500 text-slate-950"
              >
                <option value="TRAINER">Trainer / Tutor</option>
                <option value="STUDENT">Student</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addingUser}
              className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors h-[38px] disabled:opacity-50 cursor-pointer"
            >
              {addingUser ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Last Login</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className="border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white text-slate-900"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => archiveUser(user.id, user.name)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                        title="Archive user"
                      >
                        <Trash2 className="w-4 h-4" />
                        Archive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Requests Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Password Reset Requests</h2>
          <p className="text-slate-500 text-sm">Approve or reject candidate password reset requests.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Email Address</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Requested At</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resetsLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading requests...</td>
                </tr>
              ) : resets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No reset requests found</td>
                </tr>
              ) : (
                resets.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{req.email}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(req.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
                        ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : ''}
                      `}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveReset(req.id)}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectReset(req.id)}
                            className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
        <Shield className="w-4 h-4 mt-0.5 shrink-0" />
        <p>Archiving deactivates the account and stores a snapshot. Restore from the Archive page.</p>
      </div>
    </div>
  );
}
