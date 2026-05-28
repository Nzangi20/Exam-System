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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchUsers();
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

      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
        <Shield className="w-4 h-4 mt-0.5 shrink-0" />
        <p>Archiving deactivates the account and stores a snapshot. Restore from the Archive page.</p>
      </div>
    </div>
  );
}
