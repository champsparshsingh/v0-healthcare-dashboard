import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldAlert } from 'lucide-react';

export default function FamilyMembersPage() {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // 1. LOAD: Run once when the page starts
  useEffect(() => {
    const savedMembers = localStorage.getItem('familyContacts');
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  // 2. SAVE: Run every time the 'members' list changes
  useEffect(() => {
    localStorage.setItem('familyContacts', JSON.stringify(members));
  }, [members]);

  const addMember = (e) => {
    e.preventDefault();
    const newMember = { id: Date.now(), name: newName, email: newEmail };
    setMembers([...members, newMember]);
    setNewName(""); setNewEmail("");
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
          <p className="text-sm text-gray-500">Who should we notify if your BP is high?</p>
        </div>
      </div>
      
      <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 bg-gray-50 p-4 rounded-lg">
        <input 
          className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Contact Name" 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          required 
        />
        <input 
          className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Email Address" 
          type="email"
          value={newEmail} 
          onChange={(e) => setNewEmail(e.target.value)} 
          required 
        />
        <button className="bg-blue-600 text-white font-semibold py-2.5 rounded-md md:col-span-2 hover:bg-blue-700 transition duration-200">
          Save Contact
        </button>
      </form>

      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-center text-gray-400 py-4 italic">No family members added yet.</p>
        ) : (
          members.map(member => (
            <div key={member.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:shadow-sm transition">
              <div>
                <p className="font-bold text-gray-700">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <button onClick={() => removeMember(member.id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}