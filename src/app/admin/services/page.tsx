"use client";

import { useEffect, useState } from 'react';

export default function ServicesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string, updates: any) => {
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchItems();
  };

  const handleImageUpdate = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      body: formData
    });
    fetchItems();
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('sortOrder', items.length.toString());
    
    await fetch('/api/services', {
      method: 'POST',
      body: formData // send raw formData for multipart parsing
    });
    form.reset();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Services</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-medium mb-4">Add New Service</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required name="title" type="text" placeholder="Service Title (e.g., Hair Extension)" className="border p-2 rounded" />
          <input required name="slug" type="text" placeholder="Slug (e.g., hair-extension)" className="border p-2 rounded" />
          <input required name="icon" type="text" placeholder="Material Icon (e.g., star)" className="border p-2 rounded" />
          <input name="image" type="file" accept="image/*" className="border p-2 rounded bg-white text-sm" />
          <textarea required name="description" placeholder="Description" className="border p-2 rounded md:col-span-2" rows={2}></textarea>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded justify-self-start md:col-span-2">Add Service</button>
        </form>
      </div>

      <div className="space-y-6">
        {loading ? <p>Loading...</p> : 
          items.map(item => (
            <div key={item._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-blue-600 text-3xl">{item.icon}</span>
                  </div>
                  {item.image && (
                    <img src={item.image} alt="Service Image" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <label className="text-xs text-blue-600 cursor-pointer hover:underline text-center font-medium bg-blue-50 px-2 py-1 rounded">
                    {item.image ? 'Change Image' : 'Add Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpdate(item._id, e.target.files[0]);
                      }
                    }} />
                  </label>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                      <input type="text" defaultValue={item.title} onBlur={e => handleUpdate(item._id, { title: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Material Icon Name</label>
                      <input type="text" defaultValue={item.icon} onBlur={e => handleUpdate(item._id, { icon: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea defaultValue={item.description} onBlur={e => handleUpdate(item._id, { description: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm h-24" />
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <div className="flex gap-4 items-center">
                      <label className="text-sm flex items-center gap-2">
                        <input type="checkbox" checked={item.isActive} onChange={e => handleUpdate(item._id, { isActive: e.target.checked })} />
                        Active
                      </label>
                      <label className="text-sm flex items-center gap-2">
                        Order: 
                        <input type="number" defaultValue={item.sortOrder} onBlur={e => handleUpdate(item._id, { sortOrder: parseInt(e.target.value) })} className="w-12 border rounded px-1" />
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">Slug: {item.slug}</span>
                      <button onClick={() => handleDelete(item._id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
