'use client'
import { useState } from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { SaveIcon, StoreIcon, BellIcon, ShieldIcon } from "lucide-react"

export default function StoreSettings() {
    const userData = useSelector(state => state.user.userData)
    const [storeName, setStoreName] = useState('ShopPilot AI Official')
    const [storeDesc, setStoreDesc] = useState('Official ShopPilot AI store — curated products recommended by our AI engine.')
    const [storeEmail, setStoreEmail] = useState('store@shoppilot.ai')
    const [storeContact, setStoreContact] = useState('+1 415-555-0199')
    const [storeAddress, setStoreAddress] = useState('123 Innovation Drive, San Francisco, CA 94105')
    const [emailNotifications, setEmailNotifications] = useState({ orders: true, reviews: true, stock: true, marketing: false })
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [activeTab, setActiveTab] = useState('store')

    const handleSave = () => { toast.success('Settings saved successfully!') }
    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword) return toast.error('Please fill in both fields')
        if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
        toast.success('Password updated!')
        setCurrentPassword('')
        setNewPassword('')
    }

    const tabs = [
        { id: 'store', label: 'Store Info', icon: StoreIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon },
        { id: 'security', label: 'Security', icon: ShieldIcon },
    ]

    return (
        <div className="text-slate-500 mb-28 max-w-3xl">
            <h1 className="text-2xl mb-6">Store <span className="text-slate-800 font-medium">Settings</span></h1>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <tab.icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Store Info */}
            {activeTab === 'store' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">Store Name</label>
                        <input value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">Description</label>
                        <textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)} rows={3} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Email</label>
                            <input value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Contact</label>
                            <input value={storeContact} onChange={e => setStoreContact(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">Address</label>
                        <input value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                        <SaveIcon size={16} /> Save Changes
                    </button>
                </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700">Email Notifications</h3>
                    {[
                        { key: 'orders', label: 'New orders', desc: 'Get notified when you receive a new order' },
                        { key: 'reviews', label: 'New reviews', desc: 'Get notified when a customer leaves a review' },
                        { key: 'stock', label: 'Low stock alerts', desc: 'Get notified when products are running low' },
                        { key: 'marketing', label: 'Marketing updates', desc: 'Tips, feature updates, and promotions' },
                    ].map(item => (
                        <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={emailNotifications[item.key]} onChange={e => setEmailNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200" />
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4" />
                            </div>
                        </label>
                    ))}
                    <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition mt-4">
                        <SaveIcon size={16} /> Save Preferences
                    </button>
                </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                    <h3 className="text-sm font-semibold text-slate-700">Change Password</h3>
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <button onClick={handlePasswordChange} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                        <ShieldIcon size={16} /> Update Password
                    </button>
                </div>
            )}
        </div>
    )
}
