/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateStudentMutation, useCreateTeacherMutation, useCreateAdminMutation } from '../../store/api/userApi';
import type { User } from '../../types';
import toast from 'react-hot-toast';

const roles: Array<User['role'] | string> = ['admin', 'teacher', 'student'];

const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  const [createTeacher, { isLoading: isCreatingTeacher }] = useCreateTeacherMutation();
  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
  const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'student' as string,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
      };

      if (form.role === 'admin') {
        await createAdmin(payload).unwrap();
      } else if (form.role === 'teacher') {
        await createTeacher(payload).unwrap();
      } else if (form.role === 'student') {
        await createStudent(payload).unwrap();
      } else {
        toast.error('Unsupported role');
        return;
      }

      toast.success('User created successfully');
      navigate('/admin/users');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create user');
    }
  };

  const isSaving = isCreatingTeacher || isCreatingStudent || isCreatingAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
          <p className="text-gray-600">Create a new Admin, Teacher, or Student</p>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Link
            to="/admin/users"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            form="user-create-form"
            type="submit"
            disabled={isSaving}
            className={`px-5 py-2 rounded-md text-white transition-colors cursor-pointer ${
              isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>

      <form
        id="user-create-form"
        onSubmit={onSubmit}
        className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="First name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Last name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Phone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {String(r).charAt(0).toUpperCase() + String(r).slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Password"
            required
            minLength={6}
          />
        </div>
      </form>
    </div>
  );
};

export default UserCreate;
