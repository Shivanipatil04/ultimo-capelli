"use client";

import { useEffect, useState } from 'react';

export default function InstagramAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { instagramUrl: url, title, sortOrder: parseInt(sortOrder), isActive };
    
    if (editingId) {
      await fetch(`/api/gallery/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setUrl(item.instagramUrl);
    setTitle(item.title || '');
    setSortOrder(item.sortOrder.toString());
    setIsActive(item.isActive);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Instagram URL?')) {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setUrl('');
    setTitle('');
    setSortOrder('0');
    setIsActive(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Instagram Gallery</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit Video' : 'Add New Video'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input type="url" required value={url} onChange={e => setUrl(e.target.value)} className="w-full border p-2 rounded" placeholder="https://www.instagram.com/reel/..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title (Optional)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div className="w-1/2 flex items-center mt-6">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="mr-2 h-4 w-4" />
              <label className="text-sm font-medium">Active (Visible)</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'} Video</button>
            {editingId && <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">URL</th>
              <th className="p-4 font-medium text-gray-600">Order</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : 
              items.map(item => (
                <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 max-w-[200px] truncate text-blue-600"><a href={item.instagramUrl} target="_blank" rel="noreferrer">{item.instagramUrl}</a></td>
                  <td className="p-4">{item.sortOrder}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
