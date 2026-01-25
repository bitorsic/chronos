import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { userService } from '../services/userService';
import type { UserListItem, CreateUserDto, UserRole } from '../types/user';
import { getErrorMessage } from '../utils/errorHandler';

export default function Users() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'client'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    role: 'client' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      let loadedUsers: UserListItem[] = [];
      
      if (filterRole === 'all') {
        const [admins, clients] = await Promise.all([
          userService.getAllAdmins(),
          userService.getAllClients(),
        ]);
        loadedUsers = [...admins, ...clients];
      } else if (filterRole === 'admin') {
        loadedUsers = await userService.getAllAdmins();
      } else {
        loadedUsers = await userService.getAllClients();
      }

      // Sort by name alphabetically
      loadedUsers.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(loadedUsers);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await userService.createUser(formData);
      toast.success(response.message);
      setCreatedPassword(response.temporaryPassword);
      
      // Reset form and reload users
      setFormData({
        name: '',
        email: '',
        role: 'client' as UserRole,
      });
      
      await loadUsers();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create user'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreatedPassword(null);
    setFormData({
      name: '',
      email: '',
      role: 'client' as UserRole,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage admin and client users</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </span>
          </Button>
        </div>

        {/* Filter */}
        <Card>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilterRole('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === 'admin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admins
              </button>
              <button
                onClick={() => setFilterRole('client')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === 'client'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clients
              </button>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterRole === 'all' ? 'No users exist yet.' : `No ${filterRole}s found.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-4">
                        <Badge variant={user.role === 'admin' ? 'success' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {createdPassword ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-600 mt-0.5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">User created successfully!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        An email has been sent with the credentials.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Temporary Password
                  </h4>
                  <div className="bg-white border border-yellow-300 rounded px-3 py-2 font-mono text-sm text-gray-900">
                    {createdPassword}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    Please save this password. The user should change it after first login.
                  </p>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter user's full name"
                />

                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />

                <Select
                  label="Role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  options={[
                    { value: 'client', label: 'Client' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> A secure password will be automatically generated and sent to the user's email.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleCloseModal}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
