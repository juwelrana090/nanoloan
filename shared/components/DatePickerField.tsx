import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerFieldProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
}

// Outputs ISO 8601 (YYYY-MM-DD) — what the API expects
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Displays DD/MM/YYYY to the user
function displayDate(isoValue: string): string {
  if (!isoValue) return '';
  const parts = isoValue.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return isoValue;
}

// Parses ISO 8601 (YYYY-MM-DD) back to a Date object
function parseDate(value: string): Date {
  if (!value) return new Date();
  const parts = value.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const parsed = new Date(y, m, d);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

const isAndroid = Platform.OS === 'android';

export default function DatePickerField({ value, onChange, disabled }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(() => parseDate(value));

  const currentDate = parseDate(value);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 10);

  const handleAndroidChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (selected) {
      onChange(formatDate(selected));
    }
  };

  const handleConfirm = () => {
    setShow(false);
    onChange(formatDate(tempDate));
  };

  const handleOpen = () => {
    if (disabled) return;
    setTempDate(currentDate);
    setShow(true);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleOpen}
        className="h-[52px] bg-[#E4F7EE] rounded-full px-5 flex-row items-center justify-between"
      >
        <Text className={`text-[15px] ${value ? 'text-[#1A1A1A]' : 'text-[#A0C4B0]'}`}>
          {displayDate(value) || 'DD/MM/YYYY'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#00C897" />
      </TouchableOpacity>

      {isAndroid && show && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="calendar"
          maximumDate={maxDate}
          onChange={handleAndroidChange}
        />
      )}

      {!isAndroid && (
        <Modal visible={show} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-3xl pb-8">
              <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-[15px] text-[#888]">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-[16px] font-semibold text-[#1A1A1A]">Date of Birth</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="text-[15px] font-semibold text-[#00C897]">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={maxDate}
                onChange={(_e, d) => d && setTempDate(d)}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
