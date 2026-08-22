'use client'
import { useState } from "react"
import toast from "react-hot-toast"
import { SaveIcon, ShieldIcon, GlobeIcon, BellIcon, PaletteIcon } from "lucide-react"

export default function AdminSettings() {
    const [platformName, setPlatformName] = useState('ShopPilot AI')
    const [supportEmail, setSupportEmail] = useState('support@shoppilot.ai')
    const [currency, setCurrency] = useState('USD')
    const [allowRegistration, setAllowRegistration] = useState(true)
    const [requireStoreApproval, setRequireStoreApproval] = useState(true)
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [activeTab, setActiveTab] = useState('general')

    const handleSave = () => toast.success('Settings saved!')

    const Toggle = ({ checked, onChange }) => (
        <div className="relative inline-flex items-center cursor-pointer" onClick={onChange}>
            <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-green-600' : 'bg-slate-300'}`} />
            <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
        </div>
    )

    const tabs = [
        { id: 'general', label: 'General', icon: GlobeIcon },
        { id: 'security', label: 'Security', icon: ShieldIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon },
        { id: 'appearance', label: 'Appearance', icon: PaletteIcon },
    ]

    return (
        <div className="text-slate-500 mb-28 max-w-3xl">
            <h1 className="text-2xl mb-6">Platform <span className="text-slate-800 font-medium">Settings</span></h1>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <tab.icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'general' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                    <div><label className="text-sm font-medium text-slate-600 mb-1.5 block">Platform Name</label><input value={platformName} onChange={e => setPlatformName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400" /></div>
                    <div><label className="text-sm font-medium text-slate-600 mb-1.5 block">Support Email</label><input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400" /></div>
                    <div><label className="text-sm font-medium text-slate-600 mb-1.5 block">Default Currency</label>
                        <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400">
                            <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option>
                        </select>
                    </div>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"><SaveIcon size={16} /> Save</button>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"><div><p className="text-sm font-medium text-slate-700">Allow Public Registration</p><p className="text-xs text-slate-400">Let anyone create a buyer account</p></div><Toggle checked={allowRegistration} onChange={() => setAllowRegistration(!allowRegistration)} /></label>
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"><div><p className="text-sm font-medium text-slate-700">Require Store Approval</p><p className="text-xs text-slate-400">Admin must approve new seller stores</p></div><Toggle checked={requireStoreApproval} onChange={() => setRequireStoreApproval(!requireStoreApproval)} /></label>
                    <label className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"><div><p className="text-sm font-medium text-red-700">Maintenance Mode</p><p className="text-xs text-red-400">Show maintenance page to all non-admin users</p></div><Toggle checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} /></label>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"><SaveIcon size={16} /> Save</button>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700">Admin Email Notifications</h3>
                    {[{ l: 'New store applications', d: 'When a seller applies for a store' }, { l: 'High-value orders', d: 'Orders above $500' }, { l: 'User reports', d: 'When users submit complaints' }, { l: 'Daily digest', d: 'Summary of platform activity' }].map((item, i) => (
                        <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                            <div><p className="text-sm font-medium text-slate-700">{item.l}</p><p className="text-xs text-slate-400">{item.d}</p></div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <div className="w-9 h-5 bg-green-600 rounded-full" />
                                <div className="absolute left-5 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </label>
                    ))}
                    <button onClick={handleSave} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"><SaveIcon size={16} /> Save</button>
                </div>
            )}

            {activeTab === 'appearance' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                    <div><label className="text-sm font-medium text-slate-600 mb-1.5 block">Primary Color</label>
                        <div className="flex gap-2">{['#f97316', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b'].map(c => <div key={c} className="w-10 h-10 rounded-lg cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-orange-400 transition" style={{ background: c }} />)}</div>
                    </div>
                    <div><label className="text-sm font-medium text-slate-600 mb-1.5 block">Footer Text</label><input defaultValue="ShopPilot AI — Smart Shopping, Powered by Intelligence" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400" /></div>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"><SaveIcon size={16} /> Save</button>
                </div>
            )}
        </div>
    )
}
