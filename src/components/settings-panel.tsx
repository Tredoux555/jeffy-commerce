'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Store, Mail, Truck, CreditCard, Globe, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoreSettings {
  general: {
    storeName: string;
    storeUrl: string;
    storeEmail: string;
    storePhone: string;
    currency: string;
    timezone: string;
    language: string;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingRate: number;
    processingTime: string;
  };
  payments: {
    payfast: { enabled: boolean; merchantId: string; merchantKey: string };
    ozow: { enabled: boolean; siteCode: string; privateKey: string };
    cod: { enabled: boolean; fee: number };
  };
  notifications: {
    orderConfirmation: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    lowStock: boolean;
    newCustomer: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
  };
}

const defaultSettings: StoreSettings = {
  general: {
    storeName: 'Jeffy Commerce',
    storeUrl: 'https://jeffy.co.za',
    storeEmail: 'hello@jeffy.co.za',
    storePhone: '+27 10 123 4567',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    language: 'en'
  },
  shipping: {
    freeShippingThreshold: 50000,
    defaultShippingRate: 6500,
    processingTime: '1-2 business days'
  },
  payments: {
    payfast: { enabled: true, merchantId: '', merchantKey: '' },
    ozow: { enabled: true, siteCode: '', privateKey: '' },
    cod: { enabled: false, fee: 5000 }
  },
  notifications: {
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStock: true,
    newCustomer: true
  },
  seo: {
    metaTitle: 'Jeffy Commerce - Eish, These Prices!',
    metaDescription: 'Shop amazing products at unbeatable prices. Fast delivery across South Africa.',
    googleAnalyticsId: '',
    facebookPixelId: ''
  }
};

interface SettingsPanelProps {
  settings?: StoreSettings;
  onSave: (settings: StoreSettings) => Promise<void>;
}

export function SettingsPanel({ settings = defaultSettings, onSave }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'seo', label: 'SEO', icon: Globe }
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-left ${
                activeTab === tab.id 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-xl border p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">General Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <input
                  type="text"
                  value={formData.general.storeName}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, storeName: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store URL</label>
                <input
                  type="url"
                  value={formData.general.storeUrl}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, storeUrl: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.general.storeEmail}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, storeEmail: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.general.storePhone}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, storePhone: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={formData.general.currency}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, currency: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ZAR">South African Rand (ZAR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  value={formData.general.timezone}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, timezone: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Shipping Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Free Shipping Threshold (cents)</label>
                <input
                  type="number"
                  value={formData.shipping.freeShippingThreshold}
                  onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, freeShippingThreshold: parseInt(e.target.value) || 0 }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Shipping Rate (cents)</label>
                <input
                  type="number"
                  value={formData.shipping.defaultShippingRate}
                  onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, defaultShippingRate: parseInt(e.target.value) || 0 }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Processing Time</label>
                <input
                  type="text"
                  value={formData.shipping.processingTime}
                  onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, processingTime: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Email Notifications</h2>
            
            <div className="space-y-3">
              {Object.entries(formData.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, [key]: e.target.checked }
                    })}
                    className="w-5 h-5 text-[#ff6b35] rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">SEO & Analytics</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  value={formData.seo.googleAnalyticsId}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, googleAnalyticsId: e.target.value }})}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={formData.seo.facebookPixelId}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, facebookPixelId: e.target.value }})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payments Settings */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Payment Methods</h2>
            <p className="text-sm text-gray-500">Configure your payment gateways</p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">PayFast</span>
                  <input
                    type="checkbox"
                    checked={formData.payments.payfast.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      payments: { ...formData.payments, payfast: { ...formData.payments.payfast, enabled: e.target.checked }}
                    })}
                    className="w-5 h-5 text-[#ff6b35] rounded"
                  />
                </label>
              </div>
              <div className="border rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">Ozow Instant EFT</span>
                  <input
                    type="checkbox"
                    checked={formData.payments.ozow.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      payments: { ...formData.payments, ozow: { ...formData.payments.ozow, enabled: e.target.checked }}
                    })}
                    className="w-5 h-5 text-[#ff6b35] rounded"
                  />
                </label>
              </div>
              <div className="border rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">Cash on Delivery</span>
                  <input
                    type="checkbox"
                    checked={formData.payments.cod.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      payments: { ...formData.payments, cod: { ...formData.payments.cod, enabled: e.target.checked }}
                    })}
                    className="w-5 h-5 text-[#ff6b35] rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t flex items-center justify-end gap-4">
          {saved && <span className="text-green-600 text-sm">Settings saved!</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
