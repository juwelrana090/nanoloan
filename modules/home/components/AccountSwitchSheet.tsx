import React from 'react';
import { useRef } from 'react';
import { Modal, TouchableOpacity, View, Text, Animated, PanResponder, ActivityIndicator, DimensionValue } from 'react-native';
import { ChevronRightIcon, SyncIcon } from '@/shared/components/UI/icons/svg-icons';
import type { BankAccount } from '@/modules/bank/types';

interface AccountSwitchSheetProps {
  sheetVisible: boolean;
  translateY: Animated.Value;
  sheetHeight: number;
  scrollPaddingBottom: DimensionValue;
  accounts: BankAccount[];
  accountsLoading: boolean;
  settingPrimary: boolean;
  onCloseSheet: () => void;
  onSwitchAccount: (accountId: string) => void;
  onRefetchAccounts: () => void;
  maskAccountNumber: (num: string) => string;
  formatTaka: (amount: number) => string;
}

export const AccountSwitchSheet: React.FC<AccountSwitchSheetProps> = ({
  sheetVisible,
  translateY,
  sheetHeight,
  scrollPaddingBottom,
  accounts,
  accountsLoading,
  settingPrimary,
  onCloseSheet,
  onSwitchAccount,
  onRefetchAccounts,
  maskAccountNumber,
  formatTaka,
}) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) onCloseSheet();
        else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Modal visible={sheetVisible} transparent animationType="none">
      <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={onCloseSheet} />
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: sheetHeight,
          transform: [{ translateY }],
          backgroundColor: 'white',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: scrollPaddingBottom,
        }}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} className="items-center pb-4 pt-3">
          <View className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </View>

        <View className="px-5">
          <Text className="mb-4 text-[18px] font-bold text-[#1A1A1A]">My Accounts</Text>

          {/* Sync row */}
          <TouchableOpacity
            onPress={onRefetchAccounts}
            className="mb-4 h-[46px] flex-row items-center gap-2 rounded-xl bg-[#F5F5F5] px-4">
            <SyncIcon color="#00C897" size={17} />
            <Text className="flex-1 text-[13px] text-[#555]">Tap to see recent added accounts</Text>
            {accountsLoading ? (
              <ActivityIndicator size="small" color="#00C897" />
            ) : (
              <Text className="text-[13px] font-bold text-[#00C897]">Sync</Text>
            )}
          </TouchableOpacity>

          {/* Account list */}
          {accountsLoading ? (
            <>
              <View className="mb-3 h-[64px] rounded-2xl bg-[#F0F0F0]" />
              <View className="mb-3 h-[64px] rounded-2xl bg-[#F0F0F0]" />
            </>
          ) : (
            accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => onSwitchAccount(acc.id)}
                activeOpacity={0.8}
                disabled={settingPrimary}
                className={`mb-3 h-[64px] flex-row items-center justify-between rounded-2xl px-4 ${
                  acc.isPrimary ? 'border border-[#00C897] bg-[#E4F7EE]' : 'bg-[#F9F9F9]'
                }`}>
                <View>
                  <Text className="text-[15px] font-bold text-[#1A1A1A]">
                    {acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()}
                  </Text>
                  <Text className="text-[13px] text-[#888]">{maskAccountNumber(acc.accountNumber)}</Text>
                  <Text className="text-[12px] font-semibold text-[#00C897]">
                    {formatTaka(acc.balance)}
                  </Text>
                </View>
                <ChevronRightIcon color={acc.isPrimary ? '#00C897' : '#CCC'} size={18} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};
