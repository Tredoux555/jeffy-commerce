'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, Package, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DeliverySlot {
  id: string;
  date: string;
  dayName: string;
  dayNumber: string;
  month: string;
  slots: Array<{
    id: string;
    time: string;
    available: boolean;
    price: number;
  }>;
}

interface DeliverySlotsProps {
  slots: DeliverySlot[];
  onSelect: (dateId: string, slotId: string) => void;
  selectedDate?: string;
  selectedSlot?: string;
}

export function DeliverySlotPicker({ slots, onSelect, selectedDate, selectedSlot }: DeliverySlotsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleDays = 5;

  const visibleSlots = slots.slice(startIndex, startIndex + visibleDays);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + visibleDays < slots.length;

  const selectedDaySlots = slots.find(s => s.id === selectedDate)?.slots || [];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#ff6b35]" />
          Select Delivery Date
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartIndex(i => Math.max(0, i - 1))}
            disabled={!canGoBack}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex-1 grid grid-cols-5 gap-2">
            {visibleSlots.map((day) => {
              const isSelected = selectedDate === day.id;
              const hasAvailable = day.slots.some(s => s.available);
              
              return (
                <button
                  key={day.id}
                  onClick={() => hasAvailable && onSelect(day.id, '')}
                  disabled={!hasAvailable}
                  className={`p-3 rounded-xl border-2 text-center transition ${
                    isSelected
                      ? 'border-[#ff6b35] bg-orange-50'
                      : hasAvailable
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <p className="text-xs text-gray-500">{day.dayName}</p>
                  <p className="text-2xl font-bold">{day.dayNumber}</p>
                  <p className="text-xs text-gray-500">{day.month}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStartIndex(i => Math.min(slots.length - visibleDays, i + 1))}
            disabled={!canGoForward}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#ff6b35]" />
            Select Time Slot
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedDaySlots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              
              return (
                <button
                  key={slot.id}
                  onClick={() => slot.available && onSelect(selectedDate, slot.id)}
                  disabled={!slot.available}
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    isSelected
                      ? 'border-[#ff6b35] bg-orange-50'
                      : slot.available
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed line-through'
                  }`}
                >
                  <p className="font-medium">{slot.time}</p>
                  <p className={`text-sm ${slot.price === 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {slot.price === 0 ? 'FREE' : formatCurrency(slot.price)}
                  </p>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#ff6b35] mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified delivery options
interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: 'standard' | 'express' | 'pickup';
}

interface DeliveryOptionsProps {
  options: DeliveryOption[];
  selected?: string;
  onSelect: (id: string) => void;
}

export function DeliveryOptions({ options, selected, onSelect }: DeliveryOptionsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'express': return <Truck className="h-6 w-6" />;
      case 'pickup': return <MapPin className="h-6 w-6" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selected === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${
              isSelected
                ? 'border-[#ff6b35] bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {getIcon(option.icon)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{option.name}</h4>
                <span className={`font-bold ${option.price === 0 ? 'text-green-600' : ''}`}>
                  {option.price === 0 ? 'FREE' : formatCurrency(option.price)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{option.description}</p>
              <p className="text-xs text-gray-500 mt-1">{option.estimatedDays}</p>
            </div>

            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-[#ff6b35] bg-[#ff6b35]' : 'border-gray-300'
            }`}>
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Generate sample delivery slots
export function generateDeliverySlots(daysAhead: number = 14): DeliverySlot[] {
  const slots: DeliverySlot[] = [];
  const today = new Date();
  
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // No Sunday delivery
    if (date.getDay() === 0) continue;
    
    slots.push({
      id: date.toISOString().split('T')[0],
      date: date.toISOString(),
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate().toString(),
      month: monthNames[date.getMonth()],
      slots: [
        { id: 'morning', time: '8AM - 12PM', available: Math.random() > 0.3, price: i <= 2 ? 12000 : 6500 },
        { id: 'afternoon', time: '12PM - 5PM', available: Math.random() > 0.2, price: 6500 },
        { id: 'evening', time: '5PM - 9PM', available: Math.random() > 0.4, price: 8500 },
      ]
    });
  }
  
  return slots;
}
