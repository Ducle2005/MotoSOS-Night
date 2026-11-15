import { useCallback, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { MOCK_MECHANIC, VOUCHER_OPTIONS } from '../data/mockRescueData';
import type { RescueStep, ScopeApprovalItem, TrackingStatus, VoucherId } from '../types/rescue';
import { buildVoucherNotificationMessage } from '../utils/notificationLogic';
import { formatVnd } from '../utils/pricingAndSimLogic';

interface UseRescueOrderNotificationsArgs {
  step: RescueStep;
  trackingStatus: TrackingStatus;
  pickupTitle: string;
}

export function useRescueOrderNotifications({
  step,
  trackingStatus,
  pickupTitle,
}: UseRescueOrderNotificationsArgs) {
  const { triggerNotification, requestPushPermission } = useNotifications();
  const hasRequestedPushRef = useRef(false);
  const prevStatusRef = useRef<TrackingStatus>('searching');

  useEffect(() => {
    if (step === 'tracking' && trackingStatus === 'arrived' && prevStatusRef.current !== 'arrived') {
      triggerNotification({
        title: 'Thợ sửa xe đã tới điểm hẹn!',
        message: `${MOCK_MECHANIC.name} đang chờ bạn tại ${pickupTitle}.`,
        type: 'rescue',
        targetTab: 'map',
      });
    }
    prevStatusRef.current = trackingStatus;
  }, [step, trackingStatus, pickupTitle, triggerNotification]);

  const requestPushOnceOnFirstOrder = useCallback(() => {
    if (!hasRequestedPushRef.current) {
      hasRequestedPushRef.current = true;
      void requestPushPermission();
    }
  }, [requestPushPermission]);

  const notifyOrderSubmitted = useCallback(
    (issueSummary: string) =>
      triggerNotification({
        title: 'Đã gửi yêu cầu cứu hộ',
        message: `Đơn #MS-${String(Date.now()).slice(-4)} · ${issueSummary}`,
        type: 'rescue',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  const notifyMechanicAccepted = useCallback(
    () =>
      triggerNotification({
        title: 'Thợ Tuấn (4.9★) đã nhận đơn',
        message: `Biển số ${MOCK_MECHANIC.licensePlate} · Dự kiến ${MOCK_MECHANIC.etaMinutes} phút tới`,
        type: 'rescue',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  const notifyMechanicApproaching = useCallback(
    () =>
      triggerNotification({
        title: 'Thợ sắp tới điểm hẹn',
        message: 'Thợ chỉ còn cách bạn khoảng 200m, vui lòng chú ý điện thoại',
        type: 'rescue',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  const notifyMechanicReply = useCallback(
    (replyText: string) =>
      triggerNotification({
        title: 'Tin nhắn mới từ Thợ Tuấn',
        message: replyText,
        type: 'chat',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  const notifyVoucherApplied = useCallback(
    (voucherId: VoucherId | null) => {
      if (!voucherId) return;
      triggerNotification({
        title: 'Áp dụng ưu đãi thành công',
        message: buildVoucherNotificationMessage(voucherId, VOUCHER_OPTIONS),
        type: 'promo',
        targetTab: 'map',
      });
    },
    [triggerNotification],
  );

  const notifySosActivated = useCallback(
    (address: string) =>
      triggerNotification({
        title: 'Đã kích hoạt chế độ SOS',
        message: `Đã chia sẻ tọa độ GPS hiện tại (${address}) để hỗ trợ khẩn cấp.`,
        type: 'safety',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  const notifyOtpConfirmed = useCallback(
    (otp: string) =>
      triggerNotification({
        title: 'Đã xác thực OTP thợ',
        message: `Thợ ${MOCK_MECHANIC.name} đã xác thực mã #${otp} thành công và đang bắt đầu sửa xe.`,
        type: 'safety',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  const notifyOrderCancelled = useCallback(
    (feeAmount: number) =>
      triggerNotification({
        title: 'Đã hủy chuyến cứu hộ',
        message: feeAmount > 0 ? 'Đã lưu biên nhận phí hỗ trợ thợ di chuyển ban đêm 30.000đ.' : 'Hủy chuyến miễn phí thành công trong 3 phút đầu.',
        type: 'rescue',
        targetTab: 'home',
      }),
    [triggerNotification],
  );

  const notifyScopeApproved = useCallback(
    (item: ScopeApprovalItem) =>
      triggerNotification({
        title: 'Đã duyệt phát sinh linh kiện',
        message: `Đã duyệt ${item.title} (+${formatVnd(item.cost)}) • Hóa đơn đã cập nhật.`,
        type: 'safety',
        targetTab: 'map',
      }),
    [triggerNotification],
  );

  return {
    triggerNotification,
    requestPushOnceOnFirstOrder,
    notifyOrderSubmitted,
    notifyMechanicAccepted,
    notifyMechanicApproaching,
    notifyMechanicReply,
    notifyVoucherApplied,
    notifySosActivated,
    notifyOtpConfirmed,
    notifyOrderCancelled,
    notifyScopeApproved,
  };
}
