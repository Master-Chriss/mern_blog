import { useContext, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { 
  FaHome, FaFileAlt, FaChartLine, FaEnvelope, 
  FaCalendarAlt, FaDollarSign, FaCog, FaSignOutAlt,
  FaEdit, FaTrash, FaUserCog
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { userInfo } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalAuthors: 0,
    totalReaders: 0
  });

  // Redirect if not admin
  if (!userInfo || userInfo.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    // Fetch all posts
    fetch('http://localhost:4000/post')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setStats(prev => ({ ...prev, totalPosts: data.length }));
      });

    // You'll need a backend endpoint to get all users
    fetch('http://localhost:4000/auth/users', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        const authors = data.filter(u => u.role === 'author').length;
        const readers = data.filter(u => u.role === 'reader').length;
        setStats({
          totalPosts: posts.length,
          totalUsers: data.length,
          totalAuthors: authors,
          totalReaders: readers
        });
      });
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:4000/auth/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh users list
        const updated = users.map(u => 
          u._id === userId ? { ...u, role: newRole } : u
        );
        setUsers(updated);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/auth/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/post/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', active: true },
    { icon: <FaFileAlt />, label: 'My Articles' },
    { icon: <FaChartLine />, label: 'Analytics' },
    { icon: <FaEnvelope />, label: 'Inbox' },
    { icon: <FaCalendarAlt />, label: 'Post Plan' },
    { icon: <FaDollarSign />, label: 'Earning' },
    { icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 p-6 fixed h-full">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8">
          MCBlog
        </div>
        
        <nav className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-500">Navigation</p>
            {menuItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  item.active 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/10 space-y-2">
            <p className="text-xs text-slate-600 px-4">Version 1.0.1</p>
            <button className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-red-400 transition-colors w-full">
              <FaSignOutAlt />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hello {userInfo?.username}! 👋
          </h1>
          <p className="text-slate-400">
            Welcome to your admin dashboard. Manage your blog content and users.
          </p>
        </div>

        {/* Write Post CTA */}
        <Link
          to="/create"
          className="inline-flex items-center gap-2 mb-12 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
        >
          ✍️ Write new post
        </Link>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-slate-400 mb-2">Total Posts</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.totalPosts}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-slate-400 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-purple-400">{stats.totalUsers}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-slate-400 mb-2">Authors</p>
            <p className="text-3xl font-bold text-green-400">{stats.totalAuthors}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-slate-400 mb-2">Readers</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.totalReaders}</p>
          </div>
        </div>

        {/* Top Articles */}
        <h2 className="text-2xl font-bold text-white mb-6">Top Articles</h2>
        <div className="space-y-4 mb-12">
          {posts.slice(0, 4).map((post, index) => (
            <div key={post._id} className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
              <span className="text-2xl font-bold text-slate-600 w-12">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{post.title}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })} • by @{post.author?.username}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/edit/${post._id}`} className="p-2 text-slate-400 hover:text-cyan-400">
                  <FaEdit />
                </Link>
                <button onClick={() => deletePost(post._id)} className="p-2 text-slate-400 hover:text-red-400">
                  <FaTrash fill='red' />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* User Management Section */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaUserCog /> Manage Users
        </h2>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr className="text-left text-slate-400 text-sm">
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">{user.username}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                    >
                      <option value="reader">Reader</option>
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash fill='red' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;