"use client";

import { useEffect, useState } from 'react';

export default function TransformationsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch('/api/transformations');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeFile || !afterFile) return alert('Both images are required for a new transformation.');
    
    const formData = new FormData();
    formData.append('beforeImage', beforeFile);
    formData.append('afterImage', afterFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('sortOrder', sortOrder);

    await fetch('/api/transformations', {
      method: 'POST',
      body: formData
    });
    
    setBeforeFile(null);
    setAfterFile(null);
    setTitle('');
    setDescription('');
    setSortOrder('0');
    // reset file inputs
    (document.getElementById('beforeFile') as HTMLInputElement).value = '';
    (document.getElementById('afterFile') as HTMLInputElement).value = '';
    
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transformation? Images will be removed from the server.')) {
      await fetch(`/api/transformations/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    await fetch(`/api/transformations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchItems();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transformations</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-medium mb-4">Add New Transformation</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Before Image</label>
              <input id="beforeFile" type="file" accept="image/jpeg, image/png, image/webp" required onChange={e => setBeforeFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">After Image</label>
              <input id="afterFile" type="file" accept="image/jpeg, image/png, image/webp" required onChange={e => setAfterFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title (Optional)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full border p-2 rounded" />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload Transformation</button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <p>Loading...</p> : 
          items.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex h-48 bg-gray-100">
                <div className="w-1/2 relative border-r border-gray-200">
                  <img src={item.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">Before</span>
                </div>
                <div className="w-1/2 relative">
                  <img src={item.afterImage} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded">After</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <input type="text" defaultValue={item.title} onBlur={e => handleUpdate(item._id, { title: e.target.value })} className="font-medium text-lg border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-1/2" placeholder="Title" />
                  <div className="flex items-center gap-4">
                    <label className="text-sm flex items-center gap-1">
                      Order: <input type="number" defaultValue={item.sortOrder} onBlur={e => handleUpdate(item._id, { sortOrder: parseInt(e.target.value) })} className="w-12 border rounded px-1" />
                    </label>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={item.isActive} onChange={e => handleUpdate(item._id, { isActive: e.target.checked })} />
                    Active
                  </label>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
